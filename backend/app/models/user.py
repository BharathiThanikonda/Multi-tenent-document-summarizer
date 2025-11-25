from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MEMBER = "member"


class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth-only users
    
    # OAuth fields
    oauth_provider = Column(String, nullable=True)  # google, microsoft
    oauth_id = Column(String, nullable=True, index=True)
    
    # Role & Organization
    role = Column(Enum(UserRole), default=UserRole.MEMBER, nullable=False)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_pending_invitation = Column(Boolean, default=False)  # True if invited but not yet accepted
    invitation_token = Column(String, nullable=True, unique=True)  # Token for invitation acceptance
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="users")
    documents = relationship("Document", back_populates="uploaded_by_user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.email}>"
    
    def is_admin(self) -> bool:
        """Check if user is an admin."""
        return self.role == UserRole.ADMIN
    
    def is_member(self) -> bool:
        """Check if user is a member."""
        return self.role == UserRole.MEMBER
