from collections import defaultdict

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.mongo_viewset import MongoModelViewSet
from process.models import EggProcess, PitStatus, StatusUpdate
from reports.models import DC, Logsheet, Measurable, Reject, RejectImage
from reports.serializers import (
    DCSerializer, LogsheetSerializer, MeasurableSerializer,
    RejectSerializer, RejectImageSerializer,
)


_LOCATION_LABELS = {'1': 'Weigh Bridge Side', '2': 'Solar Side'}


def _paginate(request, rows):
    page = max(int(request.query_params.get('page', 1) or 1), 1)
    size = int(request.query_params.get('page_size', 10) or 10)
    start = (page - 1) * size
    return Response({'count': len(rows), 'results': rows[start:start + size]})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def measurable_report(request):
    """Replaces legacy measurable_report/crud.php: PitStatus (org_status='4',
    Measurement) LEFT JOIN Measurable on entry_date. Filters: from_date, to_date,
    location, pit_id."""
    from datetime import date

    p = request.query_params
    from_date, to_date = p.get('from_date'), p.get('to_date')
    location, pit_id = p.get('location'), p.get('pit_id')

    # Build DB filter for PitStatus — date range at query time
    ps_filter = {'is_deleted': False, 'org_status': '4'}
    if from_date:
        ps_filter['entry_date__gte'] = date.fromisoformat(from_date)
    if to_date:
        ps_filter['entry_date__lte'] = date.fromisoformat(to_date)

    by_date = defaultdict(list)
    for m in Measurable.objects(is_deleted=False):
        by_date[m.entry_date].append(m)

    rows = []
    for ps in PitStatus.objects(**ps_filter).order_by('entry_date'):
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
    from datetime import date, timedelta

    p = request.query_params
    from_date, to_date = p.get('from_date'), p.get('to_date')
    batch_id, supplier_name = p.get('batch_id'), p.get('supplier_name')

    # Build DB filter for EggProcess — date range at query time
    ep_filter = {'is_deleted': False}
    if from_date:
        ep_filter['entry_date__gte'] = date.fromisoformat(from_date)
    if to_date:
        ep_filter['entry_date__lte'] = date.fromisoformat(to_date)

    # ponytail: load all status updates once, index by batch unique_id
    status_by_batch = defaultdict(list)
    for su in StatusUpdate.objects(is_deleted=False):
        if su.batch:
            status_by_batch[su.batch.unique_id].append(su)

    # ponytail: load pit_status org_status='2' (baby larvae added) indexed by batch
    pit_by_batch = defaultdict(list)
    for ps in PitStatus.objects(is_deleted=False, org_status='2'):
        if ps.batch:
            pit_by_batch[ps.batch.unique_id].append(ps)

    rows = []
    for ep in EggProcess.objects(**ep_filter).order_by('-entry_date'):
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
        })
    return _paginate(request, rows)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pit_status_report(request):
    """Replaces legacy pit_status_report/crud.php: aggregates PitStatus records
    per pit+batch. Filters: from_date, to_date, pit_id, harvest_comp."""
    from datetime import date

    p = request.query_params
    from_date, to_date = p.get('from_date'), p.get('to_date')
    pit_id, harvest_comp = p.get('pit_id'), p.get('harvest_comp')

    # Build DB filter for PitStatus — date range at query time
    ps_filter = {'is_deleted': False}
    if from_date:
        ps_filter['entry_date__gte'] = date.fromisoformat(from_date)
    if to_date:
        ps_filter['entry_date__lte'] = date.fromisoformat(to_date)

    all_ps = PitStatus.objects(**ps_filter).order_by('entry_date')

    # Group by pit + form_batch_id prefix (PIT-<suffix>)
    batches = defaultdict(list)
    for ps in all_ps:
        if pit_id and (not ps.pit or ps.pit.unique_id != pit_id):
            continue
        # Group key = pit unique_id + batch prefix
        pit_uid = ps.pit.unique_id if ps.pit else ''
        # ponytail: form_batch_id like PIT-WB01-00001; group by pit
        batches[(pit_uid, ps.form_batch_id)].append(ps)

    rows = []
    for (pit_uid, batch_id), entries in batches.items():
        pit_name = entries[0].pit.pit_name if entries[0].pit else ''
        dates = [e.entry_date for e in entries if e.entry_date]
        start_date = min(dates).isoformat() if dates else ''
        end_date = max(dates).isoformat() if dates else ''

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

        if harvest_comp and h_comp != harvest_comp:
            continue

        rows.append({
            'pit_name': pit_name,
            'batch_id': batch_id,
            'process_dates': f"{start_date} / {end_date}",
            'baby_larvae': f"{larvae_dates} ({larvae_added} kg)" if larvae_added else '—',
            'feed_qty': round(feed_qty, 2),
            'tippi_qty': round(tippi_qty, 2),
            'larvae_harvested': round(larvae_harvested, 2),
            'manure_rejects': f"{round(manure_1, 2)} / {round(manure_2 + manure_3, 2)} / {round(rejects, 2)}",
            'harvest_status': h_comp or 'pending',
        })
    return _paginate(request, rows)


class MeasurableViewSet(MongoModelViewSet):
    document_class = Measurable
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


class LogsheetViewSet(MongoModelViewSet):
    document_class = Logsheet
    serializer_class = LogsheetSerializer
    required_screens = {
        'list': 'logsheet_view',
        'retrieve': 'logsheet_view',
        'create': 'logsheet_create',
        'update': 'logsheet_edit',
        'destroy': 'logsheet_delete',
    }


class DCViewSet(MongoModelViewSet):
    document_class = DC
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


class RejectViewSet(MongoModelViewSet):
    document_class = Reject
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
    from datetime import date

    p = request.query_params
    from_date, to_date = p.get('from_date'), p.get('to_date')

    # Build DB filter for Reject — date range at query time
    r_filter = {'is_deleted': False}
    if from_date:
        r_filter['date__gte'] = date.fromisoformat(from_date)
    if to_date:
        r_filter['date__lte'] = date.fromisoformat(to_date)

    # ponytail: pre-fetch all images once, indexed by ticket_no (eliminates N+1)
    img_tickets = set(RejectImage.objects(is_deleted=False).distinct('ticket_no'))

    rows = []
    for r in Reject.objects(**r_filter).order_by('-date'):
        d = r.date.isoformat() if r.date else ''
        has_image = r.ticket_no in img_tickets
        rows.append({
            'ticket_no': r.ticket_no,
            'vehicle_no': r.vehicle_no,
            'vendor': r.vendor,
            'date': d,
            'time': r.time,
            'empty_weight': r.empty_weight,
            'loaded_weight': r.loaded_weight,
            'net_weight': r.net_weight,
            'has_image': has_image,
        })
    return _paginate(request, rows)


class RejectImageViewSet(MongoModelViewSet):
    document_class = RejectImage
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
