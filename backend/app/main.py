from __future__ import annotations

import logging
import os
import sys
from pathlib import Path
from typing import Dict, List

from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Load environment variables from backend/.env (if present).
# In production (Railway), variables are injected directly — load_dotenv is a
# no-op when the file doesn't exist, so this is safe in all environments.
# ---------------------------------------------------------------------------
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Admin token — MUST be set via environment variable.
# Never hardcode this value in source code.
# Set ADMIN_TOKEN in backend/.env (local) or Railway env vars (production).
# ---------------------------------------------------------------------------
ADMIN_TOKEN: str = os.getenv("ADMIN_TOKEN", "")

if not ADMIN_TOKEN:
    logger.warning(
        "[SECURITY] ADMIN_TOKEN environment variable is not set. "
        "The /upload-internships endpoint will reject ALL requests until this is configured. "
        "See backend/.env.example for setup instructions."
    )

import pandas as pd
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import APIRouter

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
# Include routers
try:
    from backend.app.routes.recommendations import router as explain_router
    app.include_router(explain_router)
except Exception as e:
    print(f"Warning: could not include explain router: {e}")

try:
    from backend.app.routes.applications import router as applications_router
    app.include_router(applications_router)
except Exception as e:
    print(f"Warning: could not include applications router: {e}")


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
		
		# 🔍 Step 1 — Backend input logging
		print(f"\n🔍 Backend Input Logging:")
		print(f"Received profile: {profile_dict}")
		print(f"Profile fields: {list(profile_dict.keys())}")
		print(f"Profile values: {list(profile_dict.values())}")
		
		raw_recommendations = get_recommendations(profile_dict, top_n=5)
		
		# Log scoring results
		print(f"Scored: {len(raw_recommendations) if raw_recommendations else 0} internships")
		if raw_recommendations and len(raw_recommendations) >= 3:
			print(f"Top 3 recommendations:")
			for i, rec in enumerate(raw_recommendations[:3], 1):
				print(f"  {i}. {rec.get('InternshipID', 'N/A')} — {rec.get('Title', 'N/A')} — Score: {rec.get('FinalScore', 0):.3f}")
				print(f"     Reason: {rec.get('Reason', 'N/A')[:100]}...")
		elif raw_recommendations:
			print(f"Top recommendation: {raw_recommendations[0].get('InternshipID', 'N/A')} — {raw_recommendations[0].get('Title', 'N/A')} — Score: {raw_recommendations[0].get('FinalScore', 0):.3f}")

		# Normalize and polish response without changing ML logic
		def _as_float_two_decimals(value) -> float:
			try:
				return round(float(value), 2)
			except Exception:
				return 0.0

		def _short_reason(text: str) -> str:
			if not isinstance(text, str):
				return "Recommended based on skills and profile fit."
			text = text.strip().replace("\n", " ")
			return text[:240]

		normalized: List[Dict] = []
		for item in raw_recommendations or []:
			# Be defensive about key casing and presence
			internship_id = item.get("InternshipID") or item.get("internship_id") or item.get("id")
			title = item.get("Title") or item.get("title")
			organisation = item.get("Organisation") or item.get("Organization") or item.get("Company") or item.get("company")
			location = item.get("Location") or item.get("City") or item.get("location")
			mode = item.get("Mode") or item.get("mode")
			duration = item.get("Duration") or item.get("duration")
			matched_skills = item.get("MatchedSkills") or item.get("matched_skills") or item.get("Skills") or []
			final_score = item.get("FinalScore") or item.get("final_score")
			reason = item.get("Reason") or item.get("reason")

			# Ensure types/format
			if isinstance(matched_skills, str):
				matched_skills = [s.strip() for s in matched_skills.split(',') if s.strip()]

			normalized.append({
				"InternshipID": internship_id,
				"Title": title,
				"Description": item.get("Description", ""),
				"Organisation": organisation,
				"City": item.get("City", ""),
				"State": item.get("State", ""),
				"Location": location,
				"Sector": item.get("Sector", ""),
				"Subsector": item.get("Subsector", ""),
				"RequiredSkills": item.get("RequiredSkills", ""),
				"EducationLevel": item.get("EducationLevel", ""),
				"ExperienceLevel": item.get("ExperienceLevel", ""),
				"Mode": mode,
				"Duration": duration,
				"Language": item.get("Language", "English"),
				"Stipend": item.get("Stipend", "Unpaid"),
				"StipendFormatted": item.get("StipendFormatted", "₹0 (Unpaid)"),
				"ToolsUsed": item.get("ToolsUsed", ""),
				"Tags": item.get("Tags", ""),
				"LastDateToApply": item.get("LastDateToApply", item.get("Deadline", "Rolling basis")),
				"Deadline": item.get("Deadline", "Rolling basis"),
				"MatchedSkills": matched_skills if isinstance(matched_skills, list) else [],
				"FinalScore": _as_float_two_decimals(final_score),
				"MatchPercent": _as_float_two_decimals(item.get("MatchPercent", final_score * 100)),
				"IsBestMatch": item.get("IsBestMatch", False),
				"Reason": _short_reason(reason),
				"Explanation": item.get("Explanation", ""),
			})

		# Log final response
		print(f"Returning {len(normalized)} normalized recommendations")
		if normalized:
			print(f"First recommendation: {normalized[0].get('InternshipID', 'N/A')} — {normalized[0].get('Title', 'N/A')} — Score: {normalized[0].get('FinalScore', 0):.3f}")
		
		return {
			"user_profile": profile_dict,
			"recommendations": normalized
		}
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
	# Security check — token must match ADMIN_TOKEN environment variable.
	# If ADMIN_TOKEN is not configured, ALL upload requests are denied.
	provided_token = request.headers.get("X-Admin-Token", "")
	if not ADMIN_TOKEN:
		raise HTTPException(
			status_code=503,
			detail="Upload endpoint is disabled: ADMIN_TOKEN environment variable is not configured."
		)
	if not provided_token or provided_token != ADMIN_TOKEN:
		raise HTTPException(
			status_code=403,
			detail="Access denied. Valid admin token required."
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