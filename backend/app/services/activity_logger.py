from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog, ActivityType
from app.models.user import User


def log_activity(
    db: Session,
    user: User,
    action_type: ActivityType,
    target: str,
    details: str = None
):
    """Helper function to log an activity."""
    activity = ActivityLog(
        user_id=user.id,
        organization_id=user.organization_id,
        action_type=action_type,
        target=target,
        details=details
    )
    db.add(activity)
    db.commit()
    return activity
