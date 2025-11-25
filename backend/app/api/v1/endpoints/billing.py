from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.organization import Organization
from app.schemas.billing import StripeCheckoutSession, SubscriptionResponse
from app.services.stripe_service import create_checkout_session, create_stripe_customer, handle_webhook_event
from app.core.config import settings
import stripe

router = APIRouter()


@router.post("/create-checkout-session", response_model=StripeCheckoutSession)
async def create_subscription_checkout(
    plan_type: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a Stripe checkout session for subscription (Admin only)."""
    if plan_type not in ["basic", "pro"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan type. Must be 'basic' or 'pro'"
        )
    
    organization = db.query(Organization).filter(
        Organization.id == current_user.organization_id
    ).first()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Create Stripe customer if not exists
    if not organization.stripe_customer_id:
        customer_id = await create_stripe_customer(organization, current_user.email)
        organization.stripe_customer_id = customer_id
        db.commit()
    
    # Create checkout session
    success_url = f"{settings.FRONTEND_URL}/billing/success"
    cancel_url = f"{settings.FRONTEND_URL}/billing/cancel"
    
    session = await create_checkout_session(
        organization.id,
        plan_type,
        success_url,
        cancel_url
    )
    
    return session


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current subscription status."""
    organization = db.query(Organization).filter(
        Organization.id == current_user.organization_id
    ).first()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    return {
        "organization_id": organization.id,
        "subscription_status": organization.subscription_status,
        "plan_type": organization.plan_type,
        "stripe_subscription_id": organization.stripe_subscription_id,
        "summaries_limit": organization.summaries_limit,
        "summaries_used_current_month": organization.summaries_used_current_month
    }


@router.post("/cancel-subscription")
async def cancel_subscription(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Cancel the current subscription (Admin only)."""
    organization = db.query(Organization).filter(
        Organization.id == current_user.organization_id
    ).first()
    
    if not organization or not organization.stripe_subscription_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    
    from app.services.stripe_service import cancel_subscription
    success = await cancel_subscription(organization.stripe_subscription_id)
    
    if success:
        organization.subscription_status = "canceled"
        db.commit()
        return {"message": "Subscription canceled successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel subscription"
        )


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    if not sig_header:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing stripe-signature header"
        )
    
    result = await handle_webhook_event(payload, sig_header, db)
    
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result
