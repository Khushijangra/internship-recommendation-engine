from __future__ import annotations

import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

# Set up project root path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Import rule boost functions
from backend.app.ml.rule_boost import calculate_rule_boost, normalize_rule_boost
from backend.app.ml.preprocessing import normalize_skills, normalize_location, normalize_education


def _get_data_path(filename: str) -> str:
    """Get absolute path to data file."""
    return os.path.join(PROJECT_ROOT, "data", filename)


def _get_models_path(filename: str) -> str:
    """Get absolute path to models file."""
    return os.path.join(PROJECT_ROOT, "models", filename)


def _load_ml_artifacts() -> Tuple[pd.DataFrame, object, np.ndarray]:
    """Load cleaned dataset, vectorizer, and TF-IDF matrix."""
    # Load cleaned internship dataset
    internships_path = _get_data_path("internships_cleaned.csv")
    if not os.path.exists(internships_path):
        raise FileNotFoundError(f"Cleaned dataset not found at: {internships_path}")
    
    internships_df = pd.read_csv(internships_path)
    
    # Load TF-IDF vectorizer (try preferred path first, then fallback)
    vectorizer_candidates = [
        _get_models_path("tfidf_vectorizer.pkl"),
        _get_models_path("tfidf.pkl")
    ]
    vectorizer = None
    for vp in vectorizer_candidates:
        if os.path.exists(vp):
            vectorizer = joblib.load(vp)
            break
    if vectorizer is None:
        raise FileNotFoundError(
            "TF-IDF vectorizer not found. Expected at models/tfidf_vectorizer.pkl or models/tfidf.pkl"
        )
    
    # Load TF-IDF matrix (try preferred path first, then fallback)
    matrix_candidates = [
        _get_models_path("internship_matrix.pkl"),
        _get_models_path("internship_tfidf_matrix.pkl")
    ]
    tfidf_matrix = None
    for mp in matrix_candidates:
        if os.path.exists(mp):
            tfidf_matrix = joblib.load(mp)
            break
    if tfidf_matrix is None:
        raise FileNotFoundError(
            "TF-IDF matrix not found. Expected at models/internship_matrix.pkl or models/internship_tfidf_matrix.pkl"
        )
    
    return internships_df, vectorizer, tfidf_matrix


def _calculate_skill_overlap_user_recall(user_skills: str, internship_skills: str) -> Tuple[float, List[str], List[str]]:
    """Return user-recall style overlap score and normalized skill lists.
    Score = matched_count / total_user_skills.
    """
    if not user_skills or not internship_skills:
        return 0.0, [], []
    user_norm = normalize_skills(user_skills)
    intern_norm = normalize_skills(internship_skills)
    if not user_norm or not intern_norm:
        return 0.0, user_norm, intern_norm
    matched = sorted(list(set(user_norm).intersection(set(intern_norm))))
    score = len(matched) / len(user_norm) if user_norm else 0.0
    return score, matched, user_norm


def _get_matched_skills(user_skills: str, internship_skills: str) -> List[str]:
    """Get list of normalized skills that match between user and internship."""
    if not user_skills or not internship_skills:
        return []
    
    user_skill_list = normalize_skills(user_skills)
    internship_skill_list = normalize_skills(internship_skills)
    
    user_skill_set = set(user_skill_list)
    internship_skill_set = set(internship_skill_list)
    
    matched = user_skill_set.intersection(internship_skill_set)
    return list(sorted(matched))


def _location_mode_explain(user_profile: Dict, internship_row: pd.Series) -> Tuple[str, str]:
    """Return textual explanations for location match level and mode match."""
    user_location_norm = normalize_location(user_profile.get("Location", ""))
    city_norm = normalize_location(str(internship_row.get("City", "")))
    state_norm = normalize_location(str(internship_row.get("State", "")))
    mode_user = str(user_profile.get("Mode", "")).strip().lower()
    mode_intern = str(internship_row.get("Mode", "")).strip().lower()

    # Location explanation
    if user_location_norm and user_location_norm != "unknown":
        if city_norm and user_location_norm == city_norm:
            loc_text = "Location: same city"
        elif state_norm and user_location_norm == state_norm:
            loc_text = "Location: same state"
        elif mode_intern == "online":
            loc_text = "Location: remote allowed"
        else:
            loc_text = "Location: different"
    else:
        loc_text = "Location: not specified"

    # Mode explanation
    if mode_user and mode_intern:
        mode_text = "Mode: matched" if mode_user == mode_intern else f"Mode: prefers {mode_user}, offered {mode_intern}"
    elif mode_intern:
        mode_text = f"Mode: {mode_intern}"
    else:
        mode_text = "Mode: not specified"

    return loc_text, mode_text


def _generate_reason(matched_skills: List[str], rule_boost_norm: float, cosine_sim: float, loc_text: str, mode_text: str) -> str:
    """Generate explainable reason for recommendation with skills, location, and mode."""
    parts = []
    if matched_skills:
        skills_text = ", ".join(matched_skills[:3])
        if len(matched_skills) > 3:
            skills_text += f" and {len(matched_skills) - 3} more"
        parts.append(f"Matched skills: {skills_text}")
    parts.append(loc_text)
    parts.append(mode_text)
    # High-level hints (non-intrusive, keep prior behavior flavor without changing logic)
    if cosine_sim > 0.3:
        parts.append("Content similarity: high")
    elif cosine_sim > 0.1:
        parts.append("Content similarity: moderate")
    if rule_boost_norm > 0.3:
        parts.append("Profile alignment: strong")
    elif rule_boost_norm > 0.1:
        parts.append("Profile alignment: good")
    return "; ".join([p for p in parts if p])


def get_recommendations(user_profile: Dict, top_n: int = 5) -> List[Dict]:
    """
    Generate internship recommendations for a given user profile.
    
    Args:
        user_profile: Dictionary containing user information
        top_n: Number of top recommendations to return
        
    Returns:
        List of recommendation dictionaries
    """
    # Load ML artifacts
    internships_df, vectorizer, tfidf_matrix = _load_ml_artifacts()
    
    # Normalize key profile attributes
    normalized_profile = dict(user_profile)
    normalized_profile["Location"] = normalize_location(user_profile.get("Location", ""))
    normalized_profile["EducationLevel"] = normalize_education(user_profile.get("EducationLevel", ""))
    # Build vectorization text with normalized fields and raw skills text (vectorizer expects free text)
    profile_fields = ["Skills", "SectorInterest", "EducationLevel", "ExperienceLevel"]
    profile_text_parts = []
    for field in profile_fields:
        if field in normalized_profile and normalized_profile[field]:
            value = str(normalized_profile[field]).strip().lower()
            if value and value != "unknown":
                profile_text_parts.append(value)
    
    if not profile_text_parts:
        raise ValueError("No valid profile fields found for vectorization")
    
    # Combine and preprocess profile text
    profile_text = " ".join(profile_text_parts)
    
    # Vectorize user profile
    profile_vector = vectorizer.transform([profile_text])
    
    # Compute cosine similarity
    cosine_similarities = cosine_similarity(profile_vector, tfidf_matrix).flatten()
    
    # Calculate scores for each internship
    recommendations = []
    
    for idx, row in internships_df.iterrows():
        # Get cosine similarity score
        cosine_sim = cosine_similarities[idx]
        
        # Calculate skill overlap (user-recall style) and matched skills
        user_skills = str(user_profile.get("Skills", "")).strip()
        internship_skills = str(row.get("RequiredSkills", "")).strip()
        skill_overlap_score, matched_skills, user_norm_skills = _calculate_skill_overlap_user_recall(user_skills, internship_skills)
        
        # Calculate rule-based boost and normalize it
        raw_rule_boost = calculate_rule_boost(normalized_profile, row)
        normalized_rule_boost = normalize_rule_boost(raw_rule_boost)
        
        # Calculate final score using the exact formula
        final_score = 0.55 * cosine_sim + 0.30 * skill_overlap_score + 0.15 * normalized_rule_boost
        
        # Location/mode explanation
        loc_text, mode_text = _location_mode_explain(normalized_profile, row)
        
        # Generate reason
        reason = _generate_reason(matched_skills, normalized_rule_boost, cosine_sim, loc_text, mode_text)
        
        # Create recommendation entry
        company_value = row.get("CompanyName") if pd.notna(row.get("CompanyName", None)) else None
        if not company_value:
            company_value = row.get("Organisation") if pd.notna(row.get("Organisation", None)) else row.get("Org", None)
        if not company_value:
            company_value = "Unknown"

        # Internship ID as string, prefer CSV's "InternshipID"
        internship_id = row.get("InternshipID") if pd.notna(row.get("InternshipID", None)) else row.get("ID", idx)
        internship_id = str(internship_id)

        recommendation = {
            "InternshipID": internship_id,
            "Title": str(row.get("Title", "Unknown")),
            "CompanyName": str(company_value),
            "MatchedSkills": matched_skills,
            "CosineSimilarity": round(float(cosine_sim), 4),
            "RuleBoostRaw": round(float(raw_rule_boost), 4),
            "RuleBoostScore": round(float(raw_rule_boost), 4),
            "RuleBoostNormalized": round(float(normalized_rule_boost), 4),
            "FinalScore": round(float(final_score), 4),
            # Required explicit overlap metric per spec
            "SkillOverlapScore": round(float(skill_overlap_score), 4),
            "Reason": reason
        }
        
        recommendations.append(recommendation)
    
    # Sort by final score and return top N
    recommendations.sort(key=lambda x: x["FinalScore"], reverse=True)
    return recommendations[:top_n]


if __name__ == "__main__":
    sample_profile = {
        "EducationLevel": "UG",
        "Skills": "python, sql, machine learning",
        "SectorInterest": "IT & Software",
        "Location": "Bengaluru",
        "Mode": "Online",
        "Language": "English",
        "ExperienceLevel": "Beginner"
    }
    
    try:
        results = get_recommendations(sample_profile)
        print(f"Generated {len(results)} recommendations:")
        for i, r in enumerate(results, 1):
            print(f"\n{i}. {r['Title']} at {r['CompanyName']}")
            print(f"   Score: {r['FinalScore']}")
            print(f"   Matched Skills: {', '.join(r['MatchedSkills'])}")
            print(f"   Reason: {r['Reason']}")
    except Exception as e:
        print(f"Error generating recommendations: {e}")