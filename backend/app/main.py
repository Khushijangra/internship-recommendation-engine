from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Dict, List

import pandas as pd
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Set up project root path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Import recommendation function using absolute imports
try:
    from backend.app.ml.recommend import get_recommendations
except ImportError as e:
    print(f"Import error: {e}")
    raise ImportError(f"Could not import get_recommendations: {e}")


# Pydantic model for user profile validation
class UserProfile(BaseModel):
    EducationLevel: str
    Skills: str
    SectorInterest: str
    Location: str
    Mode: str
    Language: str
    ExperienceLevel: str


# Initialize FastAPI app
app = FastAPI(
    title="SIH Internship Recommendation API",
    description="AI-Based Internship Recommendation Engine for PM Internship Scheme",
    version="1.0.0"
)

# CORS (update allow_origins for specific frontend domains in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _get_data_path(filename: str) -> str:
    """Get absolute path to data file."""
    return os.path.join(PROJECT_ROOT, "data", filename)


def _get_models_path(filename: str) -> str:
    """Get absolute path to models file."""
    return os.path.join(PROJECT_ROOT, "models", filename)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/recommend")
async def recommend_internships(user_profile: UserProfile):
    """
    Get internship recommendations for a user profile.
    
    Args:
        user_profile: User profile containing education, skills, location, etc.
        
    Returns:
        JSON response with top 5 internship recommendations
    """
    try:
        # Convert Pydantic model to dict
        profile_dict = user_profile.dict()
        
        # Get recommendations
        recommendations = get_recommendations(profile_dict, top_n=5)
        
        return {
            "status": "success",
            "recommendations": recommendations,
            "count": len(recommendations)
        }
        
    except Exception as e:
        print(f"Error in recommend_internships: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating recommendations: {str(e)}"
        )


@app.post("/recommendations")
async def get_recommendations_api(user_profile: UserProfile):
    """
    Return internship recommendations for a user profile.
    Expects the same payload as UserProfile and responds with top recommendations
    including explainability fields from the ML engine.
    """
    try:
        profile_dict = user_profile.dict()
        recommendations = get_recommendations(profile_dict, top_n=5)
        return {"recommendations": recommendations, "count": len(recommendations)}
    except Exception as e:
        print(f"Error in /recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")


@app.post("/upload-internships")
async def upload_internships(
    request: Request,
    file: UploadFile = File(...)
):
    """
    Upload and save internship data (admin only).
    
    Args:
        request: FastAPI request object for headers
        file: CSV file containing internship data
        
    Returns:
        Success message
    """
    # Simple security check
    admin_token = request.headers.get("X-Admin-Token")
    if admin_token != "sih2025":
        raise HTTPException(
            status_code=403,
            detail="Access denied. Admin token required."
        )
    
    # Check file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are allowed"
        )
    
    try:
        # Read uploaded file
        contents = await file.read()
        
        # Save to data directory
        data_dir = os.path.join(PROJECT_ROOT, "data")
        os.makedirs(data_dir, exist_ok=True)
        
        file_path = _get_data_path("internships_cleaned.csv")
        
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Verify file was saved correctly
        df = pd.read_csv(file_path)
        
        return {
            "status": "success",
            "message": f"Successfully uploaded {len(df)} internships",
            "filename": file.filename,
            "rows": len(df)
        }
        
    except Exception as e:
        print(f"Error in upload_internships: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing file: {str(e)}"
        )


@app.get("/internships/count")
async def get_internship_count():
    """Get total number of internships in the system."""
    try:
        file_path = _get_data_path("internships_cleaned.csv")
        
        if not os.path.exists(file_path):
            return {"count": 0, "status": "no_data"}
        
        df = pd.read_csv(file_path)
        return {"count": len(df), "status": "success"}
        
    except Exception as e:
        print(f"Error in get_internship_count: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error reading internship data: {str(e)}"
        )


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "SIH Internship Recommendation API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "recommend": "/recommend (POST)",
            "upload": "/upload-internships (POST)",
            "count": "/internships/count"
        },
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    
    print("Starting SIH Internship Recommendation API...")
    print("API Documentation available at: http://127.0.0.1:8000/docs")
    print("Health check: http://127.0.0.1:8000/health")
    print()
    print("To run from project root:")
    print("  uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000")
    print("  python -m uvicorn backend.app.main:app --reload")
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )