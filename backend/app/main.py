from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import router
from app.database.connection import engine, Base
from app.database import models


app = FastAPI(
    title="FaceVault AI",
    description="Open-Set Face Recognition and Identity Verification System",
    version="1.0.0"
)


# Create database tables when the server starts
Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://face-vault-ai.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://face-vault.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router)


@app.get("/")
def root():
    return {
        "message": "FaceVault AI API is running",
        "status": "healthy",
        "version": "1.0.0"
    }