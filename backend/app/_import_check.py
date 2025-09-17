#!/usr/bin/env python3
"""
Import check script for SIH Internship Recommendation API.
This script verifies that all imports work correctly from the project root.
"""

import os
import sys

# Set up project root path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

print(f"Project root: {PROJECT_ROOT}")
print("=" * 60)

# Test imports
try:
    print("Testing FastAPI imports...")
    import fastapi
    from fastapi import FastAPI, File, HTTPException, Request, UploadFile
    print("✓ OK: FastAPI imports successful")
except ImportError as e:
    print(f"✗ FAIL: FastAPI import error: {e}")

try:
    print("Testing Pydantic imports...")
    from pydantic import BaseModel
    print("✓ OK: Pydantic imports successful")
except ImportError as e:
    print(f"✗ FAIL: Pydantic import error: {e}")

try:
    print("Testing pandas imports...")
    import pandas as pd
    print("✓ OK: Pandas imports successful")
except ImportError as e:
    print(f"✗ FAIL: Pandas import error: {e}")

try:
    print("Testing ML module imports...")
    from backend.app.ml.recommend import get_recommendations
    print("✓ OK: imported get_recommendations")
except ImportError as e:
    print(f"✗ FAIL: get_recommendations import error: {e}")

try:
    print("Testing rule boost imports...")
    from backend.app.ml.rule_boost import calculate_rule_boost, normalize_rule_boost
    print("✓ OK: imported calculate_rule_boost and normalize_rule_boost")
except ImportError as e:
    print(f"✗ FAIL: rule_boost import error: {e}")

try:
    print("Testing main app import...")
    from backend.app.main import app
    print("✓ OK: imported FastAPI app")
except ImportError as e:
    print(f"✗ FAIL: main app import error: {e}")

# Test data file existence
print("\nTesting data file existence...")
data_files = [
    "data/internships_cleaned.csv",
    "data/internships.csv",
    "data/user_profiles.csv"
]

for file_path in data_files:
    full_path = os.path.join(PROJECT_ROOT, file_path)
    if os.path.exists(full_path):
        print(f"✓ OK: {file_path} exists")
    else:
        print(f"✗ MISSING: {file_path}")

# Test model file existence
print("\nTesting model file existence...")
model_files = [
    "models/tfidf.pkl",
    "models/internship_tfidf_matrix.pkl"
]

for file_path in model_files:
    full_path = os.path.join(PROJECT_ROOT, file_path)
    if os.path.exists(full_path):
        print(f"✓ OK: {file_path} exists")
    else:
        print(f"✗ MISSING: {file_path} (run preprocess.py to generate)")

print("\n" + "=" * 60)
print("Import check completed!")

# Test a simple recommendation if possible
try:
    print("\nTesting recommendation function...")
    test_profile = {
        "EducationLevel": "UG",
        "Skills": "python, sql",
        "SectorInterest": "IT & Software",
        "Location": "Bengaluru",
        "Mode": "Online",
        "Language": "English",
        "ExperienceLevel": "Beginner"
    }
    
    recommendations = get_recommendations(test_profile, top_n=3)
    print(f"✓ OK: Generated {len(recommendations)} recommendations")
    if recommendations:
        print(f"  Sample: {recommendations[0]['Title']} (Score: {recommendations[0]['FinalScore']})")
    
except Exception as e:
    print(f"✗ FAIL: Recommendation test error: {e}")

print("\n" + "=" * 60)
print("All tests completed!")
