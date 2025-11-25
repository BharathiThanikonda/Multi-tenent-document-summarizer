from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import secrets
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_admin_user
from app.models.user import User, UserRole
from app.models.activity_log import ActivityType
from app.schemas.user import UserResponse, UserCreate, UserUpdate
from app.services.activity_logger import log_activity

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user


@router.get("/", response_model=List[UserResponse])
async def list_users(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """List all users in the organization (Admin only)."""
    users = db.query(User).filter(
        User.organization_id == current_user.organization_id
    ).all()
    return users


@router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new user (Admin only)."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create user in the same organization
    # Convert role string to enum if necessary
    role_value = user_data.role
    if isinstance(role_value, str):
        role_value = UserRole(role_value)
    
    # Generate invitation token
    invitation_token = secrets.token_urlsafe(32)
    
    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        role=role_value,
        organization_id=current_user.organization_id,
        is_active=True,
        is_pending_invitation=True,  # Mark as pending until they accept invitation
        invitation_token=invitation_token,
        hashed_password=None  # No password until they complete signup
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log activity
    log_activity(
        db=db,
        user=current_user,
        action_type=ActivityType.INVITE,
        target=new_user.email,
        details=f"Invited as {new_user.role}"
    )
    
    return new_user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a user (Admin only)."""
    user = db.query(User).filter(
        User.id == user_id,
        User.organization_id == current_user.organization_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    old_role = user.role
    if user_data.full_name is not None:
        user.full_name = user_data.full_name
    if user_data.role is not None:
        user.role = user_data.role
    if user_data.is_active is not None:
        user.is_active = user_data.is_active
    
    db.commit()
    db.refresh(user)
    
    # Log activity if role changed
    if user_data.role is not None and old_role != user_data.role:
        log_activity(
            db=db,
            user=current_user,
            action_type=ActivityType.ROLE_CHANGE,
            target=f"{user.full_name or user.email}",
            details=f"Changed from {old_role} to {user_data.role}"
        )
    
    return user


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a user (Admin only)."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    user = db.query(User).filter(
        User.id == user_id,
        User.organization_id == current_user.organization_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user_email = user.email
    db.delete(user)
    
    # Log activity
    log_activity(
        db=db,
        user=current_user,
        action_type=ActivityType.DELETE,
        target=user_email,
        details="Removed from workspace"
    )
    
    db.commit()
    
    return {"message": "User deleted successfully"}
