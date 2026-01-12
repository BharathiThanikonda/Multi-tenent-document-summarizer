from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.summary import Summary

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for the organization."""
    
    # Count total documents
    documents_processed = db.query(func.count(Document.id)).filter(
        Document.organization_id == current_user.organization_id
    ).scalar() or 0
    
    # Count summaries this month
    from datetime import datetime, timedelta
    first_day_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    summaries_this_month = db.query(func.count(Summary.id)).filter(
        Summary.organization_id == current_user.organization_id,
        Summary.created_at >= first_day_of_month
    ).scalar() or 0
    
    # Get organization to calculate remaining summaries
    from app.models.organization import Organization
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    
    summaries_limit = org.summaries_limit if org else 100
    summaries_remaining = max(0, summaries_limit - summaries_this_month)
    
    # Count active team members
    active_team_members = db.query(func.count(User.id)).filter(
        User.organization_id == current_user.organization_id,
        User.is_active == True
    ).scalar() or 0
    
    # Calculate storage used (sum of all document file sizes)
    total_bytes = db.query(func.sum(Document.file_size)).filter(
        Document.organization_id == current_user.organization_id
    ).scalar() or 0
    
    storage_used_gb = total_bytes / (1024 * 1024 * 1024)  # Convert bytes to GB
    storage_limit_gb = 10.0  # Default 10GB limit, can be made dynamic based on plan
    
    return {
        "documents_processed": documents_processed,
        "summaries_this_month": summaries_this_month,
        "summaries_remaining": summaries_remaining,
        "active_team_members": active_team_members,
        "storage_used_gb": round(storage_used_gb, 2),
        "storage_limit_gb": storage_limit_gb
    }


@router.get("/recent-documents")
async def get_recent_documents(
    limit: int = 5,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent documents for the organization."""
    
    documents = db.query(Document).filter(
        Document.organization_id == current_user.organization_id
    ).order_by(Document.created_at.desc()).limit(limit).all()
    
    result = []
    for doc in documents:
        # Get summary status if exists
        summary = db.query(Summary).filter(Summary.document_id == doc.id).first()
        
        # Get uploader name
        uploader = db.query(User).filter(User.id == doc.uploaded_by).first()
        uploader_name = f"{uploader.first_name} {uploader.last_name}" if uploader else "Unknown"
        
        result.append({
            "id": doc.id,
            "name": doc.original_filename,
            "status": "completed" if summary else "processing",
            "uploadedBy": uploader_name,
            "uploadedAt": doc.created_at.isoformat(),
            "size": doc.file_size
        })
    
    return result


@router.get("/usage-overtime")
async def get_usage_overtime(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get usage data over time for the last 30 days."""
    
    from datetime import datetime, timedelta
    
    # Get last 30 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=29)
    
    # Query summaries grouped by date
    usage_data = []
    
    for i in range(30):
        current_date = start_date + timedelta(days=i)
        next_date = current_date + timedelta(days=1)
        
        count = db.query(func.count(Summary.id)).filter(
            Summary.organization_id == current_user.organization_id,
            Summary.created_at >= current_date,
            Summary.created_at < next_date
        ).scalar() or 0
        
        usage_data.append({
            "date": current_date.strftime("%b %d"),
            "summaries": count
        })
    
    return usage_data
