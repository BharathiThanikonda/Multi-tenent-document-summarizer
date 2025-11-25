from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.activity_log import ActivityType


class ActivityLogBase(BaseModel):
    action_type: ActivityType
    target: str
    details: Optional[str] = None


class ActivityLogCreate(ActivityLogBase):
    pass


class ActivityLogResponse(ActivityLogBase):
    id: str
    user_id: str
    organization_id: str
    created_at: datetime
    user_name: Optional[str] = None  # Will be populated from relationship
    
    class Config:
        from_attributes = True
