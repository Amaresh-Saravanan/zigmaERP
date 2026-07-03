from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts.models import AuthToken, User, UserType
from accounts.serializers import LoginSerializer, UserManageSerializer, UserSerializer, UserTypeManageSerializer
from core.mongo_viewset import MongoModelViewSet


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Request: { "user_name": "...", "password": "..." }
    Response (success): { "status": 1, "msg": "success_login", "data": { "access_token": "...", "user": {...} } }
    Response (fail): { "status": 0, "msg": "incorrect", "error": "..." }
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        errors = serializer.errors
        return Response({
            'status': 0,
            'msg': 'incorrect',
            'data': None,
            'error': str(next(iter(errors.values()))[0]) if errors else 'Invalid request',
        }, status=status.HTTP_401_UNAUTHORIZED)

    user = serializer.validated_data['user']
    token = AuthToken.for_user(user)

    return Response({
        'status': 1,
        'msg': 'success_login',
        'data': {
            'access_token': token.key,
            'user': UserSerializer(user).data,
        },
        'error': '',
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    AuthToken.objects(user=request.user).delete()
    return Response({'status': 1, 'msg': 'success_logout', 'data': None, 'error': ''})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({
        'status': 1,
        'msg': '',
        'data': UserSerializer(request.user).data,
        'error': '',
    })


class UserTypeViewSet(MongoModelViewSet):
    document_class = UserType
    serializer_class = UserTypeManageSerializer
    required_screens = {
        'list': 'user_type_view',
        'retrieve': 'user_type_view',
        'create': 'user_type_create',
        'update': 'user_type_edit',
        'destroy': 'user_type_delete',
    }

    def filter_search(self, queryset, term):
        return queryset.filter(type_name__icontains=term)


class UserViewSet(MongoModelViewSet):
    document_class = User
    serializer_class = UserManageSerializer
    required_screens = {
        'list': 'user_view',
        'retrieve': 'user_view',
        'create': 'user_create',
        'update': 'user_edit',
        'destroy': 'user_delete',
    }

    def filter_search(self, queryset, term):
        return queryset.filter(user_name__icontains=term)
