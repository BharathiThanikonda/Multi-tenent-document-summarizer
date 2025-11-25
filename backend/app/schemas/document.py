from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DocumentBase(BaseModel):
    original_filename: str


class DocumentCreate(DocumentBase):
    filename: str
    file_path: str
    file_type: str
    file_size: int
    organization_id: str
    uploaded_by: str


class DocumentUpdate(BaseModel):
    status: Optional[str] = None
    extracted_text: Optional[str] = None
    page_count: Optional[int] = None


class DocumentResponse(BaseModel):
    id: str
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    status: str
    page_count: Optional[int] = None
    organization_id: str
    uploaded_by: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class DocumentWithText(DocumentResponse):
    extracted_text: Optional[str] = None
