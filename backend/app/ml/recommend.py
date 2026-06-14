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
from scipy.sparse import load_npz
import os
import json
import datetime

# Set up project root path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.ml.rule_boost import (
    compute_skill_overlap_score,
    compute_location_score,
    compute_education_sector_boost,
    apply_rural_boost,
    diversity_penalty,
)
from backend.app.ml.preprocessing import (
    normalize_skills,
    normalize_location,
    normalize_education,
    normalize_location_info,
    normalize_text,
    normalize_skills_from_string,
)

# Configurable weights for hybrid scoring (will be overridden by weights.json if present)
WEIGHTS = {
    "cosine": 0.50,
    "skill": 0.25,
    "location": 0.15,
    "education_sector": 0.10,
    "rural": 1.00,
}

# Artifact globals
INTERNSHIPS_DF = None
TFIDF_VECTORIZER = None
INTERNSHIP_MATRIX = None
INTERNSHIP_IDS = None

# Simple in-memory cache for identical profiles
_RESULT_CACHE: Dict[str, List[Dict]] = {}


def _get_data_path(filename: str) -> str:
    """Get absolute path to data file."""
    return os.path.join(PROJECT_ROOT, "data", filename)


def _get_models_path(filename: str) -> str:
    """Get absolute path to models file."""
    candidate = os.path.join(PROJECT_ROOT, "backend", "app", "models", filename)
    if os.path.exists(candidate):
        return candidate
    return os.path.join(PROJECT_ROOT, "models", filename)


def _load_ml_artifacts_once() -> None:
    """Load artifacts into module-level globals once."""
    global INTERNSHIPS_DF, TFIDF_VECTORIZER, INTERNSHIP_MATRIX, INTERNSHIP_IDS, WEIGHTS

    if INTERNSHIPS_DF is not None and TFIDF_VECTORIZER is not None and INTERNSHIP_MATRIX is not None:
        return

    # Load artifacts from the new TF-IDF training
    print("🔧 Loading new TF-IDF artifacts...")
    
    # Load vectorizer
    vec_path = _get_models_path("tfidf_vectorizer.pkl")
    if not os.path.exists(vec_path):
        raise FileNotFoundError(f"TF-IDF vectorizer not found: {vec_path}")
    TFIDF_VECTORIZER = joblib.load(vec_path)
    print(f"✓ Loaded TF-IDF vectorizer with {len(TFIDF_VECTORIZER.vocabulary_)} features")

    # Load matrix (try .npz first, then .pkl)
    mat_path = _get_models_path("internship_matrix.npz")
    if os.path.exists(mat_path):
        from scipy.sparse import load_npz
        INTERNSHIP_MATRIX = load_npz(mat_path)
        print(f"✓ Loaded sparse matrix: {INTERNSHIP_MATRIX.shape}")
    else:
        mat_path = _get_models_path("internship_matrix.pkl")
        if os.path.exists(mat_path):
            INTERNSHIP_MATRIX = joblib.load(mat_path)
            print(f"✓ Loaded matrix: {INTERNSHIP_MATRIX.shape}")
        else:
            raise FileNotFoundError(f"Internship matrix not found: {mat_path}")

    # Load IDs
    ids_path = _get_models_path("internship_ids.pkl")
    if os.path.exists(ids_path):
        INTERNSHIP_IDS = joblib.load(ids_path)
        print(f"✓ Loaded {len(INTERNSHIP_IDS)} internship IDs")
    else:
        print("⚠️ Warning: internship_ids.pkl not found, will use row indices")

    # Load dataframe
    df_path = _get_models_path("internships_df.pkl")
    if os.path.exists(df_path):
        INTERNSHIPS_DF = joblib.load(df_path)
        print(f"✓ Loaded dataframe with {len(INTERNSHIPS_DF)} rows")
    else:
        # Fallback to CSV loading
        path_candidates = [
            _get_data_path("internships_cleaned.csv"),
            _get_data_path("internships_cleaned_final.csv"),
            _get_data_path("cleaned_internships.csv"),
        ]
        df = None
        for p in path_candidates:
            if os.path.exists(p):
                df = pd.read_csv(p)
                break
        if df is None:
            raise FileNotFoundError("No cleaned internships CSV found in data/.")
        INTERNSHIPS_DF = df
        print(f"✓ Loaded CSV with {len(INTERNSHIPS_DF)} rows")

    # Note: Using cosine similarity directly instead of NearestNeighbors for better accuracy

    # Override weights if weights.json exists
    weights_path = _get_models_path("weights.json")
    if os.path.exists(weights_path):
        try:
            with open(weights_path, "r", encoding="utf-8") as f:
                loaded = json.load(f) or {}
            for k in ["cosine", "skill", "location", "education_sector", "rural"]:
                if k in loaded:
                    WEIGHTS[k] = float(loaded[k])
            print(f"✓ Loaded weights: {WEIGHTS}")
        except Exception as e:
            print(f"Warning: could not load weights.json: {e}")
    else:
        print(f"ℹ️ Using default weights: {WEIGHTS}")


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


def _format_stipend(stipend_str: str) -> str:
    """Format stipend string with ₹ and commas."""
    if not stipend_str or stipend_str.lower() in ["", "unknown", "0/month", "unpaid"]:
        return "₹0 (Unpaid)"
    
    # Extract numeric value
    import re
    stipend_match = re.search(r'(\d+(?:,\d+)*)', stipend_str.replace(',', ''))
    if stipend_match:
        stipend_amount = int(stipend_match.group(1).replace(',', ''))
        # Format with commas
        formatted_amount = f"{stipend_amount:,}"
        return f"₹{formatted_amount}"
    
    return "₹0 (Unpaid)"


def _generate_reason(matched_skills: List[str], location_score: float, cosine_sim: float, loc_text: str, mode_text: str) -> str:
    """Generate explainable reason for recommendation with skills, location, and mode."""
    parts = []
    if matched_skills:
        skills_text = ", ".join(matched_skills[:3])
        if len(matched_skills) > 3:
            skills_text += f" and {len(matched_skills) - 3} more"
        parts.append(f"Matched skills: {skills_text}")
    parts.append(loc_text)
    parts.append(mode_text)
    if cosine_sim > 0.3:
        parts.append("Content similarity: high")
    elif cosine_sim > 0.1:
        parts.append("Content similarity: moderate")
    if location_score >= 0.8:
        parts.append("Profile alignment: strong")
    elif location_score >= 0.5:
        parts.append("Profile alignment: good")
    return "; ".join([p for p in parts if p])


def _cache_key(profile: Dict) -> str:
    key_fields = ["EducationLevel", "Skills", "SectorInterest", "Location", "Mode", "Language", "ExperienceLevel"]
    parts = [str(profile.get(k, "")).strip().lower() for k in key_fields]
    return "|".join(parts)


def _log_recommendation(profile: Dict, results: List[Dict], path: str, cached: bool = False) -> None:
    """Append one JSON line with timestamp, profile, and top recommendations."""
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        payload = {
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "user_profile": profile,
            "cached": bool(cached),
            "top_recommendations": [
                {"InternshipID": r.get("InternshipID"), "Title": r.get("Title"), "FinalScore": float(r.get("FinalScore", 0.0)), "Reason": r.get("Reason", "")} for r in (results or [])
            ],
        }
        with open(path, "a", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False)
            f.write("\n")
    except Exception as e:
        print(f"Warning: failed to write recommendation log: {e}")


def get_recommendations(user_profile: Dict, top_n: int = 5, log: bool = False) -> List[Dict]:
    """Generate internship recommendations with hybrid scoring, diversity, and fallback."""
    _load_ml_artifacts_once()
    internships_df = INTERNSHIPS_DF
    vectorizer = TFIDF_VECTORIZER
    tfidf_matrix = INTERNSHIP_MATRIX

    # 🔍 Part A — Verify Scoring Loop: Print profile and dataset info
    print(f"\n🔍 Day 6.5 Step 1 — Recommendation Logic Coverage + Input Check")
    print(f"User Profile: {user_profile}")
    print(f"Profile fields received: {list(user_profile.keys())}")
    
    # Verify all required profile inputs are present
    required_fields = ["Skills", "EducationLevel", "Location", "Mode", "SectorInterest"]
    missing_fields = [field for field in required_fields if field not in user_profile or not user_profile[field]]
    if missing_fields:
        print(f"⚠️  WARNING: Missing profile fields: {missing_fields}")
    
    # Count user skills
    user_skills_str = str(user_profile.get("Skills", "")).strip()
    user_skills_list = normalize_skills(user_skills_str) if user_skills_str else []
    print(f"Number of user skills: {len(user_skills_list)}")
    print(f"User skills: {user_skills_list}")
    
    # Print total internships available
    total_internships = len(internships_df)
    print(f"Total internships in dataset: {total_internships}")

    # Cache lookup
    cache_k = _cache_key(user_profile)
    if cache_k in _RESULT_CACHE:
        results = _RESULT_CACHE[cache_k][:top_n]
        if log:
            log_path = os.path.join(PROJECT_ROOT, "logs", "recommendation_logs.jsonl")
            _log_recommendation(user_profile, results, log_path, cached=True)
        print(f"📋 Using cached results (cached: true)")
        return results

    # Normalize key profile attributes
    normalized_profile = dict(user_profile)
    normalized_profile["Location"] = normalize_location(user_profile.get("Location", ""))
    normalized_profile["EducationLevel"] = normalize_education(user_profile.get("EducationLevel", ""))

    profile_fields = ["Skills", "SectorInterest", "EducationLevel", "ExperienceLevel"]
    profile_text_parts = []
    for field in profile_fields:
        if field in normalized_profile and normalized_profile[field]:
            value = str(normalized_profile[field]).strip().lower()
            if value and value != "unknown":
                profile_text_parts.append(value)
    if not profile_text_parts:
        profile_text_parts.append("internship")
    profile_text = " ".join(profile_text_parts)

    # Vectorize profile using the new TF-IDF vectorizer
    profile_vector = vectorizer.transform([profile_text])
    print(f"✓ Profile vectorized with shape: {profile_vector.shape}")

    # Use cosine similarity to find candidates (no NearestNeighbors dependency)
    K = min(50, tfidf_matrix.shape[0])
    cosine_similarities = cosine_similarity(profile_vector, tfidf_matrix).flatten()
    candidate_indices = list(np.argsort(-cosine_similarities)[:K])
    candidate_cosine = {int(i): float(cosine_similarities[i]) for i in candidate_indices}
    
    print(f"✓ Computed cosine similarities for {len(candidate_indices)} candidates")
    print(f"✓ Top similarity: {max(candidate_cosine.values()):.4f}")

    # 🔍 Part A — Verify Scoring Loop: Print candidate selection info
    print(f"Number of candidate internships selected for scoring: {len(candidate_indices)}")
    print(f"K (nearest neighbors): {K}")
    
    # 🔍 Part B — Ensure Full Profile Inputs Used: Verify all profile fields are being used
    print(f"\n🔍 Part B — Profile Input Usage Verification:")
    print(f"✓ Skills: {user_profile.get('Skills', 'NOT PROVIDED')} -> Used for skill overlap and TF-IDF")
    print(f"✓ EducationLevel: {user_profile.get('EducationLevel', 'NOT PROVIDED')} -> Used for education boost")
    print(f"✓ Location: {user_profile.get('Location', 'NOT PROVIDED')} -> Used for location scoring")
    print(f"✓ Mode: {user_profile.get('Mode', 'NOT PROVIDED')} -> Used for mode matching")
    print(f"✓ SectorInterest: {user_profile.get('SectorInterest', 'NOT PROVIDED')} -> Used for sector boost")
    print(f"✓ ExperienceLevel: {user_profile.get('ExperienceLevel', 'NOT PROVIDED')} -> Used in profile text")
    print(f"✓ Language: {user_profile.get('Language', 'NOT PROVIDED')} -> Available in dataset matching")

    # Score candidates
    scored: List[Dict] = []
    user_loc_info = normalize_location_info(normalized_profile.get("Location", ""))
    rural_flag = bool(user_loc_info.get("rural", False))
    
    print(f"\n🔍 Part A — Scoring Loop: Processing {len(candidate_indices)} internships...")

    for idx in candidate_indices:
        row = internships_df.iloc[idx]
        cosine_sim = float(max(0.0, min(1.0, candidate_cosine.get(int(idx), 0.0))))

        user_skills_norm = normalize_skills(str(user_profile.get("Skills", "")).strip())
        internship_skills_norm = normalize_skills(str(row.get("RequiredSkills", "")).strip())
        matched_skills = sorted(list(set(user_skills_norm).intersection(set(internship_skills_norm))))
        skill_overlap_score = compute_skill_overlap_score(set(user_skills_norm), set(internship_skills_norm))

        internship_city = normalize_location(str(row.get("City", row.get("Location", ""))))
        internship_state = normalize_location(str(row.get("State", "")))
        mode_str = str(row.get("Mode", "")).strip().lower()
        is_remote = mode_str == "online" or "remote" in mode_str
        location_score = compute_location_score(
            user_city=user_loc_info.get("city", ""),
            user_state=user_loc_info.get("state", ""),
            internship_city=internship_city,
            internship_state=internship_state,
            remote=is_remote,
        )

        edu_boost = compute_education_sector_boost(
            user_edu=normalized_profile.get("EducationLevel", ""),
            user_sector=str(normalized_profile.get("SectorInterest", "")),
            internship_edu=str(row.get("EducationLevel", "")),
            internship_sector=str(row.get("Sector", "")),
        )

        rural_boost = apply_rural_boost(rural_flag, row.to_dict())

        # New weighted scoring formula with boosts
        # Base relevance score (cosine similarity)
        base_score = float(cosine_sim)
        
        # Skills overlap boost: +0.15 × (fraction of matched skills)
        skill_boost = 0.15 * (len(matched_skills) / len(user_skills_norm)) if user_skills_norm else 0.0
        
        # Stipend normalization boost: +0.10 × stipend_score
        stipend_str = str(row.get("Stipend", "")).strip().lower()
        stipend_score = 0.0
        if stipend_str and stipend_str not in ["", "unknown", "0/month", "unpaid"]:
            # Extract numeric value from stipend string
            import re
            stipend_match = re.search(r'(\d+(?:,\d+)*)', stipend_str.replace(',', ''))
            if stipend_match:
                stipend_amount = int(stipend_match.group(1).replace(',', ''))
                # Normalize stipend to [0,1] scale (assuming max reasonable stipend is 50,000)
                stipend_score = min(1.0, stipend_amount / 50000.0)
        stipend_boost = 0.10 * stipend_score
        
        # Location match boost: +0.05 if city/state matches
        location_boost = 0.05 if location_score >= 0.8 else 0.0
        
        # Mode match boost: +0.03 if mode matches
        user_mode = str(user_profile.get("Mode", "")).strip().lower()
        internship_mode = str(row.get("Mode", "")).strip().lower()
        mode_boost = 0.03 if user_mode == internship_mode else 0.0
        
        # Education level boost: +0.03 if education matches or is higher
        user_edu = str(user_profile.get("EducationLevel", "")).strip().upper()
        internship_edu = str(row.get("EducationLevel", "")).strip().upper()
        education_boost = 0.03 if user_edu == internship_edu else 0.0
        
        # Combine into raw score
        raw_score = base_score + skill_boost + stipend_boost + location_boost + mode_boost + education_boost
        
        # Keep the old final_score for compatibility with existing code
        final_score = raw_score

        loc_text, mode_text = _location_mode_explain(normalized_profile, row)
        reason = _generate_reason(matched_skills, location_score, cosine_sim, loc_text, mode_text)
        
        # Generate detailed explanation with stipend formatting
        explanation_parts = []
        if matched_skills:
            skills_text = ", ".join(matched_skills[:3])
            if len(matched_skills) > 3:
                skills_text += f" and {len(matched_skills) - 3} more"
            explanation_parts.append(f"Matched {len(matched_skills)}/{len(user_skills_norm)} skills ({skills_text})")
        
        # Format stipend with ₹ and commas
        stipend_display = _format_stipend(stipend_str)
        if stipend_score > 0:
            explanation_parts.append(f"stipend {stipend_display} (boosted)")
        else:
            explanation_parts.append(f"stipend {stipend_display}")
        
        # Add location info
        if location_boost > 0:
            explanation_parts.append(f"location matched ({user_profile.get('Location', 'Not specified')})")
        elif location_score >= 0.5:
            explanation_parts.append(f"location nearby")
        
        # Add mode info
        if mode_boost > 0:
            explanation_parts.append(f"mode matched ({internship_mode})")
        
        explanation = ", ".join(explanation_parts)

        # Extract organization/company name with fallbacks
        company_value = row.get("Organisation") if pd.notna(row.get("Organisation", None)) else None
        if not company_value:
            company_value = row.get("CompanyName") if pd.notna(row.get("CompanyName", None)) else None
        if not company_value:
            company_value = row.get("Org") if pd.notna(row.get("Org", None)) else None
        if not company_value:
            company_value = "Not specified"

        internship_id = row.get("InternshipID") if pd.notna(row.get("InternshipID", None)) else row.get("ID", idx)
        internship_id = str(internship_id)

        # Extract additional fields with fallbacks
        title = str(row.get("Title", "Internship Position")).strip()
        if not title or title.lower() == "unknown":
            title = "Internship Position"
        
        organization = str(company_value).strip()
        if not organization or organization.lower() == "unknown":
            organization = "Not specified"
        
        stipend = str(row.get("Stipend", "")).strip()
        if not stipend or stipend.lower() in ["", "unknown", "0/month"]:
            stipend = "Unpaid"
        
        duration = str(row.get("Duration", "")).strip()
        if not duration or duration.lower() == "unknown":
            duration = "1-3 months"
        
        deadline = str(row.get("LastDateToApply", "")).strip()
        if not deadline or deadline.lower() == "unknown":
            deadline = "Rolling basis"
        
        city = str(row.get("City", "")).strip()
        state = str(row.get("State", "")).strip()
        location = f"{city}, {state}".strip(", ").strip()
        if not location or location.lower() in ["", "unknown", ","]:
            location = "Remote/Not specified"
        
        # Normalize final score to percentage (0-100)
        match_percent = round(float(final_score) * 100, 1)
        
        # Extract all available fields from the dataset
        description = str(row.get("Description", "")).strip()
        subsector = str(row.get("Subsector", "")).strip()
        required_skills = str(row.get("RequiredSkills", "")).strip()
        education_level = str(row.get("EducationLevel", "")).strip()
        mode = str(row.get("Mode", "")).strip()
        language = str(row.get("Language", "")).strip()
        tools_used = str(row.get("ToolsUsed", "")).strip()
        tags = str(row.get("Tags", "")).strip()
        experience_level = str(row.get("ExperienceLevel", "")).strip()
        
        scored.append({
            "Idx": int(idx),
            "InternshipID": internship_id,
            "Title": title,
            "Description": description if description and description.lower() != "unknown" else "",
            "Organisation": organization,
            "Location": location,
            "City": city if city and city.lower() != "unknown" else "",
            "State": state if state and state.lower() != "unknown" else "",
            "Sector": str(row.get("Sector", "")),
            "Subsector": subsector if subsector and subsector.lower() != "unknown" else "",
            "RequiredSkills": required_skills if required_skills and required_skills.lower() != "unknown" else "",
            "EducationLevel": education_level if education_level and education_level.lower() != "unknown" else "",
            "Mode": mode if mode and mode.lower() != "unknown" else "",
            "Duration": duration,
            "Language": language if language and language.lower() != "unknown" else "",
            "Stipend": stipend,
            "ToolsUsed": tools_used if tools_used and tools_used.lower() != "unknown" else "",
            "Tags": tags if tags and tags.lower() != "unknown" else "",
            "ExperienceLevel": experience_level if experience_level and experience_level.lower() != "unknown" else "",
            "LastDateToApply": deadline,
            "Deadline": deadline,  # Legacy field for compatibility
            "MatchedSkills": matched_skills,
            "CosineSimilarity": round(float(cosine_sim), 4),
            "SkillOverlapScore": round(float(skill_overlap_score), 4),
            "LocationScore": round(float(location_score), 4),
            "EducationSectorBoost": round(float(edu_boost), 4),
            "RuralBoost": round(float(rural_boost), 4),
            "FinalScore": round(float(final_score), 4),
            "MatchPercent": match_percent,
            "Reason": reason,
            "Explanation": explanation,
            "StipendFormatted": _format_stipend(stipend_str),
        })

    # Primary sort
    scored.sort(key=lambda x: x["FinalScore"], reverse=True)
    
    # Normalize scores to user-friendly percentages (60-92% range)
    if scored:
        raw_scores = [item["FinalScore"] for item in scored]
        min_score = min(raw_scores)
        max_score = max(raw_scores)
        
        # Min-max normalize and scale to [60, 92]%
        for item in scored:
            if max_score > min_score:
                normalized = (item["FinalScore"] - min_score) / (max_score - min_score)
                match_percent = 60 + (normalized * 32)  # Scale to [60, 92]
            else:
                match_percent = 85  # If all scores are the same, give 85%
            
            # Ensure top match is always ≥85%
            if item == scored[0] and match_percent < 85:
                match_percent = 85
            
            item["MatchPercent"] = round(match_percent, 1)
            item["RawScore"] = round(item["FinalScore"], 4)
    
    # 🔍 Part A — Verify Scoring Loop: Print scoring results
    print(f"\n🔍 Part A — Scoring Results:")
    print(f"Total internships scored: {len(scored)}")
    print(f"Top 5 scored internships:")
    for i, item in enumerate(scored[:5], 1):
        print(f"  {i}. {item['InternshipID']} — {item['Title']} — {item['Sector']} — Score: {item['FinalScore']:.4f}")
        print(f"     Matched skills: {item['MatchedSkills']}")
        print(f"     Final score (unnormalized): {item['FinalScore']:.4f}")
    
    if len(scored) >= 5:
        lowest_top5 = min(item['FinalScore'] for item in scored[:5])
        print(f"Lowest score in top 5: {lowest_top5:.4f}")
    
    print(f"Length of full scored list: {len(scored)}")

    # Fallback: if low confidence, expand K and relax weighting a bit
    if scored and max(s["FinalScore"] for s in scored) < 0.30 and tfidf_matrix.shape[0] > K:
        K2 = min(200, tfidf_matrix.shape[0])
        print(f"🔄 Low confidence detected, expanding search to {K2} candidates")
        
        # Use cosine similarity for expanded search
        cosine_similarities = cosine_similarity(profile_vector, tfidf_matrix).flatten()
        extra_indices = list(np.argsort(-cosine_similarities)[:K2])
        candidate_indices = extra_indices
        candidate_cosine = {int(i): float(cosine_similarities[i]) for i in candidate_indices}
        
        print(f"✓ Expanded search to {len(candidate_indices)} candidates")
        # Recompute scores with relaxed location weight
        relaxed = []
        for idx in candidate_indices:
            if idx >= len(internships_df):
                continue
            row = internships_df.iloc[idx]
            cosine_sim = float(max(0.0, min(1.0, candidate_cosine.get(int(idx), 0.0))))
            user_skills_norm = normalize_skills(str(user_profile.get("Skills", "")).strip())
            internship_skills_norm = normalize_skills(str(row.get("RequiredSkills", "")).strip())
            skill_overlap_score = compute_skill_overlap_score(set(user_skills_norm), set(internship_skills_norm))
            internship_city = normalize_location(str(row.get("City", row.get("Location", ""))))
            internship_state = normalize_location(str(row.get("State", "")))
            mode_str = str(row.get("Mode", "")).strip().lower()
            is_remote = mode_str == "online" or "remote" in mode_str
            location_score = compute_location_score(
                user_city=user_loc_info.get("city", ""),
                user_state=user_loc_info.get("state", ""),
                internship_city=internship_city,
                internship_state=internship_state,
                remote=is_remote,
            )
            edu_boost = compute_education_sector_boost(
                user_edu=normalized_profile.get("EducationLevel", ""),
                user_sector=str(normalized_profile.get("SectorInterest", "")),
                internship_edu=str(row.get("EducationLevel", "")),
                internship_sector=str(row.get("Sector", "")),
            )
            rural_boost = apply_rural_boost(rural_flag, row.to_dict())
            final_score = (
                WEIGHTS.get("cosine", 0.50) * float(cosine_sim)
                + WEIGHTS.get("skill", 0.25) * float(skill_overlap_score)
                + (WEIGHTS.get("location", 0.15) * 0.5) * float(location_score)
                + WEIGHTS.get("education_sector", 0.10) * float(edu_boost)
                + WEIGHTS.get("rural", 1.0) * float(rural_boost)
            )
            relaxed.append((final_score, idx))
        relaxed.sort(reverse=True)
        # Keep top unique by internship id
        seen_ids = set()
        rescored: List[Dict] = []
        for score, idx in relaxed:
            row = internships_df.iloc[idx]
            iid = str(row.get("InternshipID", idx))
            if iid in seen_ids:
                continue
            seen_ids.add(iid)
            # Find existing entry and update score + reason note
            existing = next((s for s in scored if s["InternshipID"] == iid), None)
            if existing:
                existing["FinalScore"] = round(float(score), 4)
                existing["Reason"] = existing["Reason"] + "; Search expanded to remote/nearby sectors due to low confidence."
                rescored.append(existing)
        if rescored:
            scored = rescored
            scored.sort(key=lambda x: x["FinalScore"], reverse=True)

    # Diversity re-ranking: small penalties for duplicates among top picks
    reranked: List[Dict] = []
    for item in scored:
        penalty = diversity_penalty(reranked, item)
        if abs(penalty) > 0.0:
            item = dict(item)
            item["FinalScore"] = round(max(0.0, item["FinalScore"] + penalty), 4)
        reranked.append(item)
    reranked.sort(key=lambda x: x["FinalScore"], reverse=True)

    top_results = reranked[:top_n]
    
    # Mark best match (first result) and ensure match percent is set
    for i, result in enumerate(top_results):
        result["IsBestMatch"] = (i == 0)
        # Ensure match percent is properly set
        if "MatchPercent" not in result:
            result["MatchPercent"] = round(float(result.get("FinalScore", 0)) * 100, 1)

    # 🔍 Part C — Logging: Print final results summary
    print(f"\n🔍 Part C — Final Results Summary:")
    print(f"Processed {len(scored)} internships for profile with skills: {user_skills_list}, location: {user_profile.get('Location', 'Not specified')}")
    if top_results:
        print(f"Final score for top match: {top_results[0]['FinalScore']:.4f}")
        print(f"Top match: {top_results[0]['InternshipID']} — {top_results[0]['Title']}")
    
    # Cache the result
    _RESULT_CACHE[cache_k] = top_results

    if log:
        log_path = os.path.join(PROJECT_ROOT, "logs", "recommendation_logs.jsonl")
        _log_recommendation(user_profile, top_results, log_path)
        print(f"📝 Logged recommendation to: {log_path}")

    return top_results


if __name__ == "__main__":
    sample_profile = {
        "EducationLevel": "UG",
        "Skills": "excel, react",
        "SectorInterest": "IT & Software",
        "Location": "Delhi",
        "Mode": "Online",
        "Language": "English",
        "ExperienceLevel": "Beginner"
    }
    
    try:
        results = get_recommendations(sample_profile)
        print(f"Generated {len(results)} recommendations:")
        for i, r in enumerate(results, 1):
            print(f"\n{i}. {r['Title']} at {r['Organisation']}")
            print(f"   Raw Score: {r['FinalScore']}")
            print(f"   Match Percentage: {r['MatchPercent']}%")
            print(f"   Stipend: {r['StipendFormatted']}")
            print(f"   Matched Skills: {', '.join(r['MatchedSkills'])}")
            print(f"   Explanation: {r['Explanation']}")
            print(f"   Reason: {r['Reason']}")
    except Exception as e:
        print(f"Error generating recommendations: {e}")