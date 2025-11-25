from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.schemas.activity_log import ActivityLogResponse

router = APIRouter()


@router.get("/", response_model=List[ActivityLogResponse])
async def list_activity_logs(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get activity logs for the current organization."""
    activities = db.query(ActivityLog).options(
        joinedload(ActivityLog.user)
    ).filter(
        ActivityLog.organization_id == current_user.organization_id
    ).order_by(
        ActivityLog.created_at.desc()
    ).limit(limit).all()
    
    # Add user name to response
    result = []
    for activity in activities:
        activity_dict = {
            "id": activity.id,
            "user_id": activity.user_id,
            "organization_id": activity.organization_id,
            "action_type": activity.action_type,
            "target": activity.target,
            "details": activity.details,
            "created_at": activity.created_at,
            "user_name": activity.user.full_name if activity.user else "Unknown User"
        }
        result.append(activity_dict)
    
    return result
