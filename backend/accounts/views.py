from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from collections import defaultdict
from datetime import datetime
from django.contrib.auth.hashers import check_password, make_password
from django_ratelimit.decorators import ratelimit

from accounts.models import AuthToken, LoginHistory, User, UserType
from accounts.serializers import LoginSerializer, UserManageSerializer, UserSerializer, UserTypeManageSerializer
from core.mongo_viewset import MongoModelViewSet


@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='5/m', method='POST', block=False)
def login(request):
    if getattr(request, 'limited', False):
        return Response({
            'status': 0, 'msg': 'rate_limited', 'data': None,
            'error': 'Too many requests. Please try again later.',
        }, status=status.HTTP_429_TOO_MANY_REQUESTS)

    """
    Request: { "user_name": "...", "password": "..." }
    Response (success): { "status": 1, "msg": "success_login", "data": { "access_token": "...", "user": {...} } }
    Response (fail): { "status": 0, "msg": "incorrect", "error": "..." }
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        errors = serializer.errors
        error_msg = str(next(iter(errors.values()))[0]) if errors else ''
        if 'inactive' in error_msg.lower():
            return Response({
                'status': 0,
                'msg': 'inactive_account',
                'data': None,
                'error': 'Your account is pending administrator activation.',
            }, status=status.HTTP_403_FORBIDDEN)
        return Response({
            'status': 0,
            'msg': 'incorrect',
            'data': None,
            'error': error_msg or 'Invalid request',
        }, status=status.HTTP_401_UNAUTHORIZED)

    user = serializer.validated_data['user']
    token = AuthToken.for_user(user)
    LoginHistory.record(user, log_type=1)

    return Response({
        'status': 1,
        'msg': 'success_login',
        'data': {
            'access_token': token.key,
            'user': UserSerializer(user).data,
            'must_change_password': user.must_change_password,
        },
        'error': '',
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='10/m', method='POST', block=False)
def register(request):
    if getattr(request, 'limited', False):
        return Response({
            'status': 0, 'msg': 'rate_limited', 'data': None,
            'error': 'Too many requests. Please try again later.',
        }, status=status.HTTP_429_TOO_MANY_REQUESTS)

    """
    Public self-registration. Creates an inactive user that requires admin approval.
    Request: { "first_name": "...", "last_name": "...", "user_name": "...", "user_email": "...", "password": "..." }
    Response (success): { "status": 1, "msg": "registered", "data": null, "error": "" }
    """
    data = request.data
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()
    user_name = data.get('user_name', '').strip()
    user_email = data.get('user_email', '').strip()
    password = data.get('password', '')

    if not user_name or not password or not first_name:
        return Response({
            'status': 0, 'msg': 'missing_fields', 'data': None,
            'error': 'First name, username, and password are required.',
        }, status=status.HTTP_400_BAD_REQUEST)

    if len(password) < 6:
        return Response({
            'status': 0, 'msg': 'weak_password', 'data': None,
            'error': 'Password must be at least 6 characters long.',
        }, status=status.HTTP_400_BAD_REQUEST)

    if User.objects(user_name=user_name, is_deleted=False).first():
        return Response({
            'status': 0, 'msg': 'duplicate_username', 'data': None,
            'error': 'This username is already taken.',
        }, status=status.HTTP_409_CONFLICT)

    # Default to the first UserType (or "Staff" if it exists)
    default_type = UserType.objects(type_name='Staff').first() or UserType.objects(is_deleted=False).first()
    if not default_type:
        return Response({
            'status': 0, 'msg': 'no_user_type', 'data': None,
            'error': 'No user types configured. Please contact your administrator.',
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    User(
        user_name=user_name,
        password_hash=make_password(password),
        first_name=first_name,
        last_name=last_name,
        user_email=user_email,
        user_type=default_type,
        is_active=False,
        must_change_password=True,
        screens='',
        main_screens='',
    ).save()

    return Response({
        'status': 1, 'msg': 'registered', 'data': None, 'error': '',
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    LoginHistory.record(request.user, log_type=2)
    AuthToken.objects(user=request.user).delete()
    return Response({'status': 1, 'msg': 'success_logout', 'data': None, 'error': ''})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password', '')
    new_password = request.data.get('new_password', '')

    if not check_password(old_password, user.password_hash):
        return Response({
            'status': 0, 'msg': 'incorrect_password', 'data': None,
            'error': 'Current password is incorrect.',
        }, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 6:
        return Response({
            'status': 0, 'msg': 'weak_password', 'data': None,
            'error': 'Password must be at least 6 characters long.',
        }, status=status.HTTP_400_BAD_REQUEST)

    user.password_hash = make_password(new_password)
    user.must_change_password = False
    user.save()

    return Response({
        'status': 1, 'msg': 'password_changed', 'data': None, 'error': '',
    })


def _worked_hms(pairs):
    """Sum paired login(1)→logout(2/3/4) durations. pairs: list of (time_str, log_type)."""
    total = 0
    login_at = None
    for time_str, log_type in sorted(pairs):
        t = datetime.strptime(time_str, '%H:%M:%S')
        if log_type == 1:
            login_at = t
        elif login_at is not None:
            total += (t - login_at).seconds  # .seconds wraps a past-midnight logout
            login_at = None
    h, rem = divmod(total, 3600)
    m, s = divmod(rem, 60)
    return f'{h:02d}:{m:02d}:{s:02d}'


def _type_name(uid):
    ut = UserType.objects(unique_id=uid).first() if uid else None
    return ut.type_name if ut else ''


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def login_history_report(request):
    """Replaces legacy login_history/crud.php: one row per user+date with first
    login, last logout, worked hours. Filters: from_date, to_date, staff_name."""
    p = request.query_params
    from_date, to_date, staff = p.get('from_date'), p.get('to_date'), p.get('staff_name')

    grouped = defaultdict(list)  # (user_uid, entry_date) -> [events]
    for ev in LoginHistory.objects(is_deleted=False):
        if not ev.user:
            continue
        d = ev.entry_date.isoformat() if ev.entry_date else ''
        if from_date and d < from_date:
            continue
        if to_date and d > to_date:
            continue
        if staff and ev.user.unique_id != staff:
            continue
        grouped[(ev.user, d)].append(ev)

    rows = []
    for (user, d), events in sorted(grouped.items(), key=lambda kv: kv[0][1], reverse=True):
        logins = [e.entry_time for e in events if e.log_type == 1]
        logouts = [e.entry_time for e in events if e.log_type != 1]
        rows.append({
            'user_name': user.user_name,
            'entry_date': d,
            'login_time': min(logins) if logins else '',
            'logout_time': max(logouts) if logouts else '',
            'user_type': _type_name(events[0].sess_user_type),
            'total_worked_hours': _worked_hms([(e.entry_time, e.log_type) for e in events]),
            'user_id': user.unique_id,
        })

    page = max(int(p.get('page', 1) or 1), 1)
    size = int(p.get('page_size', 10) or 10)
    start = (page - 1) * size
    return Response({'count': len(rows), 'results': rows[start:start + size]})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def login_history_detail(request):
    """Session breakdown for one user on one date (legacy view.php)."""
    user_id, entry_date = request.query_params.get('unique_id'), request.query_params.get('entry_date')
    user = User.objects(unique_id=user_id).first()
    if not user or not entry_date:
        return Response({'status': 0, 'user': {}, 'sessions': [], 'total_worked_hours': ''})

    events = [e for e in LoginHistory.objects(user=user, is_deleted=False)
              if e.entry_date and e.entry_date.isoformat() == entry_date]
    events.sort(key=lambda e: e.entry_time)

    # Pair each login(1) with the next logout(2/3/4) → one session row with worked time.
    sessions = []
    login_at = None
    for e in events:
        if e.log_type == 1:
            login_at = e.entry_time
        elif login_at is not None:
            worked = _worked_hms([(login_at, 1), (e.entry_time, 2)])
            sessions.append({'sno': len(sessions) + 1, 'date': entry_date,
                             'login': login_at, 'logout': e.entry_time,
                             'worked': worked, 'type': 'Logout'})
            login_at = None
    if login_at is not None:  # open session, no logout yet
        sessions.append({'sno': len(sessions) + 1, 'date': entry_date,
                         'login': login_at, 'logout': '', 'worked': '', 'type': 'Login'})

    return Response({
        'status': 1,
        'user': {
            'name': user.user_name,
            'type': _type_name(user.user_type.unique_id if user.user_type else ''),
            'date': entry_date,
        },
        'sessions': sessions,
        'total_worked_hours': _worked_hms([(e.entry_time, e.log_type) for e in events]),
    })


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
