# Changelog — Intern Setu

All notable changes to this project are documented here.

Format: [Semantic Versioning](https://semver.org)
Standard: [Keep a Changelog](https://keepachangelog.com)

---

## [1.0.0] — 2025-06-14

### Initial Production Release (SIH 2025 Submission)

#### Added

**ML Engine (`backend/app/ml/`)**
- `recommend.py` — Hybrid TF-IDF + rule boosting recommendation engine (702 lines)
- `rule_boost.py` — Modular scoring components: skill overlap, location proximity, education match, rural boost, diversity reranking
- `preprocessing.py` — NLP preprocessing pipeline with 100+ skill synonyms, 50+ city aliases, 150+ education normalizations
- `train_save_artifacts.py` — TF-IDF vectorizer training and sparse matrix serialization
- `skill_synonyms.json` — Skill synonym expansion mapping
- In-memory profile hash cache (<1ms repeat queries)
- Automatic fallback expansion (K=50 → K=200) for low-confidence profiles
- Score normalization to user-friendly [60–92]% range

**Backend (`backend/app/`)**
- FastAPI application with Pydantic v2 validation
- `POST /recommendations` — Primary endpoint with full explainability
- `POST /recommend` — Simplified endpoint
- `GET /health` — Health check
- `GET /internships/count` — Dataset size endpoint
- `POST /upload-internships` — Admin CSV upload endpoint
- CORS middleware configured for frontend origin

**Frontend (`frontend/`)**
- React 18 + TypeScript + Vite application
- Firebase Authentication integration (login, register, logout)
- Multi-step profile form (education, skills, sector, location, mode)
- Recommendation cards with match percentage, matched skills, and explanation
- Responsive design with Tailwind CSS + Radix UI components

**Documentation**
- `README.md` — Recruiter-grade with architecture, performance, API examples
- `docs/ARCHITECTURE.md` — Full ML pipeline documentation
- `docs/API.md` — Complete API reference with examples
- `CONTRIBUTING.md` — Development workflow and standards
- `SECURITY.md` — Responsible disclosure and known security considerations
- `CHANGELOG.md` — This file

**Infrastructure**
- `.gitignore` — Security-hardened (blocks .env, user data, model artifacts, debug files)
- `backend/.env.example` — Environment template
- `frontend/.env.example` — Environment template
- `requirements.txt` — Pinned Python dependencies
- `data/sample_internships.csv` — 50-row synthetic dataset for demo and testing

#### Performance Benchmarks

| Scenario | Latency |
|----------|---------|
| Cold query (300 internships) | 30–80ms |
| Cold query (1,000 internships) | 80–160ms |
| Cache hit (repeat query) | < 1ms |
| Artifact load (startup) | 200–500ms |

---

## Future Releases (Planned)

### [1.1.0] — Planned

- [ ] Server-side Firebase ID token validation
- [ ] CORS locked to specific production domain
- [ ] Admin token via environment variable (remove hardcoded default)
- [ ] Docker + docker-compose for local development
- [ ] GitHub Actions CI for automated tests on PR

### [1.2.0] — Planned

- [ ] Collaborative filtering layer ("students like you also matched...")
- [ ] Hindi language skill/sector input support
- [ ] User feedback loop (thumbs up/down → weight adjustment)
- [ ] Resume PDF upload → auto-populate profile

### [2.0.0] — Planned

- [ ] Learning-to-Rank upgrade (XGBRanker on collected click data)
- [ ] Company-side dashboard (internship posting + applicant view)
- [ ] Real-time notifications for new matching internships
