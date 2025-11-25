from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


class ActivityType(str, enum.Enum):
    UPLOAD = "upload"
    DELETE = "delete"
    INVITE = "invite"
    ROLE_CHANGE = "role_change"
    SETTINGS_UPDATE = "settings_update"
    WORKSPACE_CREATE = "workspace_create"
    SUMMARY_CREATE = "summary_create"


class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Who performed the action
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    # What action was performed
    action_type = Column(Enum(ActivityType), nullable=False, index=True)
    
    # What was the target (e.g., filename, user email, setting name)
    target = Column(String, nullable=False)
    
    # Additional details (JSON-like string)
    details = Column(Text, nullable=True)
    
    # Multi-tenant isolation
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    organization = relationship("Organization")
    
    def __repr__(self):
        return f"<ActivityLog {self.action_type} by {self.user_id}>"
