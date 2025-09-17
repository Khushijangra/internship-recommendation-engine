from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import List, Union

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
    
    return normalized_skills


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
    
    # Test normalize_skills
    print("\n1. Testing normalize_skills:")
    test_skills = ["Python, ML, Data Science", ["js", "react", "nodejs"], "C++, RDBMS, AI"]
    for skills in test_skills:
        result = normalize_skills(skills)
        print(f"   Input: {skills}")
        print(f"   Output: {result}")
    
    # Test normalize_location
    print("\n2. Testing normalize_location:")
    test_locations = ["Delhi NCR", "Bengaluru", "Hydrabad", "Bombay", "Unknown", ""]
    for location in test_locations:
        result = normalize_location(location)
        print(f"   Input: '{location}'")
        print(f"   Output: '{result}'")
    
    # Test normalize_education
    print("\n3. Testing normalize_education:")
    test_educations = ["Undergraduate", "UG", "Bachelor", "Postgraduate", "PG", "Master", "12th Pass", "Class 12", "Diploma", "PhD", "Unknown", ""]
    for education in test_educations:
        result = normalize_education(education)
        print(f"   Input: '{education}'")
        print(f"   Output: '{result}'")
    
    print("\n" + "=" * 50)
    print("All tests completed!")
