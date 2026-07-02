from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from accounts.models import AuthToken


class MongoTokenAuthentication(BaseAuthentication):
    """Expects `Authorization: Token <key>`. Looks the key up in AuthToken (MongoEngine),
    not DRF's built-in rest_framework.authtoken (which needs a relational DB we don't have)."""

    keyword = b'token'

    def authenticate(self, request):
        auth = get_authorization_header(request).split()

        if not auth or auth[0].lower() != self.keyword:
            return None

        if len(auth) != 2:
            raise AuthenticationFailed('Invalid token header.')

        key = auth[1].decode()
        token = AuthToken.objects(key=key).first()
        if token is None:
            raise AuthenticationFailed('Invalid or expired token.')

        user = token.user
        if user.is_deleted or not user.is_active:
            raise AuthenticationFailed('User inactive or deleted.')

        return (user, token)

    def authenticate_header(self, request):
        # Presence of this makes DRF return 401 (not 403) when no/invalid token is given.
        return 'Token'
