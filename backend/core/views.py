from core.models import MainScreen, Screen
from core.mongo_viewset import MongoModelViewSet
from core.serializers import MainScreenSerializer, ScreenSerializer


class MainScreenViewSet(MongoModelViewSet):
    document_class = MainScreen
    serializer_class = MainScreenSerializer
    required_screens = {
        'list': 'main_screen_view',
        'retrieve': 'main_screen_view',
        'create': 'main_screen_create',
        'update': 'main_screen_edit',
        'destroy': 'main_screen_delete',
    }

    def filter_search(self, queryset, term):
        return queryset.filter(screen_main_name__icontains=term)


class ScreenViewSet(MongoModelViewSet):
    document_class = Screen
    serializer_class = ScreenSerializer
    required_screens = {
        'list': 'screen_view',
        'retrieve': 'screen_view',
        'create': 'screen_create',
        'update': 'screen_edit',
        'destroy': 'screen_delete',
    }

    def filter_search(self, queryset, term):
        return queryset.filter(screen_name__icontains=term)
