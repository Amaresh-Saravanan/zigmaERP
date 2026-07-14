"""Dashboard aggregates — replaces legacy folders/dashboard/api.php.

Everything here is derived from Mongo (pit_status, egg_process, trays). The
legacy `inward` / `inward_rejects` KPIs came from a *separate* external MySQL DB
(zigmaglobal.in / bsf_transaction) that this service can't reach, so they are
returned as 0 until that feed is wired in — see INWARD note below.
"""
import math
from datetime import date

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from inventory.models import Tray
from process.models import EggProcess, PitStatus


def _f1(x):
    """Floor to 1 decimal, matching legacy floor(x*10)/10."""
    return math.floor((x or 0) * 10) / 10


def _ym(d):
    return d.strftime('%Y-%m') if d else ''


def _kpi_from(pit_rows, egg_rows):
    organic_waste = sum(p.feed_qty or 0 for p in pit_rows)
    larvae = sum(p.larvae_qty or 0 for p in pit_rows) / 1000
    rejects = sum(p.qty_rejets or 0 for p in pit_rows) / 1000
    manure = sum((p.qty_manure_1 or 0) + (p.qty_manure_2 or 0) for p in pit_rows) / 1000
    egg_hatching = sum(p.larvae_qty_in or 0 for p in pit_rows)
    egg_qty = sum(e.tot_qty or 0 for e in egg_rows) / 1000
    return {
        'inward': 0,           # external feed (bsf_transaction) — not available here
        'inward_rejects': 0,   # external feed (bsf_reject_transaction) — not available here
        'organic_waste': _f1(organic_waste),
        'egg_purchasing': _f1(egg_qty),
        'egg_hatching': _f1(egg_hatching),
        'larvae_harvested': _f1(larvae),
        'manure': _f1(manure),
        'processing_rejects': _f1(rejects),
    }


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    from datetime import timedelta

    month = (request.data.get('month') if request.method == 'POST' else request.query_params.get('month')) \
        or date.today().strftime('%Y-%m')

    # Parse month into (year, month_no) for date range query
    y, m = map(int, month.split('-'))
    month_start = date(y, m, 1)
    # Calculate first day of next month (or handle Dec→Jan edge)
    if m == 12:
        month_end = date(y + 1, 1, 1)
    else:
        month_end = date(y, m + 1, 1)

    # ponytail: overall loads all records (inherent without aggregation pipeline).
    # Upgrade path: use MongoDB aggregation for _kpi_from sums.
    pit_all = list(PitStatus.objects(is_deleted=False).only(
        'entry_date', 'pit', 'org_status', 'form_batch_id',
        'feed_qty', 'larvae_qty', 'larvae_qty_in', 'qty_rejets', 'qty_manure_1', 'qty_manure_2'
    ))
    egg_all = list(EggProcess.objects(is_deleted=False).only(
        'entry_date', 'tot_qty', 'tray_utilized'
    ))

    # Month-filtered rows: query at DB, not Python
    pit_month = list(PitStatus.objects(
        is_deleted=False,
        entry_date__gte=month_start,
        entry_date__lt=month_end
    ).only(
        'entry_date', 'pit', 'org_status', 'form_batch_id',
        'feed_qty', 'larvae_qty', 'larvae_qty_in', 'qty_rejets', 'qty_manure_1', 'qty_manure_2'
    ))
    egg_month = list(EggProcess.objects(
        is_deleted=False,
        entry_date__gte=month_start,
        entry_date__lt=month_end
    ).only(
        'entry_date', 'tot_qty', 'tray_utilized'
    ))

    # ── pit_chart: per pit, most-recent batch → batch age + total feed ──
    # ponytail: batch age = days since first feed entry of the batch; skips the
    # legacy harvest-complete edge cases (good enough for the bar chart).
    by_pit = {}
    for p in pit_month:
        pit_name = p.pit.pit_name if p.pit else '—'
        by_pit.setdefault(pit_name, []).append(p)

    chart = []
    for pit_name, rows in by_pit.items():
        recent_batch = max((r.form_batch_id for r in rows), default='')
        batch_rows = [r for r in rows if r.form_batch_id == recent_batch]
        feed_qty = sum(r.feed_qty or 0 for r in batch_rows)
        feed_dates = [r.entry_date for r in batch_rows if r.org_status == '1' and r.entry_date]
        batch_age = (date.today() - min(feed_dates)).days + 1 if feed_dates else 0
        chart.append({'category': pit_name, 'data': batch_age,
                      'feed_qty': int(feed_qty), 'batch_id': recent_batch})
    chart.sort(key=lambda c: c['category'], reverse=True)

    pit_chart = {
        'categories': [c['category'] for c in chart],
        'data': [c['data'] for c in chart],
        'feed_qty': [c['feed_qty'] for c in chart],
        'batch_ids': [c['batch_id'] for c in chart],
    }

    # ── tray_status: egg-process tray usage bucketed by age (1-5 days, >5) ──
    buckets = [{'tray_age': i + 1, 'tray_utilized': 0} for i in range(5)]
    above_five = 0
    for e in egg_month:
        if not e.entry_date:
            continue
        age = (date.today() - e.entry_date).days + 1
        if age <= 5:
            buckets[age - 1]['tray_utilized'] += e.tray_utilized or 0
        else:
            above_five += e.tray_utilized or 0
    buckets.append({'tray_age': 'Above 5 Days', 'tray_utilized': above_five})

    # ponytail: Mongo Tray has no "used" flag; count active non-TEST trays as the
    # unutilized pool. Add a used/free field on Tray if this needs to be exact.
    unutilized = Tray.objects(is_active=True, is_deleted=False,
                              bin_name__not__icontains='test').count()

    return Response({
        'status': 1,
        'msg': 'success',
        'data': {
            'kpi': _kpi_from(pit_month, egg_month),
            'overall': _kpi_from(pit_all, egg_all),
            'pit_chart': pit_chart,
            'tray_status': buckets,
            'unutilized_trays': unutilized,
        },
        'error': '',
    })
