from __future__ import annotations

import os
import sys
import json
from typing import Dict, List
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Project root for absolute imports
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

router = APIRouter()

# Pydantic model for application data
class ApplicationRequest(BaseModel):
    user_id: str
    internship_id: str
    internship_title: str
    organization: str
    status: str = "applied"
    notes: str = ""

class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    internship_id: str
    internship_title: str
    organization: str
    applied_at: str
    status: str
    notes: str

# In-memory storage for applications (replace with database in production)
APPLICATIONS_FILE = os.path.join(PROJECT_ROOT, "data", "applications.json")

def _load_applications() -> List[Dict]:
    """Load applications from JSON file."""
    if os.path.exists(APPLICATIONS_FILE):
        try:
            with open(APPLICATIONS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading applications: {e}")
            return []
    return []

def _save_applications(applications: List[Dict]) -> None:
    """Save applications to JSON file."""
    os.makedirs(os.path.dirname(APPLICATIONS_FILE), exist_ok=True)
    try:
        with open(APPLICATIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(applications, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving applications: {e}")

@router.post("/applications", response_model=ApplicationResponse)
async def create_application(application: ApplicationRequest):
    """
    Create a new application record.
    
    Args:
        application: Application data including user_id, internship_id, etc.
        
    Returns:
        Created application with generated ID and timestamp
    """
    try:
        # Load existing applications
        applications = _load_applications()
        
        # Generate new application ID
        new_id = f"APP_{len(applications) + 1:06d}"
        
        # Create application record
        application_data = {
            "id": new_id,
            "user_id": application.user_id,
            "internship_id": application.internship_id,
            "internship_title": application.internship_title,
            "organization": application.organization,
            "applied_at": datetime.now().isoformat(),
            "status": application.status,
            "notes": application.notes
        }
        
        # Add to applications list
        applications.append(application_data)
        
        # Save to file
        _save_applications(applications)
        
        print(f"✅ Application created: {new_id} for user {application.user_id}")
        print(f"   Internship: {application.internship_title} at {application.organization}")
        
        return ApplicationResponse(**application_data)
        
    except Exception as e:
        print(f"❌ Error creating application: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating application: {str(e)}")

@router.get("/applications/{user_id}", response_model=List[ApplicationResponse])
async def get_user_applications(user_id: str):
    """
    Get all applications for a specific user.
    
    Args:
        user_id: User ID to fetch applications for
        
    Returns:
        List of applications for the user
    """
    try:
        applications = _load_applications()
        user_applications = [app for app in applications if app["user_id"] == user_id]
        
        print(f"✅ Retrieved {len(user_applications)} applications for user {user_id}")
        
        return [ApplicationResponse(**app) for app in user_applications]
        
    except Exception as e:
        print(f"❌ Error fetching applications: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching applications: {str(e)}")

@router.put("/applications/{application_id}/status")
async def update_application_status(application_id: str, status: str):
    """
    Update the status of an application.
    
    Args:
        application_id: ID of the application to update
        status: New status (applied, under_review, accepted, rejected)
        
    Returns:
        Success message
    """
    try:
        applications = _load_applications()
        
        # Find and update the application
        for app in applications:
            if app["id"] == application_id:
                app["status"] = status
                _save_applications(applications)
                print(f"✅ Updated application {application_id} status to {status}")
                return {"message": "Application status updated successfully"}
        
        raise HTTPException(status_code=404, detail="Application not found")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating application status: {e}")
        raise HTTPException(status_code=500, detail=f"Error updating application status: {str(e)}")

@router.delete("/applications/{application_id}")
async def delete_application(application_id: str):
    """
    Delete an application.
    
    Args:
        application_id: ID of the application to delete
        
    Returns:
        Success message
    """
    try:
        applications = _load_applications()
        
        # Find and remove the application
        original_length = len(applications)
        applications = [app for app in applications if app["id"] != application_id]
        
        if len(applications) == original_length:
            raise HTTPException(status_code=404, detail="Application not found")
        
        _save_applications(applications)
        print(f"✅ Deleted application {application_id}")
        return {"message": "Application deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting application: {e}")
        raise HTTPException(status_code=500, detail=f"Error deleting application: {str(e)}")
