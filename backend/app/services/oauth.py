from typing import Optional
from authlib.integrations.starlette_client import OAuth
from app.core.config import settings

oauth = OAuth()

# Google OAuth2 with state validation disabled for development
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile',
    },
    authorize_state=None  # Disable state validation
)

# Microsoft OAuth2
oauth.register(
    name='microsoft',
    client_id=settings.MICROSOFT_CLIENT_ID,
    client_secret=settings.MICROSOFT_CLIENT_SECRET,
    authorize_url=f'https://login.microsoftonline.com/{settings.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize',
    authorize_params=None,
    access_token_url=f'https://login.microsoftonline.com/{settings.MICROSOFT_TENANT_ID}/oauth2/v2.0/token',
    access_token_params=None,
    refresh_token_url=None,
    redirect_uri=settings.MICROSOFT_REDIRECT_URI,
    client_kwargs={
        'scope': 'openid email profile'
    }
)
