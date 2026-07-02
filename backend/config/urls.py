from django.http import JsonResponse
from django.urls import path

from accounts.views import login, logout, me


def health(request):
    return JsonResponse({'status': 1, 'msg': 'ok'})


urlpatterns = [
    path('api/health', health, name='health'),
    path('api/auth/login', login, name='login'),
    path('api/auth/logout', logout, name='logout'),
    path('api/auth/me', me, name='me'),
]
