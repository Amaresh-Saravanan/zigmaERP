from django.http import JsonResponse
from django.urls import include, path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter

from accounts.views import (
    UserTypeViewSet,
    UserViewSet,
    login,
    login_history_detail,
    login_history_report,
    logout,
    me,
)
from core.dashboard import dashboard
from core.views import MainScreenViewSet, ScreenViewSet, menu
from inventory.views import ItemViewSet, PitViewSet, SupplierViewSet, TrayViewSet, UnitViewSet
from process.views import (
    CullingProcessViewSet,
    DryProcessViewSet,
    EggProcessViewSet,
    FrpStatusUpdateViewSet,
    FrpTrayProcessViewSet,
    LeachateViewSet,
    MaterialReceivedViewSet,
    OvenProcessViewSet,
    PitStatusViewSet,
    StatusUpdateViewSet,
)
from reports.views import (
    MeasurableViewSet,
    LogsheetViewSet,
    DCViewSet,
    RejectViewSet,
    RejectImageViewSet,
    measurable_report,
    egg_process_report,
    pit_status_report,
    rejects_report,
)


def health(request):
    return JsonResponse({'status': 1, 'msg': 'ok'})


router = DefaultRouter(trailing_slash=False)
router.register(r'units', UnitViewSet, basename='unit')
router.register(r'items', ItemViewSet, basename='item')
router.register(r'trays', TrayViewSet, basename='tray')
router.register(r'pits', PitViewSet, basename='pit')
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'user-types', UserTypeViewSet, basename='user-type')
router.register(r'users', UserViewSet, basename='user')
router.register(r'main-screens', MainScreenViewSet, basename='main-screen')
router.register(r'screens', ScreenViewSet, basename='screen')
router.register(r'material-received', MaterialReceivedViewSet, basename='material-received')
router.register(r'culling-process', CullingProcessViewSet, basename='culling-process')
router.register(r'oven-process', OvenProcessViewSet, basename='oven-process')
router.register(r'dry-process', DryProcessViewSet, basename='dry-process')
router.register(r'leachate', LeachateViewSet, basename='leachate')
router.register(r'egg-process', EggProcessViewSet, basename='egg-process')
router.register(r'status-update', StatusUpdateViewSet, basename='status-update')
router.register(r'pit-status', PitStatusViewSet, basename='pit-status')
router.register(r'frp-tray-process', FrpTrayProcessViewSet, basename='frp-tray-process')
router.register(r'frp-status-update', FrpStatusUpdateViewSet, basename='frp-status-update')
router.register(r'measurable', MeasurableViewSet, basename='measurable')
router.register(r'logsheet', LogsheetViewSet, basename='logsheet')
router.register(r'dc', DCViewSet, basename='dc')
router.register(r'rejects', RejectViewSet, basename='reject')
router.register(r'reject-images', RejectImageViewSet, basename='reject-image')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def permission_catalog(request):
    """
    Every screen-permission id (e.g. 'item_view') any registered ViewSet actually
    enforces, grouped by URL prefix - derived from the router itself rather than a
    hand-maintained list, so it can't drift out of sync as modules are added.
    """
    catalog = {}
    for prefix, viewset, _basename in router.registry:
        required = getattr(viewset, 'required_screens', None)
        if required:
            catalog[prefix] = sorted(set(required.values()))
    return Response({'status': 1, 'msg': '', 'data': catalog, 'error': ''})


urlpatterns = [
    path('api/health', health, name='health'),
    path('api/auth/login', login, name='login'),
    path('api/auth/logout', logout, name='logout'),
    path('api/auth/me', me, name='me'),
    path('api/menu', menu, name='menu'),
    path('api/dashboard', dashboard, name='dashboard'),
    path('api/measurable-report', measurable_report, name='measurable-report'),
    path('api/egg-process-report', egg_process_report, name='egg-process-report'),
    path('api/pit-status-report', pit_status_report, name='pit-status-report'),
    path('api/rejects-report', rejects_report, name='rejects-report'),
    path('api/login-history-report', login_history_report, name='login-history-report'),
    path('api/login-history-detail', login_history_detail, name='login-history-detail'),
    path('api/permission-catalog', permission_catalog, name='permission-catalog'),
    path('api/', include(router.urls)),
]
