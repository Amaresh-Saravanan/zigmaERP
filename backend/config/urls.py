from django.http import JsonResponse
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from accounts.views import UserTypeViewSet, UserViewSet, login, logout, me
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

urlpatterns = [
    path('api/health', health, name='health'),
    path('api/auth/login', login, name='login'),
    path('api/auth/logout', logout, name='logout'),
    path('api/auth/me', me, name='me'),
    path('api/menu', menu, name='menu'),
    path('api/', include(router.urls)),
]
