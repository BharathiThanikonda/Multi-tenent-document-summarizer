from pydantic import BaseModel
from typing import Optional


class StripeCheckoutSession(BaseModel):
    session_id: str
    url: str


class SubscriptionCreate(BaseModel):
    plan_type: str  # basic or pro
    organization_id: str


class SubscriptionUpdate(BaseModel):
    plan_type: Optional[str] = None


class SubscriptionResponse(BaseModel):
    organization_id: str
    subscription_status: str
    plan_type: str
    stripe_subscription_id: Optional[str] = None
    summaries_limit: int
    summaries_used_current_month: int
