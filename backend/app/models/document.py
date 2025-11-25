from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    
    # Content
    extracted_text = Column(Text, nullable=True)
    page_count = Column(Integer, nullable=True)
    
    # Tenant isolation
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    uploaded_by = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Processing status
    status = Column(String, default="uploaded")  # uploaded, processing, completed, failed
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    organization = relationship("Organization", back_populates="documents")
    uploaded_by_user = relationship("User", back_populates="documents")
    summaries = relationship("Summary", back_populates="document", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Document {self.original_filename}>"
