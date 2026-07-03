from django.urls import path, include
from rest_framework.routers import DefaultRouter
from process.views import (
    MaterialReceivedViewSet, EggProcessViewSet, StatusUpdateViewSet,
    CullingProcessViewSet, OvenProcessViewSet, DryProcessViewSet,
    LeachateViewSet, PitStatusViewSet, FrpTrayProcessViewSet, FrpStatusUpdateViewSet
)

router = DefaultRouter()
router.register(r'material-received', MaterialReceivedViewSet, basename='material-received')
router.register(r'egg-process', EggProcessViewSet, basename='egg-process')
router.register(r'status-update', StatusUpdateViewSet, basename='status-update')
router.register(r'culling-process', CullingProcessViewSet, basename='culling-process')
router.register(r'oven-process', OvenProcessViewSet, basename='oven-process')
router.register(r'dry-process', DryProcessViewSet, basename='dry-process')
router.register(r'leachate', LeachateViewSet, basename='leachate')
router.register(r'pit-status', PitStatusViewSet, basename='pit-status')
router.register(r'frp-tray-process', FrpTrayProcessViewSet, basename='frp-tray-process')
router.register(r'frp-status-update', FrpStatusUpdateViewSet, basename='frp-status-update')

urlpatterns = [
    path('', include(router.urls)),
]
