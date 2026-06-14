from __future__ import annotations

import os
import sys
from typing import Dict, Set, List

import pandas as pd

# Set up project root path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


def calculate_rule_boost(user_profile: Dict, internship_row: pd.Series) -> float:
    """
    Calculate a rule-based boost score for a candidate based on how well their profile 
    matches an internship across non-ML dimensions.
    
    Args:
        user_profile: Dictionary containing user information
        internship_row: Pandas Series containing internship information
        
    Returns:
        Float score between 0.0 and 3.0
    """
    total_score = 0.0
    
    # Location scoring
    user_location = user_profile.get("Location", "").strip().lower()
    internship_city = str(internship_row.get("City", "")).strip().lower()
    internship_state = str(internship_row.get("State", "")).strip().lower()
    internship_mode = str(internship_row.get("Mode", "")).strip().lower()
    
    if user_location and internship_city and internship_city != "unknown":
        if user_location == internship_city:
            total_score += 1.0
        elif internship_state and internship_state != "unknown" and user_location == internship_state:
            total_score += 0.6
        elif internship_mode == "online":
            total_score += 0.5
    elif internship_mode == "online":
        total_score += 0.5
    
    # Education Level scoring
    user_education = user_profile.get("EducationLevel", "").strip().lower()
    internship_education = str(internship_row.get("EducationLevel", "")).strip().lower()
    
    if user_education and internship_education and internship_education != "unknown":
        if user_education == internship_education:
            total_score += 0.5
    
    # Experience Level scoring
    user_experience = user_profile.get("ExperienceLevel", "").strip().lower()
    internship_experience = str(internship_row.get("ExperienceLevel", "")).strip().lower()
    
    if user_experience and internship_experience and internship_experience != "unknown":
        if user_experience == internship_experience:
            total_score += 0.5
    
    # Mode scoring
    user_mode = user_profile.get("Mode", "").strip().lower()
    internship_mode = str(internship_row.get("Mode", "")).strip().lower()
    
    if user_mode and internship_mode and internship_mode != "unknown":
        if user_mode == internship_mode:
            total_score += 0.5
    
    return total_score


def normalize_rule_boost(score: float, max_score: float = 3.0) -> float:
    """
    Convert the raw rule-based score into a value between 0.0 and 1.0.
    
    Args:
        score: Raw rule-based score
        max_score: Maximum possible score (default: 3.0)
        
    Returns:
        Normalized score between 0.0 and 1.0
    """
    if max_score <= 0:
        return 0.0
    
    normalized = score / max_score
    return min(max(normalized, 0.0), 1.0)


def compute_skill_overlap_score(user_skills: Set[str], internship_skills: Set[str]) -> float:
    """Return user-recall style overlap score: |intersection| / max(|user_skills|, 1).

    Ensures a float between 0.0 and 1.0.
    """
    if not isinstance(user_skills, set):
        user_skills = set(user_skills or [])
    if not isinstance(internship_skills, set):
        internship_skills = set(internship_skills or [])
    if not user_skills:
        return 0.0
    overlap = user_skills.intersection(internship_skills)
    score = len(overlap) / max(len(user_skills), 1)
    return float(max(0.0, min(1.0, score)))


def compute_location_score(user_city: str, user_state: str, internship_city: str, internship_state: str, remote: bool) -> float:
    """Score location proximity per spec.

    - Same city: 1.0
    - Same state: 0.7
    - Remote allowed: 0.6
    - Otherwise: 0.3
    """
    uc = (user_city or "").strip().lower()
    us = (user_state or "").strip().lower()
    ic = (internship_city or "").strip().lower()
    is_ = (internship_state or "").strip().lower()

    if uc and ic and uc == ic:
        return 1.0
    if us and is_ and us == is_:
        return 0.8
    # Nearby state heuristic: simple overlap by first 3 chars (very lightweight proxy)
    if us and is_ and us[:3] == is_[:3]:
        return 0.5
    if remote:
        return 0.7
    return 0.3


def compute_education_sector_boost(user_edu: str, user_sector: str, internship_edu: str, internship_sector: str) -> float:
    """Small additive boost (max 0.1):
    +0.05 if education level matches or exceeds requirement, +0.05 if sector interest matches.
    Result clamped to [0.0, 1.0].
    """
    level_order = {
        "illiterate": 0,
        "basic": 1,
        "middle": 2,
        "high school": 3,
        "10th pass": 3,
        "12th pass": 4,
        "diploma": 5,
        "certificate": 5,
        "ug": 6,
        "pg": 7,
        "phd": 8,
    }

    def _rank(v: str) -> int:
        key = (v or "").strip().lower()
        return level_order.get(key, 0)

    boost = 0.0
    if _rank(user_edu) >= _rank(internship_edu):
        boost += 0.05

    if user_sector and internship_sector and str(user_sector).strip().lower() == str(internship_sector).strip().lower():
        boost += 0.05

    return float(max(0.0, min(1.0, boost)))


def apply_rural_boost(user_is_rural: bool, internship_row: Dict | None = None) -> float:
    """Apply small rural boost when user is rural and internship suits rural/government context.

    Detection is heuristic: sector or tags include 'government', 'rural', 'ngo', 'public'.
    """
    if not user_is_rural:
        return 0.0
    row = internship_row or {}
    fields: List[str] = [
        str(row.get("Sector", "")),
        str(row.get("Tags", "")),
        str(row.get("Organisation", "")),
        str(row.get("CompanyName", "")),
        str(row.get("Title", "")),
    ]
    text = " ".join(fields).lower()
    if any(k in text for k in ["government", "rural", "ngo", "public sector", "govt"]):
        return 0.05
    return 0.0


def diversity_penalty(selected: List[Dict], candidate: Dict) -> float:
    """Return a small negative penalty if candidate duplicates title/sector/org in selected."""
    cand_title = str(candidate.get("Title", "")).strip().lower()
    cand_sector = str(candidate.get("Sector", "")).strip().lower()
    cand_org = str(candidate.get("CompanyName") or candidate.get("Organisation") or "").strip().lower()

    for s in selected:
        st = str(s.get("Title", "")).strip().lower()
        ss = str(s.get("Sector", "")).strip().lower()
        so = str(s.get("CompanyName") or s.get("Organisation") or "").strip().lower()
        if cand_title and st and cand_title == st:
            return -0.05
        if cand_sector and ss and cand_sector == ss:
            return -0.03
        if cand_org and so and cand_org == so:
            return -0.02
    return 0.0


if __name__ == "__main__":
    # Test with dummy user profile and internship data
    test_user_profile = {
        "Location": "Bengaluru",
        "EducationLevel": "UG",
        "ExperienceLevel": "Beginner",
        "Mode": "Online"
    }
    
    test_internship_row = pd.Series({
        "City": "Bengaluru",
        "State": "Karnataka",
        "EducationLevel": "UG",
        "ExperienceLevel": "Beginner",
        "Mode": "Online"
    })
    
    # Test rule boost calculation
    raw_score = calculate_rule_boost(test_user_profile, test_internship_row)
    normalized_score = normalize_rule_boost(raw_score)
    
    print("Rule Boost Test Results:")
    print(f"User Profile: {test_user_profile}")
    print(f"Internship: {test_internship_row.to_dict()}")
    print(f"Raw Rule Boost Score: {raw_score}")
    print(f"Normalized Score: {normalized_score}")
    print(f"Expected: Perfect match should give 3.0 raw, 1.0 normalized")
    
    # Test with partial match
    partial_user_profile = {
        "Location": "Mumbai",
        "EducationLevel": "PG",
        "ExperienceLevel": "Intermediate",
        "Mode": "Offline"
    }
    
    partial_internship_row = pd.Series({
        "City": "Bengaluru",
        "State": "Karnataka", 
        "EducationLevel": "UG",
        "ExperienceLevel": "Beginner",
        "Mode": "Online"
    })
    
    partial_raw_score = calculate_rule_boost(partial_user_profile, partial_internship_row)
    partial_normalized_score = normalize_rule_boost(partial_raw_score)
    
    print(f"\nPartial Match Test:")
    print(f"User Profile: {partial_user_profile}")
    print(f"Internship: {partial_internship_row.to_dict()}")
    print(f"Raw Rule Boost Score: {partial_raw_score}")
    print(f"Normalized Score: {partial_normalized_score}")
    print(f"Expected: Only online mode match should give 0.5 raw, 0.167 normalized")