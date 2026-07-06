from collections import defaultdict

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.mongo_viewset import MongoModelViewSet
from process.models import PitStatus
from reports.models import DC, Logsheet, Measurable
from reports.serializers import DCSerializer, LogsheetSerializer, MeasurableSerializer


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
    p = request.query_params
    from_date, to_date = p.get('from_date'), p.get('to_date')
    location, pit_id = p.get('location'), p.get('pit_id')

    by_date = defaultdict(list)
    for m in Measurable.objects(is_deleted=False):
        by_date[m.entry_date].append(m)

    rows = []
    for ps in PitStatus.objects(is_deleted=False, org_status='4').order_by('entry_date'):
        d = ps.entry_date.isoformat() if ps.entry_date else ''
        if from_date and d < from_date:
            continue
        if to_date and d > to_date:
            continue
        if pit_id and (not ps.pit or ps.pit.unique_id != pit_id):
            continue
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
