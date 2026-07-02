from django.http import JsonResponse
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from accounts.views import login, logout, me
from core.views import menu
from inventory.views import ItemViewSet, UnitViewSet


def health(request):
    return JsonResponse({'status': 1, 'msg': 'ok'})


router = DefaultRouter(trailing_slash=False)
router.register(r'units', UnitViewSet, basename='unit')
router.register(r'items', ItemViewSet, basename='item')

urlpatterns = [
    path('api/health', health, name='health'),
    path('api/auth/login', login, name='login'),
    path('api/auth/logout', logout, name='logout'),
    path('api/auth/me', me, name='me'),
    path('api/menu', menu, name='menu'),
    path('api/', include(router.urls)),
]
