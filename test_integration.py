#!/usr/bin/env python3
"""
Test script to verify backend API integration
"""
import requests
import json
import time

def test_backend_api():
    """Test the backend API with sample profiles"""
    
    # Test profiles
    test_profiles = [
        {
            "EducationLevel": "graduation",
            "Skills": "python, react, sql",
            "SectorInterest": "it-software-tech",
            "Location": "karnataka",
            "Mode": "Online",
            "Language": "English",
            "ExperienceLevel": "Entry"
        },
        {
            "EducationLevel": "postgraduation",
            "Skills": "data-analysis, research, statistics",
            "SectorInterest": "research-development",
            "Location": "delhi",
            "Mode": "Offline",
            "Language": "English",
            "ExperienceLevel": "Entry"
        }
    ]
    
    base_url = "http://localhost:8000"
    
    # Test health endpoint
    try:
        print("Testing health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"Health check: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Health check failed: {e}")
        return False
    
    # Test recommendations endpoint
    for i, profile in enumerate(test_profiles, 1):
        try:
            print(f"\nTesting profile {i}...")
            response = requests.post(
                f"{base_url}/recommendations",
                json=profile,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Profile {i} successful!")
                print(f"   Recommendations: {len(data.get('recommendations', []))}")
                if data.get('recommendations'):
                    first_rec = data['recommendations'][0]
                    print(f"   First recommendation: {first_rec.get('Title', 'N/A')}")
            else:
                print(f"❌ Profile {i} failed: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Profile {i} error: {e}")
    
    return True

if __name__ == "__main__":
    print("Starting API integration test...")
    test_backend_api()
    print("\nTest completed!")
