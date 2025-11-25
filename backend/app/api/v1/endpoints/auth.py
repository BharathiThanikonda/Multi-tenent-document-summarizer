from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, get_password_hash, verify_password
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.schemas.auth import Token
from app.services.oauth import oauth
from app.core.config import settings
from pydantic import BaseModel, EmailStr
import uuid
import secrets

router = APIRouter()


class SignupRequest(BaseModel):
    organization_name: str
    full_name: str
    email: EmailStr
    password: str


@router.post("/signup", response_model=Token)
async def signup(signup_data: SignupRequest, db: Session = Depends(get_db)):
    """Create new organization and admin user account, or accept invitation if user was invited."""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == signup_data.email).first()
    
    if existing_user:
        # If user has pending invitation, they should use accept-invitation endpoint instead
        if existing_user.is_pending_invitation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have a pending invitation. Please check your email for the invitation link."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Create new organization
    org = Organization(
        name=signup_data.organization_name,
        subscription_status="trial",
        summaries_limit=100
    )
    db.add(org)
    db.flush()
    
    # Create admin user
    user = User(
        email=signup_data.email,
        full_name=signup_data.full_name,
        hashed_password=get_password_hash(signup_data.password),
        organization_id=org.id,
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=False,  # Can add email verification later
        is_pending_invitation=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Authenticate user with email and password."""
    # Find user by email (username field contains email)
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user has pending invitation
    if user.is_pending_invitation:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please accept your invitation first by setting a password"
        )
    
    # Check if user has a password set
    if not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No password set for this account. Please use OAuth login or contact administrator."
        )
    
    # Verify password
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.get("/google/login")
async def google_login(request: Request):
    """Initiate Google OAuth2 login."""
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """Handle Google OAuth2 callback."""
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info")
        
        email = user_info.get('email')
        full_name = user_info.get('name')
        oauth_id = user_info.get('sub')
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Create new organization for new user
            org = Organization(
                name=f"{full_name}'s Organization",
                subscription_status="trial"
            )
            db.add(org)
            db.flush()
            
            # Create new user
            user = User(
                email=email,
                full_name=full_name,
                oauth_provider="google",
                oauth_id=oauth_id,
                organization_id=org.id,
                role=UserRole.ADMIN,  # First user is admin
                is_active=True,
                is_verified=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update last login
            user.last_login = datetime.utcnow()
            db.commit()
        
        # Create tokens
        access_token = create_access_token(data={"sub": user.id})
        refresh_token = create_refresh_token(data={"sub": user.id})
        
        # Redirect to frontend with tokens
        redirect_url = f"{settings.FRONTEND_URL}/auth/callback?access_token={access_token}&refresh_token={refresh_token}"
        return RedirectResponse(url=redirect_url)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/microsoft/login")
async def microsoft_login(request: Request):
    """Initiate Microsoft OAuth2 login."""
    redirect_uri = settings.MICROSOFT_REDIRECT_URI
    return await oauth.microsoft.authorize_redirect(request, redirect_uri)


@router.get("/microsoft/callback")
async def microsoft_callback(request: Request, db: Session = Depends(get_db)):
    """Handle Microsoft OAuth2 callback."""
    try:
        token = await oauth.microsoft.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info")
        
        email = user_info.get('email') or user_info.get('preferred_username')
        full_name = user_info.get('name')
        oauth_id = user_info.get('sub') or user_info.get('oid')
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Create new organization for new user
            org = Organization(
                name=f"{full_name}'s Organization",
                subscription_status="trial"
            )
            db.add(org)
            db.flush()
            
            # Create new user
            user = User(
                email=email,
                full_name=full_name,
                oauth_provider="microsoft",
                oauth_id=oauth_id,
                organization_id=org.id,
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update last login
            user.last_login = datetime.utcnow()
            db.commit()
        
        # Create tokens
        access_token = create_access_token(data={"sub": user.id})
        refresh_token = create_refresh_token(data={"sub": user.id})
        
        # Redirect to frontend with tokens
        redirect_url = f"{settings.FRONTEND_URL}/auth/callback?access_token={access_token}&refresh_token={refresh_token}"
        return RedirectResponse(url=redirect_url)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class AcceptInvitationRequest(BaseModel):
    invitation_token: str
    password: str


class CheckInvitationRequest(BaseModel):
    email: EmailStr


@router.post("/check-invitation")
async def check_invitation(
    request: CheckInvitationRequest,
    db: Session = Depends(get_db)
):
    """Check if email has a pending invitation."""
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        return {"has_invitation": False}
    
    return {
        "has_invitation": user.is_pending_invitation,
        "invitation_token": user.invitation_token if user.is_pending_invitation else None,
        "full_name": user.full_name,
        "organization_id": user.organization_id
    }


@router.post("/accept-invitation", response_model=Token)
async def accept_invitation(
    request: AcceptInvitationRequest,
    db: Session = Depends(get_db)
):
    """Accept invitation and set password for the account."""
    # Find user by invitation token
    user = db.query(User).filter(User.invitation_token == request.invitation_token).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid invitation token"
        )
    
    if not user.is_pending_invitation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation already accepted"
        )
    
    # Set password and mark invitation as accepted
    user.hashed_password = get_password_hash(request.password)
    user.is_pending_invitation = False
    user.invitation_token = None  # Clear the token
    user.is_verified = True
    user.last_login = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    from app.core.security import decode_token
    
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Create new tokens
    new_access_token = create_access_token(data={"sub": user.id})
    new_refresh_token = create_refresh_token(data={"sub": user.id})
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }
