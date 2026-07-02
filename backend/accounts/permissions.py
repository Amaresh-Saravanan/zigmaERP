from rest_framework.permissions import BasePermission


class HasScreenPermission(BasePermission):
    """
    Server-side equivalent of legacy PHP's $_SESSION['screens'] check — that check
    only ever existed client-side there, so this closes a real gap (TDD_Blueprint.md
    §15.6), not a like-for-like port.

    A view declares what it needs one of two ways:
      - `required_screen = 'item_view'` — same screen id for every action.
      - `required_screens = {'list': 'item_view', 'create': 'item_create', ...}` —
        per-ViewSet-action mapping, since legacy screens split view/create/edit/delete.

    A view that declares neither is left open (this class doesn't invent a screen
    requirement); pair it with IsAuthenticated for views that need a logged-in user
    but no specific screen.
    """

    def has_permission(self, request, view):
        required = getattr(view, 'required_screen', None)
        if required is None:
            action_map = getattr(view, 'required_screens', None)
            if action_map:
                required = action_map.get(getattr(view, 'action', None) or request.method)

        if required is None:
            return True

        user = request.user
        return bool(user) and getattr(user, 'is_authenticated', False) and user.has_screen(required)
