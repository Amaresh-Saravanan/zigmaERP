from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import MainScreen, Screen


def _ids(csv):
    return [s.strip() for s in csv.split(',') if s.strip()]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def menu(request):
    """
    Sidebar menu tree, filtered to the requesting user's permitted
    main_screens/screens. Legacy PHP's equivalent (folders/login/menu.php)
    returned every active screen unfiltered — permission filtering here
    closes that gap, same as TASK-B04's HasScreenPermission.
    """
    user = request.user
    allowed_main = _ids(user.main_screens)
    allowed_screens = _ids(user.screens)

    if not allowed_main:
        return Response({'status': 1, 'msg': '', 'data': []})

    mains = MainScreen.objects(
        is_active=True, is_deleted=False, unique_id__in=allowed_main
    ).order_by('screen_main_name')

    tree = []
    for m in mains:
        sub_qs = Screen.objects(main_screen=m, is_active=True, is_deleted=False)
        if allowed_screens:
            sub_qs = sub_qs.filter(unique_id__in=allowed_screens)
        sub_qs = sub_qs.order_by('order_no')

        tree.append({
            'unique_id': m.unique_id,
            'screen_main_name': m.screen_main_name,
            'icon_name': m.icon_name,
            'sub_screens': [
                {
                    'unique_id': s.unique_id,
                    'screen_name': s.screen_name,
                    'folder_name': s.folder_name,
                    'icon_name': s.icon_name,
                }
                for s in sub_qs
            ],
        })

    return Response({'status': 1, 'msg': '', 'data': tree})
