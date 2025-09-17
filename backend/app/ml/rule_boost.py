from __future__ import annotations

import os
import sys
from typing import Dict

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