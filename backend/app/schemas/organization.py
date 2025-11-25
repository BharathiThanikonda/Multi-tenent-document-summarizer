from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class OrganizationBase(BaseModel):
    name: str
    domain: Optional[str] = None


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    is_active: Optional[bool] = None
    auto_generate_summaries: Optional[bool] = None
    email_notifications: Optional[bool] = None
    require_approval: Optional[bool] = None
    two_factor_auth: Optional[bool] = None
    document_retention_days: Optional[int] = None
    allow_data_export: Optional[bool] = None


class OrganizationResponse(OrganizationBase):
    id: str
    subscription_status: str
    plan_type: str
    summaries_limit: int
    summaries_used_current_month: int
    is_active: bool
    auto_generate_summaries: bool
    email_notifications: bool
    require_approval: bool
    two_factor_auth: bool
    document_retention_days: int
    allow_data_export: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class OrganizationWithStripe(OrganizationResponse):
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
