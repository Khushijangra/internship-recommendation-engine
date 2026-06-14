<div align="center">

# 🎯 InternMatch
### AI-Powered Internship Recommendation Engine

*Hybrid NLP recommendation engine that matches students to internships using TF-IDF similarity, configurable rule boosting, explainable ranking, and fairness-aware reranking.*

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Live Demo](#deployment) · [API Docs](#api-reference) · [Quick Start](#quick-start) · [Architecture](#system-architecture)

</div>

---

## 📌 Problem Statement

India's **PM Internship Scheme** connects millions of students to industry internships — but matching at scale is hard. A student in rural Rajasthan has different constraints than one in Bangalore. A 12th-pass student in agriculture has different needs than a BTech CS student in fintech.

Generic keyword search fails because:
- Student skill descriptions don't match internship vocabulary exactly
- Location preferences and rural-urban context are ignored
- Top results cluster around the same few organizations
- No explanation of *why* an internship was recommended

**InternMatch** solves this with a hybrid ML system that understands semantic relevance, geographic context, educational fit, and diversity — and explains every recommendation.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         InternMatch System                              │
├───────────────────────────┬─────────────────────────────────────────────┤
│        FRONTEND           │              BACKEND                        │
│   React + TypeScript      │         FastAPI (Python)                    │
│   Firebase Auth           │                                             │
│   Tailwind + Radix UI     │  ┌──────────────────────────────────────┐   │
│                           │  │         ML Pipeline                  │   │
│  Profile Form             │  │                                      │   │
│  ┌────────────┐           │  │  User Profile                        │   │
│  │ Skills     │──────────────▶│  ┌────────────────────────────┐     │   │
│  │ Location   │           │  │  │  NLP Preprocessing          │     │   │
│  │ Sector     │           │  │  │  • Skill synonym expansion  │     │   │
│  │ Education  │           │  │  │  • Location normalization   │     │   │
│  │ Mode       │           │  │  │  • Education normalization  │     │   │
│  └────────────┘           │  │  └────────────┬───────────────┘     │   │
│                           │  │               │                      │   │
│  Results Card             │  │  ┌────────────▼───────────────┐     │   │
│  ┌────────────┐           │  │  │  TF-IDF Vectorization      │     │   │
│  │ Title      │           │  │  │  • Profile → sparse vector │     │   │
│  │ Match %    │◀──────────│  │  │  • Cosine similarity (K=50)│     │   │
│  │ Matched    │           │  │  └────────────┬───────────────┘     │   │
│  │ Skills     │           │  │               │                      │   │
│  │ Reason     │           │  │  ┌────────────▼───────────────┐     │   │
│  └────────────┘           │  │  │  Rule Boosting Engine      │     │   │
│                           │  │  │  • Skill overlap (+0.15)   │     │   │
│                           │  │  │  • Location score (+0.05)  │     │   │
│                           │  │  │  • Education match (+0.03) │     │   │
│                           │  │  │  • Mode match (+0.03)      │     │   │
│                           │  │  │  • Stipend score (+0.10)   │     │   │
│                           │  │  └────────────┬───────────────┘     │   │
│                           │  │               │                      │   │
│                           │  │  ┌────────────▼───────────────┐     │   │
│                           │  │  │  Fairness Reranking        │     │   │
│                           │  │  │  • Rural user boost        │     │   │
│                           │  │  │  • Diversity penalty       │     │   │
│                           │  │  │  • Fallback expansion      │     │   │
│                           │  │  └────────────┬───────────────┘     │   │
│                           │  │               │                      │   │
│                           │  │  ┌────────────▼───────────────┐     │   │
│                           │  │  │  Explainability Layer      │     │   │
│                           │  │  │  • Matched skills list     │     │   │
│                           │  │  │  • Location fit reason     │     │   │
│                           │  │  │  • Stipend formatting      │     │   │
│                           │  │  └────────────────────────────┘     │   │
│                           │  └──────────────────────────────────────┘   │
└───────────────────────────┴─────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┴──────────────────┐
                    │         Data Layer                  │
                    │  internships_cleaned.csv (~500 rows)│
                    │  TF-IDF Matrix (sparse .npz)        │
                    │  Vectorizer (.pkl)                  │
                    │  In-memory cache (profile hash)     │
                    └────────────────────────────────────┘
```

---

## 🤖 How Recommendations Work

### Stage 1 — NLP Preprocessing

Every user profile is normalized before scoring:

```python
# Skill synonym expansion: "ml" → "machine learning", "js" → "javascript"
normalized_skills = normalize_skills(user_skills, synonym_map)

# Location normalization: "Delhi NCR", "New Delhi", "NCR" → "delhi"
normalized_location = normalize_location(user_location)

# Education standardization: "BTech", "B.E", "Bachelor" → "UG"
normalized_edu = normalize_education(user_education)
```

The system handles 100+ skill aliases, 50+ Indian city aliases, and 150+ education level variations — ensuring matching works across all input styles.

### Stage 2 — TF-IDF Semantic Similarity

Each internship is indexed as a TF-IDF document combining `Title + Sector + Description + Tags + RequiredSkills` (skills weighted 2× using token duplication). The user profile is vectorized using the same vocabulary and cosine similarity is computed against all K=50 nearest internships.

```python
profile_vector = vectorizer.transform([profile_text])
cosine_sims = cosine_similarity(profile_vector, internship_matrix).flatten()
top_k_indices = np.argsort(-cosine_sims)[:50]
```

### Stage 3 — Multi-Factor Rule Scoring

The final score is a weighted sum of five components:

| Component | Max Weight | Description |
|-----------|-----------|-------------|
| TF-IDF Cosine | Base | Semantic profile-internship similarity |
| Skill Overlap | +0.15 | `|matched_skills| / |user_skills|` |
| Stipend Score | +0.10 | Normalized to ₹50,000 ceiling |
| Location Match | +0.05 | City > State > Remote hierarchy |
| Mode Match | +0.03 | Online / Offline / Hybrid alignment |
| Education Match | +0.03 | Exact education level match |

```python
final_score = (
    cosine_sim
    + 0.15 * skill_overlap
    + 0.10 * stipend_normalized
    + 0.05 * location_match
    + 0.03 * mode_match
    + 0.03 * education_match
)
```

Weights are configurable via `backend/app/models/weights.json` — no code change required.

### Stage 4 — Fairness-Aware Reranking

```python
# Rural users get a +0.05 boost for government/NGO/public sector internships
rural_boost = apply_rural_boost(user_is_rural, internship_row)

# Diversity penalty prevents 5 results from the same org/sector
diversity_score = diversity_penalty(already_selected, candidate)
```

**Fallback expansion:** If the max score across all candidates is below 0.30 (low-confidence match), the system automatically expands to K=200 candidates and relaxes the location weight — preventing cold-start failure for niche profiles.

---

## 🔍 Explainability

Every recommendation includes a structured explanation:

```json
{
  "InternshipID": "INT042",
  "Title": "Machine Learning Intern",
  "Organisation": "AI Solutions Ltd",
  "MatchPercent": 87.4,
  "MatchedSkills": ["python", "machine learning", "scikit-learn"],
  "Reason": "Matched skills: python, machine learning, scikit-learn; Location: same city; Mode: matched; Content similarity: high",
  "Explanation": "Matched 3/4 skills (python, machine learning, scikit-learn), stipend ₹10,000 (boosted), location matched (Bangalore), mode matched (hybrid)",
  "IsBestMatch": true
}
```

Recruiters can verify the logic. Users understand *why* they were matched — not just that they were.

---

## ⚖️ Fairness Design

InternMatch is built for India's diverse student population:

| Mechanism | Purpose | Implementation |
|-----------|---------|---------------|
| **Rural Boost** | Uplift rural-area users for government/NGO internships | +0.05 for rural users matched to rural/govt-tagged internships |
| **Diversity Reranking** | Prevent top-5 clustering around one org/sector | −0.05 same title, −0.03 same sector, −0.02 same org |
| **Fallback Expansion** | Prevent cold-start failure for niche profiles | Auto-expand K: 50→200 when max_score < 0.30 |
| **Location Hierarchy** | City → State → Remote — fair to remote users | Remote internships scored 0.7 (vs 1.0 same city) |
| **Education Normalization** | 12th Pass / Diploma / UG / PG treated equitably | 150+ education level mappings |

---

## ⚡ Performance

| Scenario | Latency |
|----------|---------|
| First query (cold, 300 internships) | 30–80ms |
| First query (cold, 1,000 internships) | 80–160ms |
| Repeat query (cache hit) | **< 1ms** |
| Artifact load on startup | 200–500ms (one-time) |

**Caching strategy:** In-memory dict keyed by profile hash. Repeat queries from the same profile return sub-millisecond. No Redis required for single-instance deployment.

```python
cache_key = "|".join([skills, education, location, sector, mode, language, experience])
if cache_key in _RESULT_CACHE:
    return _RESULT_CACHE[cache_key]
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **ML Engine** | scikit-learn, NumPy, SciPy | TF-IDF vectorization, cosine similarity, sparse matrix |
| **NLP** | Custom Python pipeline | Tokenization, synonym expansion, normalization |
| **Backend** | FastAPI 0.115, Pydantic v2 | REST API, request validation, async |
| **Frontend** | React 18, TypeScript, Vite | User interface, profile form, recommendation cards |
| **UI Components** | Radix UI, Tailwind CSS | Accessible component library |
| **Auth** | Firebase Authentication | User registration and login |
| **Data** | Pandas, CSV | Internship dataset ingestion and preprocessing |
| **Model Storage** | joblib, scipy.sparse | Serialized TF-IDF vectorizer + sparse internship matrix |
| **Deployment** | Railway (backend) + Vercel (frontend) | Cloud deployment |

---

## 📁 Project Structure

```
internmatch/
├── README.md                         ← You are here
├── requirements.txt                  ← Python dependencies (pinned)
├── LICENSE
├── .gitignore                        ← Security-hardened
│
├── backend/                          ← FastAPI Python backend
│   ├── .env.example                  ← Environment template (safe to commit)
│   ├── app.py                        ← Entry point
│   └── app/
│       ├── main.py                   ← FastAPI app, routes, CORS
│       ├── models.py                 ← Pydantic request/response models
│       ├── routes/
│       │   ├── recommendations.py    ← /recommendations endpoint
│       │   └── applications.py       ← /applications endpoint
│       └── ml/
│           ├── recommend.py          ← Core recommendation engine (702 lines)
│           ├── rule_boost.py         ← Scoring components (location, skill, education)
│           ├── preprocessing.py      ← NLP normalization pipeline (690 lines)
│           ├── preprocess.py         ← Data preprocessing utilities
│           ├── train_save_artifacts.py ← TF-IDF training + artifact serialization
│           ├── save_artifacts.py     ← Model persistence helpers
│           ├── clean_dataset.py      ← Dataset cleaning pipeline
│           ├── tune_weights.py       ← Scoring weight optimization
│           ├── verify_explainability.py ← Explainability validation
│           ├── skill_synonyms.json   ← 100+ skill alias mappings
│           └── synonyms.json         ← Abbreviation expansions
│
├── frontend/                         ← React + TypeScript frontend
│   ├── .env.example                  ← Environment template (safe to commit)
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── App.tsx                   ← Main application (auth, routing, UI)
│       ├── main.tsx
│       ├── index.css
│       ├── components/               ← Reusable UI components
│       ├── contexts/                 ← React contexts (auth, theme)
│       ├── hooks/                    ← Custom React hooks
│       ├── utils/                    ← Helper utilities
│       ├── constants/                ← App constants
│       └── lib/                      ← Third-party integrations
│
└── data/
    └── sample_internships.csv        ← 50-row synthetic dataset for demo
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Firebase project (for auth)

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/internmatch.git
cd internmatch

# 2. Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your Firebase credentials

# 5. Train ML artifacts (or use pre-trained if available)
cd backend
python -m app.ml.train_save_artifacts

# 6. Start the backend
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: `http://localhost:8000`  
API docs at: `http://localhost:8000/docs`

### Frontend Setup

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Firebase credentials and API URL

# 3. Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

### Quick Test (Without Frontend)

```bash
curl -X POST http://localhost:8000/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "EducationLevel": "UG",
    "Skills": "python, machine learning, scikit-learn",
    "SectorInterest": "IT & Software",
    "Location": "Bangalore",
    "Mode": "Online",
    "Language": "English",
    "ExperienceLevel": "Beginner"
  }'
```

---

## 📡 API Reference

### `POST /recommendations`

Returns top-5 internship recommendations with scores and explanations.

**Request:**
```json
{
  "EducationLevel": "UG",
  "Skills": "python, react, sql",
  "SectorInterest": "IT & Software",
  "Location": "Bangalore",
  "Mode": "Online",
  "Language": "English",
  "ExperienceLevel": "Beginner"
}
```

**Response:**
```json
{
  "user_profile": { "...": "..." },
  "recommendations": [
    {
      "InternshipID": "INT042",
      "Title": "Machine Learning Intern",
      "Organisation": "AI Solutions Ltd",
      "City": "Bangalore",
      "State": "Karnataka",
      "Mode": "Hybrid",
      "Duration": "3 Months",
      "Sector": "IT & Software",
      "RequiredSkills": "python, machine learning, scikit-learn, tensorflow",
      "Stipend": "₹10,000",
      "StipendFormatted": "₹10,000",
      "MatchedSkills": ["python", "machine learning", "scikit-learn"],
      "FinalScore": 0.8741,
      "MatchPercent": 87.4,
      "IsBestMatch": true,
      "Reason": "Matched skills: python, machine learning, scikit-learn; Location: same city; Mode: matched",
      "Explanation": "Matched 3/4 skills, stipend ₹10,000 (boosted), location matched (Bangalore)"
    }
  ]
}
```

### Other Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/` | API info and available endpoints |
| `GET` | `/internships/count` | Total internships in system |
| `POST` | `/recommend` | Simplified recommendation endpoint |
| `POST` | `/upload-internships` | Admin: upload new internship CSV |

Full interactive API docs: `http://localhost:8000/docs`

---

## 🌐 Deployment Architecture

```
  Users
    │
    ▼
┌─────────────────────────────────────────────────────┐
│                    Vercel CDN                        │
│              React + TypeScript Frontend             │
│           (Static build, global edge network)        │
└───────────────────────────┬─────────────────────────┘
                            │ HTTPS API calls
                            ▼
┌─────────────────────────────────────────────────────┐
│                 Railway (Backend)                    │
│                FastAPI Python App                    │
│         ML artifacts loaded on startup               │
│           Auto-scaling + zero-downtime deploy        │
└───────────────────────────┬─────────────────────────┘
                            │
          ┌─────────────────┼──────────────────┐
          ▼                 ▼                  ▼
   Firebase Auth      Internship CSV      ML Artifacts
   (User login/       (data layer)       (TF-IDF pkl,
    registration)                        sparse matrix)
```

---

## 📸 Screenshots

> *Add your screenshots here: profile form, recommendation cards, mobile view*

| Profile Form | Recommendations |
|:---:|:---:|
| ![Profile Form](docs/screenshots/profile_form.png) | ![Recommendations](docs/screenshots/recommendations.png) |

---

## 🔮 Future Roadmap

| Feature | Priority | Description |
|---------|----------|-------------|
| **Collaborative Filtering** | High | User-based CF to surface "students like you also matched..." |
| **Learning-to-Rank** | High | Upgrade cosine+rule scoring to XGBRanker trained on click data |
| **Regional Language Support** | High | Hindi, Tamil, Telugu skill/sector inputs |
| **Feedback Loop** | Medium | Thumbs up/down to improve weights per user segment |
| **Company-Side Dashboard** | Medium | Admin interface for internship posting and applicant tracking |
| **Resume Parsing** | Medium | Upload PDF resume → auto-populate profile fields |
| **Real-time Notifications** | Low | Alert when new internships match saved profile |
| **Stipend Prediction** | Low | ML model to estimate stipend range for unlabeled internships |

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and development setup.

---

## 🔒 Security

See [SECURITY.md](SECURITY.md) for responsible disclosure policy.

---

## 📄 License

MIT License — see [LICENSE](LICENSE).

---

<div align="center">

**Built for Smart India Hackathon 2025 · PM Internship Scheme (PS-25034)**

*If this project helped you, consider giving it a ⭐*

</div>
