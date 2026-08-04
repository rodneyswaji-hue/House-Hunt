# apps/accounts/authentication.py
#
# The project has two independent account tables — accounts.Landlord (which is
# AUTH_USER_MODEL) and tenants.Tenant — but both issue tokens through
# SimpleJWT. SimpleJWT's default JWTAuthentication always resolves the token's
# user_id against AUTH_USER_MODEL, so a tenant token was authenticating as
# *the Landlord with the same primary key*. With landlord pk=1 being the
# superuser, the first tenant to register received full admin API access.
#
# Tokens now carry a `user_type` claim and are resolved against the matching
# table. Tokens minted before this change have no claim; they are treated as
# landlord tokens, which is what they already behaved as.

from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.settings import api_settings

USER_TYPE_CLAIM = "user_type"
LANDLORD = "landlord"
TENANT = "tenant"


def tag_token(token, user_type: str):
    """Stamp an account type onto a freshly issued token."""
    token[USER_TYPE_CLAIM] = user_type
    return token


class MultiUserJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        # Local import: apps.tenants imports settings that pull in this module.
        from apps.tenants.models import Tenant

        user_type = validated_token.get(USER_TYPE_CLAIM, LANDLORD)
        if user_type != TENANT:
            return super().get_user(validated_token)

        try:
            user_id = validated_token[api_settings.USER_ID_CLAIM]
        except KeyError:
            raise AuthenticationFailed(
                _("Token contained no recognizable user identification."),
                code="user_id_claim_missing",
            )

        try:
            tenant = Tenant.objects.get(pk=user_id)
        except Tenant.DoesNotExist:
            raise AuthenticationFailed(_("User not found."), code="user_not_found")

        if not tenant.is_active:
            raise AuthenticationFailed(_("User is inactive."), code="user_inactive")

        return tenant
