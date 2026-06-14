from __future__ import annotations

import os
import sys
from typing import Dict, List

from fastapi import APIRouter, HTTPException

# Project root for absolute imports
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.ml.recommend import get_recommendations


router = APIRouter()


def _validate_profile(profile: Dict) -> None:
    required = ["EducationLevel", "Skills", "SectorInterest", "Location"]
    missing = [k for k in required if k not in profile]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required fields: {missing}")


@router.post("/recommendations/explain")
async def explain_recommendations(profile: Dict):
    """Return explainable recommendations with full scoring breakdown.

    Required keys: EducationLevel, Skills, SectorInterest, Location
    """
    if not isinstance(profile, dict):
        raise HTTPException(status_code=400, detail="Invalid payload: expected JSON object")

    _validate_profile(profile)

    # Ensure minimal fallback handling
    safe_profile = dict(profile)
    safe_profile.setdefault("Skills", "")
    safe_profile.setdefault("SectorInterest", "")

    try:
        recs = get_recommendations(safe_profile, top_n=5)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {e}")

    results: List[Dict] = []
    for r in recs or []:
        results.append({
            "InternshipID": r.get("InternshipID"),
            "Title": r.get("Title"),
            "CosineSimilarity": float(r.get("CosineSimilarity", 0.0)),
            "SkillOverlapScore": float(r.get("SkillOverlapScore", 0.0)),
            "LocationScore": float(r.get("LocationScore", 0.0)),
            "EducationSectorBoost": float(r.get("EducationSectorBoost", 0.0)),
            "RuralBoost": float(r.get("RuralBoost", 0.0)),
            "FinalScore": float(r.get("FinalScore", 0.0)),
            "Reason": r.get("Reason", ""),
        })

    return {"results": results}


