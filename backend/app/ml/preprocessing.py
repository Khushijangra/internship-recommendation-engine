from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Union
import re

# Set up project root path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


def _load_skill_synonyms() -> dict:
    """Load skill synonyms mapping from JSON file."""
    synonyms_path = os.path.join(os.path.dirname(__file__), "skill_synonyms.json")
    
    try:
        with open(synonyms_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Warning: skill_synonyms.json not found at {synonyms_path}")
        return {}
    except json.JSONDecodeError as e:
        print(f"Warning: Error parsing skill_synonyms.json: {e}")
        return {}


def normalize_text(text: str) -> str:
    """Lowercase, strip punctuation/numbers, light stemming/lemmatization, collapse spaces."""
    if text is None:
        return ""
    value = str(text).lower()
    # Replace punctuation with space, keep alphanumerics
    value = re.sub(r"[^a-z0-9]+", " ", value)
    # Collapse multiple spaces
    value = re.sub(r"\s+", " ", value).strip()

    # Lightweight suffix trimming (very conservative)
    def _stem_token(tok: str) -> str:
        for suf in ("ing", "edly", "edly", "edly", "ed", "ly", "ment", "ments", "tion", "sion", "ness", "ies", "es", "s"):
            if tok.endswith(suf) and len(tok) - len(suf) >= 3:
                return tok[: -len(suf)]
        return tok

    if not value:
        return value
    tokens = [t for t in value.split(" ") if t]
    tokens = [_stem_token(t) for t in tokens]
    return " ".join(tokens)


def expand_synonyms(skill: str) -> str:
    """Optional mapping of synonyms (e.g., 'ml' -> 'machine learning')."""
    if not skill:
        return skill
    
    # Load synonyms
    synonyms = _load_skill_synonyms()
    
    # Check if skill has a synonym mapping
    clean_skill = skill.lower().strip()
    if clean_skill in synonyms:
        return synonyms[clean_skill].lower().strip()
    
    return skill


def expand_synonyms_legacy(tokens: List[str], synonyms_path: str = None) -> List[str]:
    """Expand tokens using a synonyms/abbreviation mapping.

    Tries provided synonyms_path; falls back to backend/app/ml/synonyms.json and data/synonyms.json.
    Mapping format: { "ml": ["machine learning", ...], "js": ["javascript"] }
    """
    # Resolve synonyms file
    candidates: List[str] = []
    if synonyms_path:
        candidates.append(os.path.join(PROJECT_ROOT, synonyms_path) if not os.path.isabs(synonyms_path) else synonyms_path)
    candidates.extend([
        os.path.join(PROJECT_ROOT, "backend", "app", "ml", "synonyms.json"),
        os.path.join(PROJECT_ROOT, "data", "synonyms.json"),
    ])

    mapping: Dict[str, List[str]] = {}
    for p in candidates:
        try:
            if os.path.exists(p):
                with open(p, "r", encoding="utf-8") as f:
                    mapping = json.load(f) or {}
                    break
        except Exception:
            continue

    if not mapping:
        return tokens

    # Build alias->expansions list
    alias_to_expansions: Dict[str, List[str]] = {}
    for canonical, aliases in mapping.items():
        normalized_canon = normalize_text(canonical)
        alias_to_expansions.setdefault(normalized_canon, [])
        for alias in aliases or []:
            alias_to_expansions[normalize_text(alias)] = [normalized_canon]

    expanded: List[str] = []
    for tok in tokens or []:
        t = normalize_text(tok)
        expanded.append(t)
        if t in alias_to_expansions:
            expanded.extend(alias_to_expansions[t])
    return expanded


def normalize_skills(skills: Union[str, List[str]]) -> List[str]:
    """
    Normalize skills by lowercasing, trimming, and mapping synonyms.
    
    Args:
        skills: Comma-separated string or list of skills
        
    Returns:
        Clean list of normalized skills
    """
    if not skills:
        return []
    
    # Convert to list if string
    if isinstance(skills, str):
        skill_list = [s.strip() for s in skills.split(",") if s.strip()]
    else:
        skill_list = [str(s).strip() for s in skills if str(s).strip()]
    
    if not skill_list:
        return []
    
    # Load synonyms
    synonyms = _load_skill_synonyms()
    
    # Normalize each skill
    normalized_skills = []
    for skill in skill_list:
        # Lowercase and trim
        clean_skill = skill.lower().strip()
        
        # Skip empty skills
        if not clean_skill:
            continue
            
        # Map synonyms
        if clean_skill in synonyms:
            clean_skill = synonyms[clean_skill].lower().strip()
        
        # Add to list if not already present
        if clean_skill and clean_skill not in normalized_skills:
            normalized_skills.append(clean_skill)
    
    # Sort for deterministic order
    return sorted(normalized_skills)


def boost_skills(skills_list: list[str]) -> str:
    """Return a string where each high-value skill (python, react, sql, ml, java, aws, tensorflow, etc.)
    appears twice to boost TF-IDF importance. Other skills once."""
    if not skills_list:
        return ""
    
    # High-value skill set
    high_value_skills = {
        "python", "react", "sql", "machine learning", "java", "aws", "tensorflow", 
        "javascript", "node.js", "mongodb", "postgresql", "mysql", "docker", 
        "kubernetes", "git", "github", "gitlab", "jenkins", "ci/cd", "rest api",
        "graphql", "microservices", "spring boot", "django", "flask", "express",
        "angular", "vue", "typescript", "html", "css", "bootstrap", "tailwind",
        "redux", "mobx", "webpack", "babel", "eslint", "jest", "cypress",
        "selenium", "pytest", "junit", "maven", "gradle", "npm", "yarn",
        "linux", "ubuntu", "centos", "windows", "macos", "bash", "powershell",
        "agile", "scrum", "kanban", "jira", "confluence", "slack", "teams",
        "figma", "sketch", "adobe", "photoshop", "illustrator", "xd",
        "tableau", "power bi", "excel", "google analytics", "seo", "sem",
        "wordpress", "shopify", "magento", "woocommerce", "squarespace"
    }
    
    boosted_tokens = []
    for skill in skills_list:
        if not skill:
            continue
        
        clean_skill = skill.lower().strip()
        if clean_skill in high_value_skills:
            # High-value skills appear twice
            boosted_tokens.extend([clean_skill, clean_skill])
        else:
            # Other skills appear once
            boosted_tokens.append(clean_skill)
    
    return " ".join(boosted_tokens)


def boost_skill_tokens(tokens: List[str]) -> List[str]:
    """Boost skill tokens by duplicating and prefixing them to increase TF-IDF weight.

    Example: python -> [python, python, skill_python]
    """
    boosted: List[str] = []
    for t in tokens or []:
        if not t:
            continue
        boosted.extend([t, t, f"skill_{t}"])  # duplicate once and add prefixed
    return boosted


def make_document(row: pd.Series) -> str:
    """Concatenate normalized fields into one text string for TF-IDF:
    Title + Description + Sector + Subsector + Tags + ToolsUsed + boosted RequiredSkills."""
    import pandas as pd
    
    # Extract and normalize fields
    title = normalize_text(str(row.get("Title", "")))
    description = normalize_text(str(row.get("Description", "")))
    sector = normalize_text(str(row.get("Sector", "")))
    subsector = normalize_text(str(row.get("Subsector", "")))
    tags = normalize_text(str(row.get("Tags", "")))
    tools_used = normalize_text(str(row.get("ToolsUsed", "")))
    
    # Process skills with boosting
    required_skills = str(row.get("RequiredSkills", ""))
    if required_skills and required_skills.lower() != "unknown":
        # Split skills and normalize
        skills_list = [s.strip() for s in required_skills.split(",") if s.strip()]
        normalized_skills = []
        for skill in skills_list:
            # Apply synonym expansion
            expanded_skill = expand_synonyms(skill)
            normalized_skills.append(expanded_skill)
        
        # Apply skill boosting
        boosted_skills = boost_skills(normalized_skills)
    else:
        boosted_skills = ""
    
    # Combine all fields
    document_parts = [
        title,
        description,
        sector,
        subsector,
        tags,
        tools_used,
        boosted_skills
    ]
    
    # Filter out empty parts and join
    document = " ".join([part for part in document_parts if part.strip()])
    
    return document


def normalize_skills_from_string(skills_string: str, synonyms_dict: dict) -> List[str]:
    """Normalize skills using a provided synonyms dictionary.

    Args:
        skills_string: Comma-separated skills string
        synonyms_dict: Mapping of canonical_skill -> list of aliases

    Returns:
        List of canonical skill names
    """
    if not skills_string:
        return []

    # Build alias->canonical map for quick lookup
    alias_to_canonical: Dict[str, str] = {}
    for canonical, aliases in (synonyms_dict or {}).items():
        canonical_norm = normalize_text(canonical)
        alias_to_canonical[canonical_norm] = canonical_norm
        for alias in aliases or []:
            alias_to_canonical[normalize_text(alias)] = canonical_norm

    result: List[str] = []
    for raw in [s.strip() for s in str(skills_string).split(',') if s.strip()]:
        norm = normalize_text(raw)
        canonical = alias_to_canonical.get(norm, norm)
        if canonical and canonical not in result:
            result.append(canonical)
    return result


def normalize_location(location: str) -> str:
    """
    Normalize location by lowercasing, trimming, and mapping aliases.
    
    Args:
        location: Location string to normalize
        
    Returns:
        Normalized location string
    """
    if not location:
        return "unknown"
    
    # Basic cleaning
    clean_location = str(location).lower().strip()
    
    if not clean_location or clean_location == "unknown":
        return "unknown"
    
    # Location aliases mapping
    location_aliases = {
        "delhi ncr": "delhi",
        "ncr": "delhi",
        "new delhi": "delhi",
        "bengaluru": "bangalore",
        "bangalore": "bangalore",
        "hydrabad": "hyderabad",
        "hyderabad": "hyderabad",
        "bombay": "mumbai",
        "mumbai": "mumbai",
        "calcutta": "kolkata",
        "kolkata": "kolkata",
        "madras": "chennai",
        "chennai": "chennai",
        "pune": "pune",
        "ahmedabad": "ahmedabad",
        "surat": "surat",
        "jaipur": "jaipur",
        "lucknow": "lucknow",
        "kanpur": "kanpur",
        "nagpur": "nagpur",
        "indore": "indore",
        "thane": "mumbai",
        "bhopal": "bhopal",
        "visakhapatnam": "visakhapatnam",
        "pimpri": "pune",
        "patna": "patna",
        "vadodara": "vadodara",
        "ludhiana": "ludhiana",
        "agra": "agra",
        "nashik": "nashik",
        "faridabad": "faridabad",
        "meerut": "meerut",
        "rajkot": "rajkot",
        "kalyan": "mumbai",
        "vasai": "mumbai",
        "varanasi": "varanasi",
        "srinagar": "srinagar",
        "aurangabad": "aurangabad",
        "noida": "delhi",
        "ghaziabad": "delhi",
        "solapur": "solapur",
        "ranchi": "ranchi",
        "coimbatore": "coimbatore",
        "jabalpur": "jabalpur",
        "gwalior": "gwalior",
        "vijayawada": "vijayawada",
        "jodhpur": "jodhpur",
        "madurai": "madurai",
        "raipur": "raipur",
        "kota": "kota",
        "chandigarh": "chandigarh",
        "guwahati": "guwahati",
        "mysore": "mysore",
        "tiruchirappalli": "tiruchirappalli",
        "bhubaneswar": "bhubaneswar",
        "kochi": "kochi",
        "bhavnagar": "bhavnagar",
        "salem": "salem",
        "warangal": "warangal",
        "guntur": "guntur",
        "bhiwandi": "mumbai",
        "amravati": "amravati",
        "nanded": "nanded",
        "kolhapur": "kolhapur",
        "ulhasnagar": "mumbai",
        "sangli": "sangli",
        "malegaon": "malegaon",
        "ulhasnagar": "mumbai",
        "jalgaon": "jalgaon",
        "akola": "akola",
        "latur": "latur",
        "ahmednagar": "ahmednagar",
        "ichalkaranji": "ichalkaranji",
        "parbhani": "parbhani",
        "jalna": "jalna",
        "bhusawal": "bhusawal",
        "amalner": "amalner",
        "dhule": "dhule",
        "chalisgaon": "chalisgaon",
        "bhadravati": "bhadravati",
        "miraj": "miraj",
        "jalgaon": "jalgaon",
        "bhusawal": "bhusawal",
        "amalner": "amalner",
        "dhule": "dhule",
        "chalisgaon": "chalisgaon",
        "bhadravati": "bhadravati",
        "miraj": "miraj"
    }
    
    # Check for exact matches first
    if clean_location in location_aliases:
        return location_aliases[clean_location]
    
    # Check for partial matches
    for alias, normalized in location_aliases.items():
        if alias in clean_location or clean_location in alias:
            return normalized
    
    # Return cleaned location if no alias found
    return clean_location


def normalize_location_info(location_str: str) -> Dict[str, Union[str, bool]]:
    """Return structured location info with rural detection.

    Args:
        location_str: Raw location string, may contain city/state

    Returns:
        Dict with keys: city (str), state (str), rural (bool)
    """
    if not location_str:
        return {"city": "unknown", "state": "", "rural": False}

    raw = str(location_str).strip()
    lowered = raw.lower()

    # Split on comma to city/state if possible
    parts = [p.strip() for p in lowered.split(',') if p.strip()]
    city = parts[0] if parts else lowered
    state = parts[1] if len(parts) > 1 else ""

    # Map common aliases for city names
    city = normalize_location(city)

    # Minimal rural towns list (illustrative; can be extended later)
    rural_towns = {
        "gopalganj", "barmer", "churu", "siwan", "dholpur", "bundi",
        "sikar", "jalore", "bhind", "chhindwara", "koppal", "balrampur",
        "katihar", "bettiah", "saharsa", "bulandshahr", "begusarai"
    }

    metro_cities = {"delhi", "mumbai", "bangalore", "bengaluru", "hyderabad", "chennai", "kolkata", "pune"}

    is_rural = False
    if city in rural_towns:
        is_rural = True
    elif city in metro_cities:
        is_rural = False

    return {"city": city, "state": state, "rural": is_rural}


def normalize_education(education: str) -> str:
    """
    Normalize education level to standard format.
    
    Args:
        education: Education level string to normalize
        
    Returns:
        Normalized education level
    """
    if not education:
        return "Unknown"
    
    # Basic cleaning
    clean_education = str(education).lower().strip()
    
    if not clean_education or clean_education == "unknown":
        return "Unknown"
    
    # Education level mappings
    education_mappings = {
        # Undergraduate variations
        "undergraduate": "UG",
        "ug": "UG",
        "bachelor": "UG",
        "bachelors": "UG",
        "btech": "UG",
        "b.tech": "UG",
        "be": "UG",
        "b.e": "UG",
        "bca": "UG",
        "bca": "UG",
        "bba": "UG",
        "b.com": "UG",
        "bcom": "UG",
        "b.sc": "UG",
        "bsc": "UG",
        "b.a": "UG",
        "ba": "UG",
        "b.arch": "UG",
        "barch": "UG",
        "bpharm": "UG",
        "b.pharm": "UG",
        "bds": "UG",
        "b.ds": "UG",
        "bpt": "UG",
        "b.pt": "UG",
        "bams": "UG",
        "b.ams": "UG",
        "bhms": "UG",
        "b.hms": "UG",
        "b.vsc": "UG",
        "bvsc": "UG",
        "b.optom": "UG",
        "boptom": "UG",
        "bhm": "UG",
        "b.hm": "UG",
        "bftech": "UG",
        "b.ftech": "UG",
        "bdes": "UG",
        "b.des": "UG",
        "bfa": "UG",
        "b.fa": "UG",
        "bpa": "UG",
        "b.pa": "UG",
        "bsw": "UG",
        "b.sw": "UG",
        "bmm": "UG",
        "b.mm": "UG",
        "bjmc": "UG",
        "b.jmc": "UG",
        "bttm": "UG",
        "b.ttm": "UG",
        "bhmct": "UG",
        "b.hmct": "UG",
        "bvoc": "UG",
        "b.voc": "UG",
        "bpp": "UG",
        "b.pp": "UG",
        "bpp": "UG",
        "b.pp": "UG",
        
        # Postgraduate variations
        "postgraduate": "PG",
        "pg": "PG",
        "master": "PG",
        "masters": "PG",
        "mtech": "PG",
        "m.tech": "PG",
        "me": "PG",
        "m.e": "PG",
        "mca": "PG",
        "mca": "PG",
        "mba": "PG",
        "m.com": "PG",
        "mcom": "PG",
        "m.sc": "PG",
        "msc": "PG",
        "m.a": "PG",
        "ma": "PG",
        "m.arch": "PG",
        "march": "PG",
        "mpharm": "PG",
        "m.pharm": "PG",
        "mds": "PG",
        "m.ds": "PG",
        "mpt": "PG",
        "m.pt": "PG",
        "mams": "PG",
        "m.ams": "PG",
        "mhms": "PG",
        "m.hms": "PG",
        "mvsc": "PG",
        "m.vsc": "PG",
        "moptom": "PG",
        "m.optom": "PG",
        "mhm": "PG",
        "m.hm": "PG",
        "mftech": "PG",
        "m.ftech": "PG",
        "mdes": "PG",
        "m.des": "PG",
        "mfa": "PG",
        "m.fa": "PG",
        "mpa": "PG",
        "m.pa": "PG",
        "msw": "PG",
        "m.sw": "PG",
        "mmm": "PG",
        "m.mm": "PG",
        "mjmc": "PG",
        "m.jmc": "PG",
        "mttm": "PG",
        "m.ttm": "PG",
        "mhmct": "PG",
        "m.hmct": "PG",
        "mvoc": "PG",
        "m.voc": "PG",
        "mpp": "PG",
        "m.pp": "PG",
        "phd": "PhD",
        "doctorate": "PhD",
        "doctor": "PhD",
        "dphil": "PhD",
        "d.phil": "PhD",
        
        # Diploma variations
        "diploma": "Diploma",
        "polytechnic": "Diploma",
        "iti": "Diploma",
        "certificate": "Certificate",
        "certification": "Certificate",
        
        # 12th Pass variations
        "12th pass": "12th Pass",
        "class 12": "12th Pass",
        "senior secondary": "12th Pass",
        "hsc": "12th Pass",
        "h.s.c": "12th Pass",
        "intermediate": "12th Pass",
        "puc": "12th Pass",
        "p.u.c": "12th Pass",
        "plus two": "12th Pass",
        "12th": "12th Pass",
        "xii": "12th Pass",
        "xii pass": "12th Pass",
        "xii pass": "12th Pass",
        
        # 10th Pass variations
        "10th pass": "10th Pass",
        "class 10": "10th Pass",
        "secondary": "10th Pass",
        "ssc": "10th Pass",
        "s.s.c": "10th Pass",
        "matriculation": "10th Pass",
        "10th": "10th Pass",
        "x": "10th Pass",
        "x pass": "10th Pass",
        "x pass": "10th Pass",
        
        # Other variations
        "illiterate": "Illiterate",
        "no formal education": "Illiterate",
        "uneducated": "Illiterate",
        "literate": "Literate",
        "basic": "Basic",
        "elementary": "Basic",
        "primary": "Basic",
        "middle": "Middle",
        "high school": "High School",
        "secondary school": "High School"
    }
    
    # Check for exact matches first
    if clean_education in education_mappings:
        return education_mappings[clean_education]
    
    # Check for partial matches
    for variation, normalized in education_mappings.items():
        if variation in clean_education or clean_education in variation:
            return normalized
    
    # Return title case if no mapping found
    return clean_education.title()


if __name__ == "__main__":
    print("Testing preprocessing functions:")
    print("=" * 50)

    # Load synonyms for v2 skills normalization
    try:
        with open(os.path.join(PROJECT_ROOT, "backend", "app", "ml", "synonyms.json"), "r", encoding="utf-8") as f:
            synonyms = json.load(f)
    except Exception as e:
        print(f"Warning: Could not load synonyms.json: {e}")
        synonyms = {}

    # Test normalize_text
    print("\n1. Testing normalize_text:")
    print(normalize_text("  ML / Data-Science!!  "))

    # Test normalize_skills_from_string
    print("\n2. Testing normalize_skills_from_string:")
    print(normalize_skills_from_string("ML, py, Data Analytics", synonyms))

    # Test normalize_location_info
    print("\n3. Testing normalize_location_info:")
    print(normalize_location_info("Gopalganj, Bihar"))

    # Preserve legacy tests (abbreviated)
    print("\n4. Legacy normalize_location (string):")
    print(normalize_location("Delhi NCR"))

    print("\nDone.")
