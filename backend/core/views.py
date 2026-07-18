from core.models import MainScreen, Screen
from core.viewset import BaseModelViewSet
from core.serializers import MainScreenSerializer, ScreenSerializer


class MainScreenViewSet(BaseModelViewSet):
    queryset = MainScreen.objects.all()
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


class ScreenViewSet(BaseModelViewSet):
    queryset = Screen.objects.all()
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
