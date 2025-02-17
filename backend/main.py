from fastapi import FastAPI, HTTPException, Depends, status
from app.db_setup import init_db, get_db
from contextlib import asynccontextmanager
from fastapi import Request


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)
