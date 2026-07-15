from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from collections import defaultdict
from datetime import datetime

from mongoengine.errors import NotUniqueError

from accounts.models import AuthToken, LoginHistory, User, UserType
from accounts.serializers import LoginSerializer, SignupSerializer, UserManageSerializer, UserSerializer, UserTypeManageSerializer
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
    LoginHistory.record(user, log_type=1)

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
@permission_classes([AllowAny])
def signup(request):
    """
    Request: { "user_name", "user_email", "password", "confirm_password", "first_name", "last_name" }
    Response (success): { "status": 1, "msg": "signup_pending", "data": { "user_name": "..." } }
    Response (fail): { "status": 0, "msg": "error", "data": None, "error": "..." }

    New accounts start inactive under a zero-permission role; an admin must
    activate and assign a real UserType via the existing User management
    screen before the account can see any screens.
    """
    serializer = SignupSerializer(data=request.data)
    if not serializer.is_valid():
        errors = serializer.errors
        first_error = next(iter(errors.values()))
        message = first_error[0] if isinstance(first_error, list) else str(first_error)
        return Response({
            'status': 0,
            'msg': 'error',
            'data': None,
            'error': str(message),
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = serializer.save()
    except NotUniqueError:
        return Response({
            'status': 0,
            'msg': 'error',
            'data': None,
            'error': 'This username is already taken.',
        }, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        'status': 1,
        'msg': 'signup_pending',
        'data': {'user_name': user.user_name},
        'error': '',
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout with optional log_type: 2=explicit logout, 3=session logout, 4=tab/window closed."""
    log_type = request.data.get('log_type', 2)
    # Validate log_type
    if log_type not in (2, 3, 4):
        log_type = 2
    LoginHistory.record(request.user, log_type=log_type)
    AuthToken.objects(user=request.user).delete()
    return Response({'status': 1, 'msg': 'success_logout', 'data': None, 'error': ''})


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
    login, last logout, worked hours. Filters: from_date, to_date, staff_name, search."""
    p = request.query_params
    from_date, to_date, staff = p.get('from_date'), p.get('to_date'), p.get('staff_name')
    search_term = p.get('search', '').strip()

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

    try:
        page = max(int(p.get('page', 1) or 1), 1)
        size = int(p.get('page_size', 10) or 10)
    except ValueError:
        return Response(
            {'status': 0, 'msg': 'validation_error', 'data': None, 'error': 'page and page_size must be integers.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    rows = []
    for (user, d), events in sorted(grouped.items(), key=lambda kv: kv[0][1], reverse=True):
        logins = [e.entry_time for e in events if e.log_type == 1]
        logouts = [e.entry_time for e in events if e.log_type != 1]
        user_type_name = _type_name(events[0].sess_user_type)

        # Apply search filter on user_name and user_type
        if search_term:
            term = search_term.lower()
            if term not in user.user_name.lower() and term not in user_type_name.lower():
                continue

        rows.append({
            'user_name': user.user_name,
            'entry_date': d,
            'login_time': min(logins) if logins else '',
            'logout_time': max(logouts) if logouts else '',
            'user_type': user_type_name,
            'total_worked_hours': _worked_hms([(e.entry_time, e.log_type) for e in events]),
            'user_id': user.unique_id,
        })

    start = (page - 1) * size
    return Response({
        'status': 1,
        'msg': 'success',
        'data': {'count': len(rows), 'results': rows[start:start + size]},
        'error': '',
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def login_history_detail(request):
    """Session breakdown for one user on one date (legacy view.php)."""
    user_id, entry_date = request.query_params.get('unique_id'), request.query_params.get('entry_date')
    user = User.objects(unique_id=user_id).first()
    if not user or not entry_date:
        return Response({
            'status': 0,
            'msg': 'not_found',
            'data': None,
            'error': 'User or date not found.',
        }, status=status.HTTP_404_NOT_FOUND)

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
            # Map log_type to human-readable label
            logout_type_map = {2: 'Logout', 3: 'Session Logout', 4: 'Tab/Window Closed'}
            logout_label = logout_type_map.get(e.log_type, 'Logout')
            sessions.append({'sno': len(sessions) + 1, 'date': entry_date,
                             'login': login_at, 'logout': e.entry_time,
                             'worked': worked, 'type': logout_label,
                             'log_type': e.log_type})
            login_at = None
    if login_at is not None:  # open session, no logout yet
        sessions.append({'sno': len(sessions) + 1, 'date': entry_date,
                         'login': login_at, 'logout': '', 'worked': '', 'type': 'Login',
                         'log_type': 1})

    return Response({
        'status': 1,
        'msg': 'success',
        'data': {
            'user': {
                'name': user.user_name,
                'type': _type_name(user.user_type.unique_id if user.user_type else ''),
                'date': entry_date,
            },
            'sessions': sessions,
            'total_worked_hours': _worked_hms([(e.entry_time, e.log_type) for e in events]),
        },
        'error': '',
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
