# Security Policy — InternMatch

## Supported Versions

| Version | Supported |
|---------|-----------|
| main branch | ✅ Active |
| Older tags | ❌ Not maintained |

---

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

To report a security vulnerability responsibly:

1. **Email:** Send details to `[your-email@domain.com]` with subject `[SECURITY] InternMatch Vulnerability`
2. **Include:**
   - Vulnerability description
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fix (if known)
3. **Expected response:** Acknowledgment within 48 hours, patch within 7 days for critical issues

---

## Security Design

### What We Protect

| Asset | Protection Mechanism |
|-------|---------------------|
| Firebase credentials | `.env` files excluded from git via `.gitignore` |
| User profile data | `user_profiles.csv` excluded from git |
| Admin API token | Environment variable, not hardcoded |
| ML model artifacts | `.pkl`, `.npz` excluded from git |
| Full dataset | `internships_cleaned.csv` excluded from git |

### What Is Safe to Commit

| File | Why Safe |
|------|----------|
| `backend/.env.example` | Placeholder values only |
| `frontend/.env.example` | Placeholder values only |
| `data/sample_internships.csv` | Synthetic, no real PII |
| All source code | No credentials embedded |

---

## Known Security Considerations

### Admin Token (Hardcoded Default)

**Issue:** The `/upload-internships` endpoint currently uses `"sih2025"` as the default admin token in the source code.

**Mitigation (before production):**
```python
# In backend/app/main.py, replace the hardcoded token check with:
import os
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")
if admin_token != ADMIN_TOKEN or not ADMIN_TOKEN:
    raise HTTPException(status_code=403, detail="Access denied.")
```

And set `ADMIN_TOKEN` as an environment variable in Railway.

### CORS Configuration

**Issue:** Backend currently uses `allow_origins=["*"]`.

**Mitigation (before production):**
```python
allow_origins=[
    "https://your-vercel-frontend.vercel.app",
    "http://localhost:5173",  # dev only
]
```

### Firebase Auth

Firebase Authentication is handled client-side. The backend does not currently validate Firebase ID tokens on the `/recommendations` endpoint. For production with user-specific data, implement server-side token verification using `firebase-admin`.

---

## Dependency Vulnerability Scanning

```bash
# Check Python dependencies for known vulnerabilities
pip install pip-audit
pip-audit

# Check Node dependencies
cd frontend
npm audit
```

Run these before each release.
