from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SummaryBase(BaseModel):
    summary_text: str
    summary_type: str = "standard"


class SummaryCreate(BaseModel):
    document_id: str
    summary_text: str
    summary_type: str = "standard"
    tokens_used: Optional[int] = None
    organization_id: str


class SummaryResponse(BaseModel):
    id: str
    document_id: str
    summary_text: str
    summary_type: str
    tokens_used: Optional[int] = None
    organization_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True
