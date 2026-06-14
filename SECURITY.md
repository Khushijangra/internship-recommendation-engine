# Security Policy — Intern Setu

## Supported Versions

| Version | Supported |
|---------|-----------|
| main branch | ✅ Active |
| Older tags | ❌ Not maintained |

---

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

To report a security vulnerability responsibly:

1. **Email:** Send details to `[your-email@domain.com]` with subject `[SECURITY] Intern Setu Vulnerability`
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

## Resolved Security Issues

### ✅ Admin Token — Fixed (commit `ac57cc8` + credential cleanup commit)

**Issue was:** The `/upload-internships` endpoint had `"sih2025"` hardcoded as the admin token.

**Resolution:**
- `ADMIN_TOKEN` is now loaded exclusively via `os.getenv("ADMIN_TOKEN", "")`
- A module-level `logger.warning` fires at startup if `ADMIN_TOKEN` is unset
- If unset, the endpoint returns HTTP 503 (disabled) rather than comparing against an empty string
- If set but wrong token provided, returns HTTP 403
- `python-dotenv` loads `backend/.env` automatically in local development
- Set `ADMIN_TOKEN` in Railway environment variables for production

```bash
# Generate a secure token
python -c "import secrets; print(secrets.token_urlsafe(32))"
# → Add the output to backend/.env as: ADMIN_TOKEN=<output>
```

### ✅ Firebase Credentials — Fixed (credential cleanup commit)

**Issue was:** `frontend/src/lib/firebase.ts` used `|| "hardcoded-value"` fallbacks,
exposing live Firebase API key, project ID, app ID, and sender ID in source code.

**Resolution:**
- All six Firebase config values now come exclusively from `import.meta.env.VITE_FIREBASE_*`
- A startup guard checks for missing env vars and throws a descriptive error before
  `initializeApp()` is ever called — no silent fallback possible
- `frontend/.env.example` documents all required variables with descriptive placeholders
- `frontend/.env` is blocked by `.gitignore`

---

## Remaining Considerations

### CORS Configuration

**Issue:** Backend currently uses `allow_origins=["*"]`.

**Mitigation (before production):**
```python
allow_origins=[
    "https://your-vercel-frontend.vercel.app",
    "http://localhost:5173",  # dev only
]
```

### Firebase Auth — Server-Side Token Validation

Firebase Authentication is handled client-side. The backend does not currently validate Firebase ID tokens on `/recommendations`. For production with user-specific data, implement server-side token verification using `firebase-admin`.

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
