import stripe
from typing import Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.organization import Organization

stripe.api_key = settings.STRIPE_SECRET_KEY


async def create_stripe_customer(organization: Organization, email: str) -> str:
    """Create a Stripe customer for an organization."""
    customer = stripe.Customer.create(
        email=email,
        metadata={
            "organization_id": organization.id,
            "organization_name": organization.name
        }
    )
    return customer.id


async def create_checkout_session(
    organization_id: str,
    plan_type: str,
    success_url: str,
    cancel_url: str
) -> dict:
    """Create a Stripe checkout session for subscription."""
    price_id = (
        settings.STRIPE_PRICE_ID_PRO 
        if plan_type == "pro" 
        else settings.STRIPE_PRICE_ID_BASIC
    )
    
    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price': price_id,
            'quantity': 1,
        }],
        mode='subscription',
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            'organization_id': organization_id,
            'plan_type': plan_type
        }
    )
    
    return {
        "session_id": session.id,
        "url": session.url
    }


async def cancel_subscription(subscription_id: str) -> bool:
    """Cancel a Stripe subscription."""
    try:
        stripe.Subscription.delete(subscription_id)
        return True
    except Exception as e:
        print(f"Error canceling subscription: {e}")
        return False


async def update_subscription(subscription_id: str, new_price_id: str) -> bool:
    """Update a Stripe subscription to a different plan."""
    try:
        subscription = stripe.Subscription.retrieve(subscription_id)
        stripe.Subscription.modify(
            subscription_id,
            items=[{
                'id': subscription['items']['data'][0].id,
                'price': new_price_id,
            }]
        )
        return True
    except Exception as e:
        print(f"Error updating subscription: {e}")
        return False


async def handle_webhook_event(payload: dict, sig_header: str, db: Session) -> dict:
    """Handle Stripe webhook events."""
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return {"error": "Invalid payload"}
    except stripe.error.SignatureVerificationError:
        return {"error": "Invalid signature"}
    
    # Handle different event types
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        organization_id = session['metadata']['organization_id']
        
        # Update organization with subscription details
        org = db.query(Organization).filter(Organization.id == organization_id).first()
        if org:
            org.stripe_subscription_id = session['subscription']
            org.subscription_status = 'active'
            org.plan_type = session['metadata']['plan_type']
            
            # Set limits based on plan
            if org.plan_type == 'pro':
                org.summaries_limit = settings.PRO_SUMMARIES_PER_MONTH
            else:
                org.summaries_limit = settings.BASIC_SUMMARIES_PER_MONTH
            
            db.commit()
    
    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        # Handle subscription updates
        pass
    
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        # Handle subscription cancellation
        org = db.query(Organization).filter(
            Organization.stripe_subscription_id == subscription['id']
        ).first()
        if org:
            org.subscription_status = 'canceled'
            db.commit()
    
    return {"status": "success"}
