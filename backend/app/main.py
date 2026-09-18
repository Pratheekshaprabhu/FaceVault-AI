from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import router


app = FastAPI(
    title="FaceVault AI",
    description="Open-Set Face Recognition and Identity Verification System",
    version="1.0.0"
)


# ---------------------------------------------------------
# CORS CONFIGURATION
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# API ROUTES
# ---------------------------------------------------------

app.include_router(router)


# ---------------------------------------------------------
# ROOT ENDPOINT
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "FaceVault AI API is running",
        "status": "healthy",
        "version": "1.0.0"
    }