import logging

import jwt
from cryptography.hazmat.primitives import serialization
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import authentication, exceptions

logger = logging.getLogger(__name__)


class JWTAuth(authentication.BaseAuthentication):

    def authenticate(self, request):
        if settings.CUSTOM_SETTINGS["DISABLE_AUTH"]:
            return None
        token = request.META.get('HTTP_AUTHORIZATION', "")

        if len(token.split()) != 2:
            raise exceptions.AuthenticationFailed(
                "Authorization header must contain two space-delimited values"
            )
        token = token.split()[1]

        try:
            decoded = jwt.decode(
                jwt=token,
                key=self.public_key,
                algorithms=['RS256'],
            )
        except jwt.exceptions.InvalidSignatureError as e:
            logger.error(e)
            raise exceptions.AuthenticationFailed(e)

        user = User.objects.get_or_create(
            first_name=decoded["name"], email=decoded["email"]
        )

        return (user, None)

    @property
    def public_key(self):
        with open("../.secrets/public.pem") as f:
            key = f.read()
        return serialization.load_pem_public_key(key.encode())
