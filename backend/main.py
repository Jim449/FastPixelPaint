from fastapi import FastAPI
from app.db_setup import init_db
from app.api.routers import router
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(router, prefix="/v1")
