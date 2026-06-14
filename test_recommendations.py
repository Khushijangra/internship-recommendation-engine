#!/usr/bin/env python3
"""
Test script for the recommendations API endpoint
"""
import requests
import json

def test_recommendations_api():
    """Test the recommendations API endpoint"""
    url = "http://localhost:8000/recommendations"
    
    # Test data
    test_profile = {
        "EducationLevel": "Bachelor's",
        "Skills": "Python,React,JavaScript",
        "SectorInterest": "Technology",
        "Location": "Delhi",
        "Mode": "Hybrid",
        "Language": "English",
        "ExperienceLevel": "Entry"
    }
    
    print("Testing recommendations API...")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(test_profile, indent=2)}")
    
    try:
        response = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            json=test_profile,
            timeout=30
        )
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Success! Received {len(data.get('recommendations', []))} recommendations")
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"\n❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Request failed: {e}")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")

def test_health_endpoint():
    """Test the health endpoint"""
    url = "http://localhost:8000/health"
    
    print("\nTesting health endpoint...")
    print(f"URL: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Health Status: {response.status_code}")
        print(f"Health Response: {response.json()}")
    except Exception as e:
        print(f"Health check failed: {e}")

if __name__ == "__main__":
    test_health_endpoint()
    test_recommendations_api()
