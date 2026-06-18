import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import engine, Base
from .routes import predictions, admin

# Perform automatic database migration/creation (Reloaded configuration)
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")
except Exception as e:
    print(f"Error initializing database: {e}")

# Initialize FastAPI App
app = FastAPI(
    title="BioVision AI API",
    description="Backend API for BioVision AI Fingerprint Blood Group Classification system.",
    version="1.0.0"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to actual frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory is created
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Serve static files (uploads)
app.mount("/api/static", StaticFiles(directory=UPLOAD_DIR), name="static")

# Include Routers
app.include_router(predictions.router)
app.include_router(admin.router)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "biovision-ai-backend"}
