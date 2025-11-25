from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None


class OAuth2LoginRequest(BaseModel):
    provider: str  # google or microsoft


class OAuth2CallbackData(BaseModel):
    code: str
    state: Optional[str] = None
