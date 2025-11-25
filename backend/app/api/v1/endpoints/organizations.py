from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.organization import Organization
from app.models.activity_log import ActivityType
from app.schemas.organization import OrganizationResponse, OrganizationUpdate, OrganizationCreate
from app.services.activity_logger import log_activity

router = APIRouter()


@router.get("/", response_model=OrganizationResponse)
async def get_organization(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's organization."""
    organization = db.query(Organization).filter(
        Organization.id == current_user.organization_id
    ).first()
    
    return organization


@router.post("/", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_data: OrganizationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new organization."""
    # Create new organization
    new_org = Organization(
        name=org_data.name,
        subscription_status="trial",
        summaries_limit=100,  # Default trial limit
        summaries_used_current_month=0,
        is_active=True
    )
    
    db.add(new_org)
    db.commit()
    db.refresh(new_org)
    
    return new_org


@router.put("/", response_model=OrganizationResponse)
async def update_organization(
    org_data: OrganizationUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update organization (Admin only)."""
    organization = db.query(Organization).filter(
        Organization.id == current_user.organization_id
    ).first()
    
    # Track changes for activity log
    changes = []
    
    # Update basic fields
    if org_data.name is not None and org_data.name != organization.name:
        changes.append(f"name: {organization.name} → {org_data.name}")
        organization.name = org_data.name
    if org_data.domain is not None and org_data.domain != organization.domain:
        old_domain = organization.domain or "none"
        changes.append(f"domain: {old_domain} → {org_data.domain}")
        organization.domain = org_data.domain
    if org_data.is_active is not None and org_data.is_active != organization.is_active:
        changes.append(f"status: {'active' if organization.is_active else 'inactive'} → {'active' if org_data.is_active else 'inactive'}")
        organization.is_active = org_data.is_active
    
    # Update settings fields
    if org_data.auto_generate_summaries is not None and org_data.auto_generate_summaries != organization.auto_generate_summaries:
        changes.append(f"auto-generate summaries: {organization.auto_generate_summaries} → {org_data.auto_generate_summaries}")
        organization.auto_generate_summaries = org_data.auto_generate_summaries
    if org_data.email_notifications is not None and org_data.email_notifications != organization.email_notifications:
        changes.append(f"email notifications: {organization.email_notifications} → {org_data.email_notifications}")
        organization.email_notifications = org_data.email_notifications
    if org_data.require_approval is not None and org_data.require_approval != organization.require_approval:
        changes.append(f"require approval: {organization.require_approval} → {org_data.require_approval}")
        organization.require_approval = org_data.require_approval
    if org_data.two_factor_auth is not None and org_data.two_factor_auth != organization.two_factor_auth:
        changes.append(f"two-factor auth: {organization.two_factor_auth} → {org_data.two_factor_auth}")
        organization.two_factor_auth = org_data.two_factor_auth
    if org_data.document_retention_days is not None and org_data.document_retention_days != organization.document_retention_days:
        changes.append(f"document retention: {organization.document_retention_days} → {org_data.document_retention_days} days")
        organization.document_retention_days = org_data.document_retention_days
    if org_data.allow_data_export is not None and org_data.allow_data_export != organization.allow_data_export:
        changes.append(f"allow data export: {organization.allow_data_export} → {org_data.allow_data_export}")
        organization.allow_data_export = org_data.allow_data_export
    
    db.commit()
    db.refresh(organization)
    
    # Log activity if there were changes
    if changes:
        log_activity(
            db=db,
            user=current_user,
            action_type=ActivityType.SETTINGS_UPDATE,
            target="workspace settings",
            details=", ".join(changes)
        )
    
    return organization


@router.delete("/", status_code=status.HTTP_200_OK)
async def delete_organization(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete organization and all associated data (Admin only)."""
    organization = db.query(Organization).filter(
        Organization.id == current_user.organization_id
    ).first()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    org_name = organization.name
    
    # Delete the organization (cascade will handle related data)
    db.delete(organization)
    db.commit()
    
    return {"message": f"Organization '{org_name}' and all associated data have been deleted"}
