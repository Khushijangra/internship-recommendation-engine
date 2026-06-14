# System Architecture — Intern Setu

## Overview

Intern Setu is a hybrid recommendation system combining TF-IDF semantic similarity with a multi-factor rule boosting engine. The system is designed for low-latency inference (<160ms cold, <1ms cached) at the scale of thousands of internship listings.

---

## Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              Intern Setu Backend                             │
│                                                                              │
│  POST /recommendations                                                       │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────┐                                                         │
│  │  Pydantic v2    │  Input validation, type coercion                        │
│  │  UserProfile    │  Fields: EducationLevel, Skills, SectorInterest,        │
│  └────────┬────────┘          Location, Mode, Language, ExperienceLevel     │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │                    NLP Preprocessing                        │             │
│  │                                                             │             │
│  │  normalize_skills()           normalize_location()         │             │
│  │  ├── lowercase + trim         ├── lowercase + trim          │             │
│  │  ├── synonym expansion        ├── 50+ city alias map        │             │
│  │  │   (100+ aliases JSON)      └── rural detection           │             │
│  │  └── dedup + sort                                           │             │
│  │                               normalize_education()         │             │
│  │  normalize_text()             ├── 150+ edu mappings         │             │
│  │  ├── lowercase                └── UG/PG/Diploma/12th...     │             │
│  │  ├── punct → space                                          │             │
│  │  └── conservative stemming                                  │             │
│  └────────────────────────────┬────────────────────────────────┘             │
│                               │                                              │
│           ┌───────────────────┼──────────────────────┐                       │
│           │                   │                      │                       │
│           ▼                   ▼                      ▼                       │
│  ┌─────────────────┐ ┌───────────────┐    ┌───────────────────┐              │
│  │  Cache Lookup   │ │  Profile Text │    │  Location Info    │              │
│  │  (profile hash) │ │  Construction │    │  Extraction       │              │
│  └────────┬────────┘ └───────┬───────┘    └─────────┬─────────┘              │
│           │ MISS             │                      │                       │
│           │                  ▼                      │                       │
│           │        ┌──────────────────────┐         │                       │
│           │        │  TF-IDF Vectorizer   │         │                       │
│           │        │  (loaded once on     │         │                       │
│           │        │   startup, ~73KB)    │         │                       │
│           │        │                      │         │                       │
│           │        │  profile → sparse    │         │                       │
│           │        │  vector (vocabulary  │         │                       │
│           │        │  of ~5000 terms)     │         │                       │
│           │        └──────────┬───────────┘         │                       │
│           │                   │                      │                       │
│           │                   ▼                      │                       │
│           │        ┌──────────────────────┐         │                       │
│           │        │  Cosine Similarity   │         │                       │
│           │        │  vs Internship Matrix│         │                       │
│           │        │  (~500 rows × vocab) │         │                       │
│           │        │  → Top K=50 indices  │         │                       │
│           │        └──────────┬───────────┘         │                       │
│           │                   │                      │                       │
│           │                   ▼                      │                       │
│           │        ┌──────────────────────────────────────────────┐          │
│           │        │           Rule Boosting Engine               │          │
│           │        │                                              │          │
│           │        │  For each of K=50 candidates:               │          │
│           │        │                                              │          │
│           │        │  score = cosine_sim                          │          │
│           │        │        + 0.15 × skill_overlap_score          │          │
│           │        │        + 0.10 × stipend_normalized           │          │
│           │        │        + 0.05 × location_match               │          │
│           │        │        + 0.03 × mode_match                   │          │
│           │        │        + 0.03 × education_match              │          │
│           │        │        + rural_boost (if applicable)         │          │
│           │        │                                              │          │
│           │        │  location scoring hierarchy:                 │          │
│           │        │    same city     → 1.0                       │          │
│           │        │    same state    → 0.8                       │          │
│           │        │    nearby state  → 0.5                       │          │
│           │        │    remote/online → 0.7                       │          │
│           │        │    different     → 0.3                       │          │
│           │        └──────────┬───────────────────────────────────┘          │
│           │                   │                                              │
│           │                   ▼                                              │
│           │        ┌──────────────────────┐                                  │
│           │        │  Fallback Expansion  │                                  │
│           │        │  if max_score < 0.30 │                                  │
│           │        │  → expand K: 50→200  │                                  │
│           │        │  → relax loc weight  │                                  │
│           │        └──────────┬───────────┘                                  │
│           │                   │                                              │
│           │                   ▼                                              │
│           │        ┌──────────────────────┐                                  │
│           │        │  Diversity Reranking │                                  │
│           │        │  penalty per result: │                                  │
│           │        │  −0.05 same title    │                                  │
│           │        │  −0.03 same sector   │                                  │
│           │        │  −0.02 same org      │                                  │
│           │        └──────────┬───────────┘                                  │
│           │                   │                                              │
│           │                   ▼                                              │
│           │        ┌──────────────────────┐                                  │
│           │        │  Score Normalization │                                  │
│           │        │  min-max → [60, 92]% │                                  │
│           │        │  (top match ≥ 85%)   │                                  │
│           │        └──────────┬───────────┘                                  │
│           │                   │                                              │
│           │                   ▼                                              │
│           │        ┌──────────────────────┐                                  │
│           │        │  Explainability      │                                  │
│           │        │  • matched_skills[]  │                                  │
│           │        │  • location reason   │                                  │
│           │        │  • mode reason       │                                  │
│           │        │  • stipend formatted │                                  │
│           │        └──────────┬───────────┘                                  │
│           │                   │                                              │
│           └───────────────────┤                                              │
│                               ▼                                              │
│                      ┌──────────────────────┐                                │
│                      │   Cache Store        │                                │
│                      │   + Response         │                                │
│                      └──────────────────────┘                                │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## ML Artifacts

| Artifact | Size | Description |
|----------|------|-------------|
| `tfidf_vectorizer.pkl` | ~73KB | Fitted sklearn TfidfVectorizer |
| `internship_matrix.npz` | ~307KB | Sparse TF-IDF matrix for all internships |
| `internship_ids.pkl` | ~10KB | Internship ID index mapping |
| `internships_df.pkl` | ~189KB | Full internship DataFrame for field lookup |
| `weights.json` (optional) | ~0.1KB | Override scoring weights without code change |

All artifacts are generated by `backend/app/ml/train_save_artifacts.py` and are excluded from version control (`.gitignore`).

---

## Data Flow

```
Raw CSV
  → clean_dataset.py (dedup, null handling, skill normalization)
  → preprocess.py (document construction per internship)
  → train_save_artifacts.py (TF-IDF fit + transform → .pkl + .npz)
  → recommend.py (runtime inference)
```

---

## Scalability Considerations

| Concern | Current Solution | Scale Path |
|---------|-----------------|------------|
| **Latency** | In-memory cache + sparse matrix | Redis distributed cache |
| **Dataset size** | CSV + pkl on disk | PostgreSQL + FAISS index |
| **Concurrency** | FastAPI async + Uvicorn | Gunicorn + multiple workers |
| **Ranking quality** | Cosine + rule scoring | Learning-to-rank (XGBRanker) trained on click data |
| **Multilingual** | Synonym JSON files | Multilingual BERT embeddings |

---

## Design Decisions

### Why TF-IDF over Embeddings?

TF-IDF was chosen for the initial system because:
1. **No GPU required** — runs on CPU-only Railway instances
2. **Interpretable** — vocabulary terms map directly to skill names  
3. **Fast at inference** — sparse matrix multiply is O(vocab × candidates)
4. **No fine-tuning data needed** — works out of the box

The architecture is designed to swap TF-IDF for sentence transformers with minimal changes to `recommend.py` — the vectorizer interface is abstracted behind `_load_ml_artifacts_once()`.

### Why Rule Boosting over Pure ML?

Pure cosine similarity on TF-IDF misses structured constraints:
- A student in Bangalore who wants offline internships should not see remote-only results
- Rural users should be boosted for government internships even if semantic similarity is low
- Stipend is a hard constraint for many students — it should directly affect ranking

Rule boosting makes these constraints explicit, tunable, and auditable.

### Why In-Memory Cache?

The system serves a recommender where the same profile may be queried repeatedly (e.g., page refresh, app re-open). A simple dict cache with profile-hash key provides <1ms repeat queries with zero infrastructure overhead for single-instance deployment.
