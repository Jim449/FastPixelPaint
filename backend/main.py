from fastapi import FastAPI
from app.db_setup import init_db
from app.api.routers import router
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

# Adding middleware to fix CORS block on frontend fetch
# Looks like I can't use a wildcard on allow origins
# Allowing null probably won't help, I see that I'm calling from the 5173
app.add_middleware(CORSMiddleware,
                   allow_origins=["http://localhost:5173"],
                   allow_credentials=True,
                   allow_methods=["*"],
                   allow_headers=["*"])
app.include_router(router, prefix="/v1")
