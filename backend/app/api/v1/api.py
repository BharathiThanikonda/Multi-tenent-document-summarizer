from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, documents, summaries, billing, organizations, activity

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["Organizations"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(summaries.router, prefix="/summaries", tags=["Summaries"])
api_router.include_router(billing.router, prefix="/billing", tags=["Billing"])
api_router.include_router(activity.router, prefix="/activity", tags=["Activity"])
