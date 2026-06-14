#!/usr/bin/env python3
"""
Comprehensive test script for the frontend functionality
"""
import requests
import json
import time

def test_frontend_endpoints():
    """Test all frontend endpoints"""
    base_url = "http://localhost:3000"
    
    print("Testing Frontend Endpoints...")
    print(f"Base URL: {base_url}")
    
    # Test main page
    try:
        response = requests.get(base_url, timeout=10)
        print(f"\n✅ Main page: {response.status_code}")
        if response.status_code == 200:
            print("   Frontend is running successfully")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"\n❌ Main page failed: {e}")
    
    # Test API proxy
    try:
        response = requests.get(f"{base_url}/api/health", timeout=10)
        print(f"\n✅ API proxy health: {response.status_code}")
        if response.status_code == 200:
            print("   API proxy is working")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"\n❌ API proxy failed: {e}")

def test_recommendations_flow():
    """Test the complete recommendations flow"""
    print("\n" + "="*50)
    print("Testing Recommendations Flow")
    print("="*50)
    
    # Test backend directly
    backend_url = "http://localhost:8000/recommendations"
    test_profile = {
        "EducationLevel": "Bachelor's",
        "Skills": "Python,React,JavaScript",
        "SectorInterest": "Technology",
        "Location": "Delhi",
        "Mode": "Hybrid",
        "Language": "English",
        "ExperienceLevel": "Entry"
    }
    
    try:
        print("1. Testing backend recommendations endpoint...")
        response = requests.post(
            backend_url,
            headers={"Content-Type": "application/json"},
            json=test_profile,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Backend working: {len(data.get('recommendations', []))} recommendations")
        else:
            print(f"   ❌ Backend error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Backend test failed: {e}")
        return False
    
    # Test frontend proxy
    frontend_url = "http://localhost:3000/recommendations"
    try:
        print("2. Testing frontend proxy...")
        response = requests.post(
            frontend_url,
            headers={"Content-Type": "application/json"},
            json=test_profile,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Frontend proxy working: {len(data.get('recommendations', []))} recommendations")
            return True
        else:
            print(f"   ❌ Frontend proxy error: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Frontend proxy test failed: {e}")
        return False

def test_authentication_endpoints():
    """Test authentication related endpoints"""
    print("\n" + "="*50)
    print("Testing Authentication")
    print("="*50)
    
    # Test if Firebase is configured
    try:
        response = requests.get("http://localhost:3000", timeout=10)
        if "firebase" in response.text.lower():
            print("✅ Firebase configuration detected in frontend")
        else:
            print("⚠️  Firebase configuration not detected")
    except Exception as e:
        print(f"❌ Authentication test failed: {e}")

def main():
    """Run all tests"""
    print("🚀 Starting Comprehensive Frontend Tests")
    print("="*60)
    
    # Test frontend
    test_frontend_endpoints()
    
    # Test recommendations flow
    recommendations_working = test_recommendations_flow()
    
    # Test authentication
    test_authentication_endpoints()
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    if recommendations_working:
        print("✅ Recommendations flow: WORKING")
    else:
        print("❌ Recommendations flow: FAILED")
    
    print("\n🔧 Next Steps:")
    print("1. Open http://localhost:3000 in your browser")
    print("2. Test the profile form")
    print("3. Check if recommendations appear")
    print("4. Test sign-out functionality")

if __name__ == "__main__":
    main()
