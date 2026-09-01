from fastapi import APIRouter

from app.api.routes import health, inbox, projects


api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(inbox.router)
api_router.include_router(projects.router)
