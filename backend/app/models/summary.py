from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Summary(Base):
    __tablename__ = "summaries"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("documents.id"), nullable=False, index=True)
    
    # Summary content
    summary_text = Column(Text, nullable=False)
    summary_type = Column(String, default="standard")  # standard, detailed, brief
    tokens_used = Column(Integer, nullable=True)
    
    # Tenant isolation
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    organization = relationship("Organization", back_populates="summaries")
    document = relationship("Document", back_populates="summaries")
    
    def __repr__(self):
        return f"<Summary for Document {self.document_id}>"
