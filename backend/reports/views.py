import csv
from collections import defaultdict
from datetime import date, timedelta

from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.viewset import BaseModelViewSet
from process.models import EggProcess, MaterialReceived, PitStatus, StatusUpdate
from reports.models import DC, Logsheet, Measurable, Reject, RejectImage
from reports.serializers import (
    DCSerializer, LogsheetSerializer, MeasurableSerializer,
    RejectSerializer, RejectImageSerializer,
)


_LOCATION_LABELS = {'1': 'Weigh Bridge Side', '2': 'Solar Side'}


def _validation_error(message):
    return Response(
        {'status': 0, 'msg': 'validation_error', 'data': None, 'error': message},
        status=400,
    )


def _parse_date_param(params, key):
    """Parse an optional ISO date query param. Returns (value, error_response)."""
    raw = params.get(key)
    if not raw:
        return None, None
    try:
        return date.fromisoformat(raw), None
    except ValueError:
        return None, _validation_error(f"Invalid {key}: '{raw}' is not a valid date.")


def _paginate(request, rows):
    try:
        page = max(int(request.query_params.get('page', 1) or 1), 1)
        size = int(request.query_params.get('page_size', 10) or 10)
    except ValueError:
        return _validation_error('page and page_size must be integers.')
    start = (page - 1) * size
    return Response({
        'status': 1, 'msg': 'success',
        'data': {'count': len(rows), 'results': rows[start:start + size]},
        'error': '',
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def measurable_report(request):
    """Replaces legacy measurable_report/crud.php: PitStatus (org_status='4',
    Measurement) LEFT JOIN Measurable on entry_date. Filters: from_date, to_date,
    location, pit_id."""
    p = request.query_params
    location, pit_id = p.get('location'), p.get('pit_id')

    from_date, err = _parse_date_param(p, 'from_date')
    if err:
        return err
    to_date, err = _parse_date_param(p, 'to_date')
    if err:
        return err

    # Build DB filter for PitStatus — date range at query time
    ps_filter = {'is_deleted': False, 'org_status': '4'}
    if from_date:
        ps_filter['entry_date__gte'] = from_date
    if to_date:
        ps_filter['entry_date__lte'] = to_date

    by_date = defaultdict(list)
    for m in Measurable.objects.filter(is_deleted=False):
        by_date[m.entry_date].append(m)

    rows = []
    for ps in PitStatus.objects.filter(**ps_filter).order_by('entry_date'):
        if pit_id and (not ps.pit or ps.pit.unique_id != pit_id):
            continue
        d = ps.entry_date.isoformat() if ps.entry_date else ''
        # LEFT JOIN: emit one row per matching Measurable, or one null-filled row.
        for m in by_date.get(ps.entry_date, [None]):
            if location and (m is None or m.location != location):
                continue
            rows.append({
                'entry_date': d,
                'pit_name': ps.pit.pit_name if ps.pit else '',
                'temp_p': f'{ps.temp_start} - {ps.temp_mid} - {ps.temp_end}',
                'humi_p': f'{ps.humi_start} - {ps.humi_mid} - {ps.humi_end}',
                'location': _LOCATION_LABELS.get(m.location, m.location) if m else '',
                'temp': m.temp if m else '',
                'humi': m.humi if m else '',
                'remarks': m.remarks if m else '',
            })
    return _paginate(request, rows)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def egg_process_report(request):
    """Replaces legacy egg_process_report/crud.php: EggProcess joined with
    StatusUpdate (latest hatching status) and PitStatus (baby larvae added).
    Filters: from_date, to_date, batch_id, supplier_name."""
    from datetime import timedelta

    p = request.query_params
    batch_id, supplier_name = p.get('batch_id'), p.get('supplier_name')

    from_date, err = _parse_date_param(p, 'from_date')
    if err:
        return err
    to_date, err = _parse_date_param(p, 'to_date')
    if err:
        return err

    # Build DB filter for EggProcess — date range at query time
    ep_filter = {'is_deleted': False}
    if from_date:
        ep_filter['entry_date__gte'] = from_date
    if to_date:
        ep_filter['entry_date__lte'] = to_date

    # ponytail: load all status updates once, index by batch unique_id
    status_by_batch = defaultdict(list)
    for su in StatusUpdate.objects.filter(is_deleted=False):
        if su.batch:
            status_by_batch[su.batch.unique_id].append(su)

    # ponytail: load pit_status org_status='2' (baby larvae added) indexed by batch
    pit_by_batch = defaultdict(list)
    for ps in PitStatus.objects.filter(is_deleted=False, org_status='2'):
        if ps.batch:
            pit_by_batch[ps.batch.unique_id].append(ps)

    rows = []
    for ep in EggProcess.objects.filter(**ep_filter).order_by('-entry_date'):
        batch_uid = ep.batch.unique_id if ep.batch else ''
        if batch_id and batch_uid != batch_id:
            continue

        sup_name = ep.supplier.supplier_name if ep.supplier else ''
        if supplier_name and sup_name != supplier_name:
            continue

        d = ep.entry_date.isoformat() if ep.entry_date else ''

        # Latest status update for this batch
        statuses = status_by_batch.get(batch_uid, [])
        latest_su = max(statuses, key=lambda s: s.day, default=None)
        hatching_status = latest_su.hatching_status if latest_su else 'pending'
        egg_cycle = latest_su.day if latest_su else 0

        # End date = entry_date + cycle days
        end_date = ''
        if ep.entry_date and egg_cycle:
            end_date = (ep.entry_date + timedelta(days=egg_cycle)).isoformat()

        # Pit info where baby larvae were added from this batch
        pits = pit_by_batch.get(batch_uid, [])
        pit_names = ', '.join(ps.pit.pit_name for ps in pits if ps.pit) or '—'
        larvae_qty = sum(ps.larvae_qty_in or 0 for ps in pits) or '—'

        # Addon details
        addon_details = ', '.join(
            f"{a.item.item_name}: {a.qty}" for a in (ep.addons or []) if a.item
        ) or '—'

        rows.append({
            'hatching_dates': f"{d} / {end_date}" if end_date else d,
            'batch_id': ep.batch.batch_id if ep.batch else '',
            'egg_qty': ep.tot_qty,
            'tray_utilized': ep.tray_utilized,
            'addon_details': addon_details,
            'egg_cycle': egg_cycle,
            'pit_names': pit_names,
            'larvae_qty': larvae_qty,
            'hatching_status': hatching_status,
            'supplier_name': sup_name,
            'invoice_image': ep.batch.invoice_no if ep.batch else '',
            'entry_person': ep.staff.user_name if ep.staff else '',
        })
    return _paginate(request, rows)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pit_status_report(request):
    """Replaces legacy pit_status_report/crud.php: aggregates PitStatus records
    per pit+batch. Filters: from_date, to_date, pit_id, harvest_comp, org_status.
    Supports ?format=excel for CSV download."""
    p = request.query_params
    pit_id, harvest_filter = p.get('pit_id'), p.get('harvest_comp')
    org_status = p.get('org_status')
    export_excel = p.get('format') == 'excel'

    from_date, err = _parse_date_param(p, 'from_date')
    if err:
        return err
    to_date, err = _parse_date_param(p, 'to_date')
    if err:
        return err

    # Build DB filter for PitStatus — date range at query time
    ps_filter = {'is_deleted': False}
    if from_date:
        ps_filter['entry_date__gte'] = from_date
    if to_date:
        ps_filter['entry_date__lte'] = to_date

    all_ps = PitStatus.objects.filter(**ps_filter).order_by('entry_date')

    # Group by pit + form_batch_id prefix (PIT-<suffix>)
    batches = defaultdict(list)
    for ps in all_ps:
        if pit_id and (not ps.pit or ps.pit.unique_id != pit_id):
            continue
        if org_status and ps.org_status != org_status:
            continue
        # Group key = pit unique_id + batch prefix
        pit_uid = ps.pit.unique_id if ps.pit else ''
        # ponytail: form_batch_id like PIT-WB01-00001; group by pit
        batches[(pit_uid, ps.form_batch_id)].append(ps)

    # Pre-fetch outside temp/humidity from Measurable for the date range
    meas_filter = {'is_deleted': False}
    if from_date:
        meas_filter['entry_date__gte'] = from_date
    if to_date:
        meas_filter['entry_date__lte'] = to_date
    meas_by_date = defaultdict(lambda: {'temps': [], 'humis': []})
    for m in Measurable.objects.filter(**meas_filter):
        d = m.entry_date
        meas_by_date[d]['temps'].append(m.temp)
        meas_by_date[d]['humis'].append(m.humi)

    # Pre-fetch egg added from MaterialReceived
    batch_ids = set()
    for entries in batches.values():
        for e in entries:
            if e.batch:
                batch_ids.add(e.batch.unique_id)
    egg_by_batch = {}
    if batch_ids:
        for mr in MaterialReceived.objects.filter(unique_id__in=batch_ids, is_deleted=False):
            egg_by_batch[mr.unique_id] = mr.qty or 0

    rows = []
    for (pit_uid, batch_id), entries in batches.items():
        pit_name = entries[0].pit.pit_name if entries[0].pit else ''
        dates = [e.entry_date for e in entries if e.entry_date]
        start_date = min(dates) if dates else None
        end_date = max(dates) if dates else None

        # Processing days
        tot_days = (end_date - start_date).days + 1 if start_date and end_date else 0

        # Baby larvae added (org_status='2')
        larvae_entries = [e for e in entries if e.org_status == '2']
        larvae_added = sum(e.larvae_qty_in or 0 for e in larvae_entries)
        larvae_dates = ', '.join(e.entry_date.isoformat() for e in larvae_entries if e.entry_date) or '—'

        # Feed qty (org_status='1')
        feed_qty = sum(e.feed_qty or 0 for e in entries if e.org_status == '1')

        # Tippi qty (org_status='7')
        tippi_qty = sum(e.tippi_qty or 0 for e in entries if e.org_status == '7')

        # Harvest (org_status='5')
        harvest_entries = [e for e in entries if e.org_status == '5']
        larvae_harvested = sum(e.larvae_qty or 0 for e in harvest_entries)
        manure_1 = sum(e.qty_manure_1 or 0 for e in harvest_entries)
        manure_2 = sum(e.qty_manure_2 or 0 for e in harvest_entries)
        manure_3 = sum(e.qty_manure_3 or 0 for e in harvest_entries)
        rejects = sum(e.qty_rejets or 0 for e in harvest_entries)
        h_comp = harvest_entries[-1].harvest_comp if harvest_entries else 'pending'

        if harvest_filter and h_comp != harvest_filter:
            continue

        # Egg added from MaterialReceived
        batch_uid = entries[0].batch.unique_id if entries[0].batch else ''
        egg_add = egg_by_batch.get(batch_uid, 0)

        # Inside avg temp/humidity from measurement entries (org_status='4')
        measure_entries = [e for e in entries if e.org_status == '4']
        if measure_entries:
            in_temps = [(e.temp_start or 0) + (e.temp_mid or 0) + (e.temp_end or 0) for e in measure_entries]
            in_humis = [(e.humi_start or 0) + (e.humi_mid or 0) + (e.humi_end or 0) for e in measure_entries]
            in_temp_avg = round(sum(in_temps) / (len(in_temps) * 3), 1) if in_temps else 0
            in_humi_avg = round(sum(in_humis) / (len(in_humis) * 3), 1) if in_humis else 0
        else:
            in_temp_avg = 0
            in_humi_avg = 0

        # Outside avg temp/humidity from Measurable
        out_temp_avg = 0
        out_humi_avg = 0
        if start_date and end_date:
            temps_all, humis_all = [], []
            current = start_date
            while current <= end_date:
                md = meas_by_date.get(current)
                if md:
                    temps_all.extend(md['temps'])
                    humis_all.extend(md['humis'])
                current = timedelta(days=1) + current
            out_temp_avg = round(sum(temps_all) / len(temps_all), 1) if temps_all else 0
            out_humi_avg = round(sum(humis_all) / len(humis_all), 1) if humis_all else 0

        rows.append({
            'pit_name': pit_name,
            'batch_id': batch_id,
            'start_date': start_date.isoformat() if start_date else '',
            'end_date': end_date.isoformat() if end_date else '',
            'tot_days': tot_days,
            'egg_add': round(egg_add, 1),
            'larvae_added': larvae_added,
            'feed_qty': round(feed_qty, 2),
            'tippi_qty': round(tippi_qty, 2),
            'larvae_harvested': round(larvae_harvested, 2),
            'manure_1': round(manure_1, 2),
            'manure_2': round(manure_2, 2),
            'manure_3': round(manure_3, 2),
            'rejects': round(rejects, 2),
            'in_temp_avg': in_temp_avg,
            'out_temp_avg': out_temp_avg,
            'in_humi_avg': in_humi_avg,
            'out_humi_avg': out_humi_avg,
            'harvest_status': h_comp or 'pending',
            # Legacy display fields for non-Excel view
            'process_dates': f"{start_date.isoformat() if start_date else ''} / {end_date.isoformat() if end_date else ''}",
            'baby_larvae': f"{larvae_dates} ({larvae_added} kg)" if larvae_added else '—',
            'manure_rejects': f"{round(manure_1, 2)} / {round(manure_2 + manure_3, 2)} / {round(rejects, 2)}",
        })

    if export_excel:
        return _export_pit_status_csv(rows, from_date, to_date)

    return _paginate(request, rows)


def _export_pit_status_csv(rows, from_date, to_date):
    """Generate CSV download matching legacy overall_excel.php columns."""
    response = HttpResponse(content_type='text/csv')
    date_str = date.today().strftime('%d-%m-%Y %H:%M:%S')
    response['Content-Disposition'] = f'attachment; filename="pit_status_report_{date_str}.csv"'

    writer = csv.writer(response)
    # Header rows matching legacy format
    writer.writerow(['LOG SHEET', '', '', '', '', '', '', '', '', ''])
    writer.writerow([])
    writer.writerow([f'From Date: {from_date or ""}', '', '', f'To Date: {to_date or ""}'])
    writer.writerow([])
    # Column headers
    writer.writerow([
        'S.No', 'Pit Number', 'Pit Batch Id', 'Start Date', 'End Date',
        'Processing Days', 'Egg Added (g)', 'Baby Larvae Added (kg)',
        'Feed Qty (Tons)', 'Tippi Qty (Kg)', 'Live Larvae (Kg)',
        'Manure -4mm (Kg)', 'Manure +4mm (Kg)', 'Manure 20mm (Kg)', 'Rejects (Kg)',
        'Avg Inside Temp', 'Avg Outside Temp', 'Avg Inside Humidity', 'Avg Outside Humidity',
        'Harvest Status',
    ])

    for i, row in enumerate(rows, 1):
        writer.writerow([
            i,
            row['pit_name'],
            row['batch_id'],
            row['start_date'],
            row['end_date'],
            row['tot_days'],
            row['egg_add'],
            row['larvae_added'],
            row['feed_qty'],
            row['tippi_qty'],
            row['larvae_harvested'],
            row['manure_1'],
            row['manure_2'],
            row['manure_3'],
            row['rejects'],
            row['in_temp_avg'],
            row['out_temp_avg'],
            row['in_humi_avg'],
            row['out_humi_avg'],
            row['harvest_status'],
        ])

    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pit_status_detail(request):
    """Fetch all PitStatus records for a specific form_batch_id (for print view)."""
    batch_id = request.query_params.get('batch_id')
    if not batch_id:
        return _validation_error('batch_id is required.')

    entries = PitStatus.objects.filter(form_batch_id=batch_id, is_deleted=False).order_by('entry_date')
    if not entries:
        return _validation_error(f'No records found for batch {batch_id}.')

    pit_name = entries[0].pit.pit_name if entries[0].pit else ''
    dates = [e.entry_date for e in entries if e.entry_date]
    start_date = min(dates) if dates else None
    end_date = max(dates) if dates else None
    tot_days = (end_date - start_date).days + 1 if start_date and end_date else 0

    # Aggregates
    larvae_added = sum(e.larvae_qty_in or 0 for e in entries if e.org_status == '2')
    feed_qty = sum(e.feed_qty or 0 for e in entries if e.org_status == '1')
    tippi_qty = sum(e.tippi_qty or 0 for e in entries if e.org_status == '7')
    harvest_entries = [e for e in entries if e.org_status == '5']
    larvae_harvested = sum(e.larvae_qty or 0 for e in harvest_entries)
    manure_1 = sum(e.qty_manure_1 or 0 for e in harvest_entries)
    manure_2 = sum(e.qty_manure_2 or 0 for e in harvest_entries)
    manure_3 = sum(e.qty_manure_3 or 0 for e in harvest_entries)
    rejects = sum(e.qty_rejets or 0 for e in harvest_entries)
    h_comp = harvest_entries[-1].harvest_comp if harvest_entries else 'pending'

    # Inside temp/humidity
    measure_entries = [e for e in entries if e.org_status == '4']
    in_temp_avg = 0
    in_humi_avg = 0
    if measure_entries:
        in_temps = [(e.temp_start or 0) + (e.temp_mid or 0) + (e.temp_end or 0) for e in measure_entries]
        in_humis = [(e.humi_start or 0) + (e.humi_mid or 0) + (e.humi_end or 0) for e in measure_entries]
        in_temp_avg = round(sum(in_temps) / (len(in_temps) * 3), 1) if in_temps else 0
        in_humi_avg = round(sum(in_humis) / (len(in_humis) * 3), 1) if in_humis else 0

    # Outside temp/humidity
    meas_filter = {'is_deleted': False}
    if start_date:
        meas_filter['entry_date__gte'] = start_date
    if end_date:
        meas_filter['entry_date__lte'] = end_date
    temps_all, humis_all = [], []
    for m in Measurable.objects.filter(**meas_filter):
        temps_all.append(m.temp)
        humis_all.append(m.humi)
    out_temp_avg = round(sum(temps_all) / len(temps_all), 1) if temps_all else 0
    out_humi_avg = round(sum(humis_all) / len(humis_all), 1) if humis_all else 0

    # Egg added
    egg_add = 0
    batch_uid = entries[0].batch.unique_id if entries[0].batch else ''
    if batch_uid:
        mr = MaterialReceived.objects.filter(unique_id=batch_uid, is_deleted=False).first()
        if mr:
            egg_add = mr.qty or 0

    # Detail entries for the report
    detail_entries = []
    for e in entries:
        detail_entries.append({
            'entry_date': e.entry_date.isoformat() if e.entry_date else '',
            'org_status': e.org_status,
            'notes': e.notes or '',
            'feed_qty': e.feed_qty,
            'feed_count': e.feed_count,
            'larvae_qty_in': e.larvae_qty_in,
            'method': e.method or '',
            'temp_start': e.temp_start,
            'temp_mid': e.temp_mid,
            'temp_end': e.temp_end,
            'humi_start': e.humi_start,
            'humi_mid': e.humi_mid,
            'humi_end': e.humi_end,
            'larvae_qty': e.larvae_qty,
            'qty_manure_1': e.qty_manure_1,
            'qty_manure_2': e.qty_manure_2,
            'qty_manure_3': e.qty_manure_3,
            'qty_rejets': e.qty_rejets,
            'harvest_comp': e.harvest_comp or '',
            'tippi_qty': e.tippi_qty,
        })

    return Response({
        'status': 1,
        'data': {
            'pit_name': pit_name,
            'batch_id': batch_id,
            'start_date': start_date.isoformat() if start_date else '',
            'end_date': end_date.isoformat() if end_date else '',
            'tot_days': tot_days,
            'egg_add': round(egg_add, 1),
            'larvae_added': larvae_added,
            'feed_qty': round(feed_qty, 2),
            'tippi_qty': round(tippi_qty, 2),
            'larvae_harvested': round(larvae_harvested, 2),
            'manure_1': round(manure_1, 2),
            'manure_2': round(manure_2, 2),
            'manure_3': round(manure_3, 2),
            'rejects': round(rejects, 2),
            'in_temp_avg': in_temp_avg,
            'out_temp_avg': out_temp_avg,
            'in_humi_avg': in_humi_avg,
            'out_humi_avg': out_humi_avg,
            'harvest_status': h_comp or 'pending',
            'entries': detail_entries,
        },
    })


class MeasurableViewSet(BaseModelViewSet):
    queryset = Measurable.objects.all()
    serializer_class = MeasurableSerializer
    required_screens = {
        'list': 'measurable_view',
        'retrieve': 'measurable_view',
        'create': 'measurable_create',
        'update': 'measurable_edit',
        'destroy': 'measurable_delete',
    }

    def filter_search(self, queryset, term):
        return queryset.filter(location__icontains=term)


class LogsheetViewSet(BaseModelViewSet):
    queryset = Logsheet.objects.all()
    serializer_class = LogsheetSerializer
    required_screens = {
        'list': 'logsheet_view',
        'retrieve': 'logsheet_view',
        'create': 'logsheet_create',
        'update': 'logsheet_edit',
        'destroy': 'logsheet_delete',
    }


class DCViewSet(BaseModelViewSet):
    queryset = DC.objects.all()
    serializer_class = DCSerializer
    required_screens = {
        'list': 'dc_view',
        'retrieve': 'dc_view',
        'create': 'dc_create',
        'update': 'dc_edit',
        'destroy': 'dc_delete',
    }

    def filter_search(self, queryset, term):
        return queryset.filter(dc_number__icontains=term)


class RejectViewSet(BaseModelViewSet):
    queryset = Reject.objects.all()
    serializer_class = RejectSerializer
    required_screens = {
        'list': 'rejects_report_view',
        'retrieve': 'rejects_report_view',
        'create': 'rejects_report_create',
        'update': 'rejects_report_edit',
        'destroy': 'rejects_report_delete',
    }

    def filter_search(self, queryset, term):
        return queryset.filter(ticket_no__icontains=term)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rejects_report(request):
    """Paginated rejects list with date filtering for the report page."""
    p = request.query_params

    from_date, err = _parse_date_param(p, 'from_date')
    if err:
        return err
    to_date, err = _parse_date_param(p, 'to_date')
    if err:
        return err

    # Build DB filter for Reject — date range at query time
    r_filter = {'is_deleted': False}
    if from_date:
        r_filter['date__gte'] = from_date
    if to_date:
        r_filter['date__lte'] = to_date

    # ponytail: pre-fetch all images once, indexed by ticket_no (eliminates N+1)
    img_tickets = set(
        RejectImage.objects.filter(is_deleted=False).values_list('ticket_no', flat=True).distinct()
    )

    rows = []
    for r in Reject.objects.filter(**r_filter).order_by('-date'):
        d = r.date.isoformat() if r.date else ''
        has_image = r.ticket_no in img_tickets
        rows.append({
            'ticket_no': r.ticket_no,
            'serial_no': r.serial_no or '',
            'vehicle_no': r.vehicle_no,
            'vendor': r.vendor,
            'date': d,
            'time': r.time,
            'empty_weight': round(r.empty_weight / 1000, 3) if r.empty_weight else 0,
            'loaded_weight': round(r.loaded_weight / 1000, 3) if r.loaded_weight else 0,
            'net_weight': round(r.net_weight / 1000, 3) if r.net_weight else 0,
            'empty_weight_date': r.empty_weight_date.isoformat() if r.empty_weight_date else '',
            'empty_weight_time': r.empty_weight_time or '',
            'load_weight_date': r.load_weight_date.isoformat() if r.load_weight_date else '',
            'load_weight_time': r.load_weight_time or '',
            'has_image': has_image,
        })
    return _paginate(request, rows)


class RejectImageViewSet(BaseModelViewSet):
    queryset = RejectImage.objects.all()
    serializer_class = RejectImageSerializer
    required_screens = {
        'list': 'rejects_image_upload_view',
        'retrieve': 'rejects_image_upload_view',
        'create': 'rejects_image_upload_create',
        'update': 'rejects_image_upload_edit',
        'destroy': 'rejects_image_upload_delete',
    }

    def filter_search(self, queryset, term):
        return queryset.filter(ticket_no__icontains=term)


# ── Reject print views ──

WEIGHMENT_CAM_BASE = 'http://zigmaglobal.in/weighment_portal_image/bsf_rejects'


def _build_cam_urls(serial_no):
    """Build the 4 camera image URLs from the weighment portal for a given serial_no."""
    if not serial_no:
        return []
    return [
        f'{WEIGHMENT_CAM_BASE}/cam2/{serial_no}FT.jpg',
        f'{WEIGHMENT_CAM_BASE}/cam1/{serial_no}FT.jpg',
        f'{WEIGHMENT_CAM_BASE}/cam2/{serial_no}ST.jpg',
        f'{WEIGHMENT_CAM_BASE}/cam1/{serial_no}ST.jpg',
    ]


def _ticket_print_payload(r):
    """Build a single ticket dict suitable for the print view."""
    images = list(RejectImage.objects.filter(
        ticket_no=r.ticket_no, is_deleted=False
    ).values_list('image_path', flat=True).distinct())
    cam_urls = _build_cam_urls(r.serial_no)
    return {
        'ticket_no': r.ticket_no,
        'serial_no': r.serial_no or '',
        'vehicle_no': r.vehicle_no,
        'vendor': r.vendor,
        'date': r.date.isoformat() if r.date else '',
        'time': r.time or '',
        'empty_weight': round(r.empty_weight / 1000, 3) if r.empty_weight else 0,
        'loaded_weight': round(r.loaded_weight / 1000, 3) if r.loaded_weight else 0,
        'net_weight': round(r.net_weight / 1000, 3) if r.net_weight else 0,
        'empty_weight_date': r.empty_weight_date.isoformat() if r.empty_weight_date else '',
        'empty_weight_time': r.empty_weight_time or '',
        'load_weight_date': r.load_weight_date.isoformat() if r.load_weight_date else '',
        'load_weight_time': r.load_weight_time or '',
        'cam_urls': cam_urls,
        'uploaded_images': images,
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rejects_print_detail(request):
    """Single ticket print receipt — replaces legacy print.php."""
    ticket_no = request.query_params.get('ticket_no')
    if not ticket_no:
        return _validation_error('ticket_no is required.')
    r = Reject.objects.filter(ticket_no=ticket_no, is_deleted=False).first()
    if not r:
        return _validation_error(f'Ticket "{ticket_no}" not found.')
    return Response({'status': 1, 'data': _ticket_print_payload(r), 'error': ''})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rejects_print_overall(request):
    """Batch print — replaces legacy print_overall.php. Returns all tickets in date range."""
    p = request.query_params
    from_date, err = _parse_date_param(p, 'from_date')
    if err:
        return err
    to_date, err = _parse_date_param(p, 'to_date')
    if err:
        return err

    r_filter = {'is_deleted': False}
    if from_date:
        r_filter['date__gte'] = from_date
    if to_date:
        r_filter['date__lte'] = to_date

    tickets = [_ticket_print_payload(r) for r in Reject.objects.filter(**r_filter).order_by('-date')]
    return Response({'status': 1, 'data': tickets, 'error': ''})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rejects_available_tickets(request):
    """Return ticket numbers from Reject that are NOT yet used in RejectImage.
    Replaces the legacy form.php filtering logic."""
    used = set(RejectImage.objects.filter(is_deleted=False).values_list('ticket_no', flat=True).distinct())
    tickets = (
        Reject.objects.filter(is_deleted=False)
        .order_by('-ticket_no')
        .only('ticket_no', 'vehicle_no', 'date', 'net_weight')
    )
    rows = []
    for t in tickets:
        if t.ticket_no not in used:
            rows.append({
                'ticket_no': t.ticket_no,
                'vehicle_no': t.vehicle_no,
                'date': t.date.isoformat() if t.date else '',
                'net_weight': t.net_weight,
            })
    return Response({'status': 1, 'data': rows, 'error': ''})
