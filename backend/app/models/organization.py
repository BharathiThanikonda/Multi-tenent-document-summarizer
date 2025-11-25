from sqlalchemy import Column, String, Boolean, DateTime, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    domain = Column(String, nullable=True, index=True)
    
    # Subscription details
    stripe_customer_id = Column(String, nullable=True, unique=True)
    stripe_subscription_id = Column(String, nullable=True)
    subscription_status = Column(String, default="trial")  # trial, active, past_due, canceled
    plan_type = Column(String, default="basic")  # basic, pro
    summaries_limit = Column(Integer, default=100)
    summaries_used_current_month = Column(Integer, default=0)
    
    # Organization Settings
    auto_generate_summaries = Column(Boolean, default=True)
    email_notifications = Column(Boolean, default=False)
    require_approval = Column(Boolean, default=False)
    two_factor_auth = Column(Boolean, default=False)
    document_retention_days = Column(Integer, default=90)
    allow_data_export = Column(Boolean, default=True)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="organization", cascade="all, delete-orphan")
    summaries = relationship("Summary", back_populates="organization", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Organization {self.name}>"
    
    def can_create_summary(self) -> bool:
        """Check if organization can create more summaries this month."""
        return self.summaries_used_current_month < self.summaries_limit
    
    def increment_summary_usage(self):
        """Increment the summary usage counter."""
        self.summaries_used_current_month += 1
