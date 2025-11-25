from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.summary import Summary
from app.models.organization import Organization
from app.schemas.summary import SummaryResponse, SummaryCreate
from app.services.ai_service import generate_summary_with_context

router = APIRouter()


@router.post("/", response_model=SummaryResponse)
async def create_summary(
    document_id: str,
    summary_type: str = "standard",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a summary for a document."""
    # Get document
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.organization_id == current_user.organization_id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    if not document.extracted_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document text not available"
        )
    
    # Check organization's summary limit
    organization = db.query(Organization).filter(
        Organization.id == current_user.organization_id
    ).first()
    
    if not organization.can_create_summary():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Monthly summary limit reached ({organization.summaries_limit}). Please upgrade your plan."
        )
    
    # Generate summary
    try:
        summary_text, tokens_used = await generate_summary_with_context(
            document.extracted_text,
            document.original_filename,
            summary_type
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(e)}"
        )
    
    # Create summary record
    summary = Summary(
        document_id=document_id,
        summary_text=summary_text,
        summary_type=summary_type,
        tokens_used=tokens_used,
        organization_id=current_user.organization_id
    )
    
    db.add(summary)
    
    # Increment usage counter
    organization.increment_summary_usage()
    
    db.commit()
    db.refresh(summary)
    
    return summary


@router.get("/document/{document_id}", response_model=List[SummaryResponse])
async def get_document_summaries(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all summaries for a document."""
    # Verify document belongs to organization
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.organization_id == current_user.organization_id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    summaries = db.query(Summary).filter(
        Summary.document_id == document_id,
        Summary.organization_id == current_user.organization_id
    ).all()
    
    return summaries


@router.get("/{summary_id}", response_model=SummaryResponse)
async def get_summary(
    summary_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific summary."""
    summary = db.query(Summary).filter(
        Summary.id == summary_id,
        Summary.organization_id == current_user.organization_id
    ).first()
    
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Summary not found"
        )
    
    return summary


@router.get("/", response_model=List[SummaryResponse])
async def list_summaries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """List all summaries in the organization."""
    summaries = db.query(Summary).filter(
        Summary.organization_id == current_user.organization_id
    ).offset(skip).limit(limit).all()
    
    return summaries


@router.delete("/{summary_id}")
async def delete_summary(
    summary_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a summary."""
    summary = db.query(Summary).filter(
        Summary.id == summary_id,
        Summary.organization_id == current_user.organization_id
    ).first()
    
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Summary not found"
        )
    
    db.delete(summary)
    db.commit()
    
    return {"message": "Summary deleted successfully"}
