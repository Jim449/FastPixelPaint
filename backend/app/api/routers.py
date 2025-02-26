from fastapi import APIRouter
from app.api.v1.core.endpoints.general import router as general_router
from app.api.v1.core.endpoints.authentication import router as authentication_router

router = APIRouter()

router.include_router(general_router)
router.include_router(authentication_router)
