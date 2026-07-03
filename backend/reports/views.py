from core.mongo_viewset import MongoModelViewSet
from reports.models import DC, Logsheet, Measurable
from reports.serializers import DCSerializer, LogsheetSerializer, MeasurableSerializer


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
