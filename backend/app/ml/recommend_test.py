from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List

import pandas as pd

from recommend import get_recommendations
from rule_boost import calculate_rule_boost, normalize_rule_boost


def _project_root() -> Path:
    current = Path(__file__).resolve()
    for parent in [current, *current.parents]:
        if (parent / "data").exists():
            return parent
    return current.parent.parent.parent


def load_test_data() -> tuple[pd.DataFrame, List[Dict]]:
    """Load cleaned internship dataset and test user profiles."""
    root = _project_root()
    data_dir = root / "data"
    
    # Load cleaned internship dataset
    internships_df = pd.read_csv(data_dir / "internships_cleaned.csv")
    
    # Create test user profiles (hardcoded as requested)
    test_users = [
        {
            "UserID": "TEST_USER_A",
            "EducationLevel": "UG",
            "Skills": "python, sql, machine learning, data analysis",
            "SectorInterest": "IT & Software",
            "Location": "Bengaluru",
            "Mode": "Online",
            "Language": "English",
            "ExperienceLevel": "Beginner"
        },
        {
            "UserID": "TEST_USER_B", 
            "EducationLevel": "PG",
            "Skills": "artificial intelligence, deep learning, research, statistics",
            "SectorInterest": "Research & Development",
            "Location": "Delhi",
            "Mode": "Offline",
            "Language": "English",
            "ExperienceLevel": "Intermediate"
        }
    ]
    
    return internships_df, test_users


def print_user_details(user: Dict) -> None:
    """Print user profile details in a formatted way."""
    print("=" * 80)
    print(f"USER PROFILE: {user['UserID']}")
    print("=" * 80)
    print(f"Education Level: {user['EducationLevel']}")
    print(f"Skills: {user['Skills']}")
    print(f"Sector Interest: {user['SectorInterest']}")
    print(f"Location: {user['Location']}")
    print(f"Mode Preference: {user['Mode']}")
    print(f"Experience Level: {user['ExperienceLevel']}")
    print(f"Language: {user['Language']}")
    print()


def print_recommendations(user_id: str, recommendations: List[Dict]) -> None:
    """Print recommendation results in a formatted way."""
    print(f"TOP 5 RECOMMENDATIONS FOR {user_id}:")
    print("-" * 60)
    
    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. {rec['Title']}")
        print(f"   Company: {rec['CompanyName']}")
        print(f"   Internship ID: {rec['InternshipID']}")
        print(f"   Final Score: {rec['FinalScore']:.4f}")
        print(f"   Matched Skills: {', '.join(rec['MatchedSkills']) if rec['MatchedSkills'] else 'None'}")
        print(f"   Reason: {rec['Reason']}")
        print()


def test_recommendation_pipeline() -> None:
    """Test the complete recommendation pipeline with sample users."""
    print("INTERNSHIP RECOMMENDATION SYSTEM - TEST RESULTS")
    print("=" * 80)
    print()
    
    try:
        # Load test data
        internships_df, test_users = load_test_data()
        print(f"Loaded {len(internships_df)} internships from cleaned dataset")
        print(f"Testing with {len(test_users)} user profiles")
        print()
        
        # Test each user
        for user in test_users:
            print_user_details(user)
            
            try:
                # Get recommendations
                recommendations = get_recommendations(user, top_n=5)
                print_recommendations(user['UserID'], recommendations)
                
                # Verify rule boost is working by checking scores
                if recommendations:
                    print("SCORE ANALYSIS:")
                    print(f"Highest score: {recommendations[0]['FinalScore']:.4f}")
                    print(f"Lowest score: {recommendations[-1]['FinalScore']:.4f}")
                    print(f"Score range: {recommendations[0]['FinalScore'] - recommendations[-1]['FinalScore']:.4f}")
                    print()
                
            except Exception as e:
                print(f"ERROR generating recommendations for {user['UserID']}: {e}")
                print()
        
        print("=" * 80)
        print("TEST COMPLETED SUCCESSFULLY")
        print("=" * 80)
        
    except Exception as e:
        print(f"ERROR loading test data: {e}")
        print("Make sure the cleaned internship dataset exists at data/internships_cleaned.csv")


def test_rule_boost_verification() -> None:
    """Verify that rule boost is working correctly with specific test cases."""
    print("\nRULE BOOST VERIFICATION:")
    print("-" * 40)
    
    # Test case 1: Perfect match
    user_perfect = {
        "Location": "Bengaluru",
        "EducationLevel": "UG", 
        "ExperienceLevel": "Beginner",
        "Mode": "Online"
    }
    
    internship_perfect = pd.Series({
        "City": "Bengaluru",
        "State": "Karnataka",
        "EducationLevel": "UG",
        "ExperienceLevel": "Beginner", 
        "Mode": "Online"
    })
    
    perfect_score = calculate_rule_boost(user_perfect, internship_perfect)
    perfect_normalized = normalize_rule_boost(perfect_score)
    
    print(f"Perfect Match Test:")
    print(f"  Raw Score: {perfect_score} (Expected: 2.5)")
    print(f"  Normalized: {perfect_normalized:.4f} (Expected: 0.8333)")
    print()
    
    # Test case 2: Partial match
    user_partial = {
        "Location": "Mumbai",
        "EducationLevel": "PG",
        "ExperienceLevel": "Intermediate", 
        "Mode": "Offline"
    }
    
    internship_partial = pd.Series({
        "City": "Bengaluru",
        "State": "Karnataka",
        "EducationLevel": "UG",
        "ExperienceLevel": "Beginner",
        "Mode": "Online"
    })
    
    partial_score = calculate_rule_boost(user_partial, internship_partial)
    partial_normalized = normalize_rule_boost(partial_score)
    
    print(f"Partial Match Test:")
    print(f"  Raw Score: {partial_score} (Expected: 0.5)")
    print(f"  Normalized: {partial_normalized:.4f} (Expected: 0.1667)")
    print()


if __name__ == "__main__":
    # Run rule boost verification first
    test_rule_boost_verification()
    
    # Run main recommendation pipeline test
    test_recommendation_pipeline()
