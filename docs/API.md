# API Reference — InternMatch

## Base URL

| Environment | URL |
|-------------|-----|
| Local | `http://localhost:8000` |
| Production | `https://your-railway-app.railway.app` |

Interactive Swagger docs: `{BASE_URL}/docs`  
ReDoc: `{BASE_URL}/redoc`

---

## Authentication

Most endpoints are public. The `/upload-internships` endpoint requires an admin token via header:

```
X-Admin-Token: your_admin_token_here
```

---

## Endpoints

### `GET /health`

Health check for uptime monitoring and load balancer probes.

**Response:**
```json
{ "status": "ok" }
```

---

### `GET /`

API info and available endpoints.

**Response:**
```json
{
  "message": "SIH Internship Recommendation API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "recommend": "/recommend (POST)",
    "upload": "/upload-internships (POST)",
    "count": "/internships/count"
  },
  "docs": "/docs"
}
```

---

### `GET /internships/count`

Returns the total number of internships currently indexed.

**Response:**
```json
{ "count": 523, "status": "success" }
```

---

### `POST /recommendations`

The primary endpoint. Returns top-5 internship recommendations with scores, matched skills, and natural language explanations.

**Request Body:**
```json
{
  "EducationLevel": "UG",
  "Skills": "python, machine learning, sql, react",
  "SectorInterest": "IT & Software",
  "Location": "Bangalore",
  "Mode": "Online",
  "Language": "English",
  "ExperienceLevel": "Beginner"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `EducationLevel` | string | Yes | `12th Pass`, `Diploma`, `UG`, `PG`, `PhD` |
| `Skills` | string | Yes | Comma-separated skill list |
| `SectorInterest` | string | Yes | Internship sector preference |
| `Location` | string | Yes | Student's city or state |
| `Mode` | string | Yes | `Online`, `Offline`, `Hybrid` |
| `Language` | string | Yes | Preferred language |
| `ExperienceLevel` | string | Yes | `Beginner`, `Intermediate`, `Advanced` |

**Response:**
```json
{
  "user_profile": {
    "EducationLevel": "UG",
    "Skills": "python, machine learning, sql, react",
    "SectorInterest": "IT & Software",
    "Location": "Bangalore",
    "Mode": "Online",
    "Language": "English",
    "ExperienceLevel": "Beginner"
  },
  "recommendations": [
    {
      "InternshipID": "INT003",
      "Title": "Machine Learning Intern",
      "Description": "Implement ML models for product recommendation and demand forecasting.",
      "Organisation": "AI Solutions Ltd",
      "City": "Hyderabad",
      "State": "Telangana",
      "Location": "Hyderabad, Telangana",
      "Sector": "IT & Software",
      "Subsector": "Artificial Intelligence",
      "RequiredSkills": "python, machine learning, scikit-learn, tensorflow",
      "EducationLevel": "UG",
      "ExperienceLevel": "Intermediate",
      "Mode": "Hybrid",
      "Duration": "3 Months",
      "Language": "English",
      "Stipend": "₹10,000",
      "StipendFormatted": "₹10,000",
      "ToolsUsed": "python, jupyter, git",
      "Tags": "machine learning",
      "LastDateToApply": "2025-08-15",
      "Deadline": "2025-08-15",
      "MatchedSkills": ["machine learning", "python"],
      "CosineSimilarity": 0.7821,
      "SkillOverlapScore": 0.5,
      "LocationScore": 0.3,
      "EducationSectorBoost": 0.1,
      "RuralBoost": 0.0,
      "FinalScore": 0.9124,
      "MatchPercent": 91.2,
      "IsBestMatch": true,
      "Reason": "Matched skills: machine learning, python; Location: different; Mode: prefers online, offered hybrid; Content similarity: high",
      "Explanation": "Matched 2/4 skills (machine learning, python), stipend ₹10,000 (boosted)"
    }
  ]
}
```

**Status Codes:**

| Code | Meaning |
|------|---------|
| `200` | Success |
| `422` | Validation error (missing or invalid fields) |
| `500` | ML engine error |

---

### `POST /recommend`

Simplified endpoint. Same request body as `/recommendations`, returns fewer fields.

**Response:**
```json
{
  "status": "success",
  "recommendations": [...],
  "count": 5
}
```

---

### `POST /upload-internships`

Admin-only endpoint to replace the internship dataset.

**Headers:**
```
X-Admin-Token: your_admin_token
Content-Type: multipart/form-data
```

**Request:** Multipart file upload (`file` field) with `.csv` extension.

**CSV Expected Columns:**
```
InternshipID, Title, Organisation, Description, Sector, Subsector,
City, State, Mode, Duration, EducationLevel, ExperienceLevel,
RequiredSkills, Stipend, Language, ToolsUsed, Tags, LastDateToApply
```

**Response:**
```json
{
  "status": "success",
  "message": "Successfully uploaded 523 internships",
  "filename": "internships.csv",
  "rows": 523
}
```

**Status Codes:**

| Code | Meaning |
|------|---------|
| `200` | Upload successful |
| `400` | Not a CSV file |
| `403` | Invalid or missing admin token |
| `500` | File processing error |

---

## Error Responses

All errors return a consistent JSON structure:

```json
{
  "detail": "Error generating recommendations: [error message]"
}
```

---

## Rate Limiting

No rate limiting is implemented in the base deployment. For production at scale, implement rate limiting via Railway's middleware or an API gateway (AWS API Gateway / Nginx).

---

## Example: cURL

```bash
# Health check
curl http://localhost:8000/health

# Get recommendations
curl -X POST http://localhost:8000/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "EducationLevel": "UG",
    "Skills": "python, react, sql",
    "SectorInterest": "IT & Software",
    "Location": "Bangalore",
    "Mode": "Online",
    "Language": "English",
    "ExperienceLevel": "Beginner"
  }'

# Get internship count
curl http://localhost:8000/internships/count
```

## Example: Python

```python
import httpx

profile = {
    "EducationLevel": "UG",
    "Skills": "python, machine learning, tensorflow",
    "SectorInterest": "IT & Software",
    "Location": "Delhi",
    "Mode": "Online",
    "Language": "English",
    "ExperienceLevel": "Intermediate"
}

response = httpx.post("http://localhost:8000/recommendations", json=profile)
data = response.json()

for rec in data["recommendations"]:
    print(f"{rec['MatchPercent']}% — {rec['Title']} at {rec['Organisation']}")
    print(f"  Skills matched: {', '.join(rec['MatchedSkills'])}")
    print(f"  Reason: {rec['Reason']}\n")
```

## Example: JavaScript (Frontend)

```typescript
const profile = {
  EducationLevel: "UG",
  Skills: "react, typescript, javascript",
  SectorInterest: "IT & Software",
  Location: "Mumbai",
  Mode: "Online",
  Language: "English",
  ExperienceLevel: "Beginner",
};

const response = await fetch(`${API_URL}/recommendations`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(profile),
});

const data = await response.json();
console.log(data.recommendations);
```
