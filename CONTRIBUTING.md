# Contributing to Intern Setu

Thank you for your interest in contributing to Intern Setu. This document outlines the process for contributing effectively.

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/intern-setu.git
cd intern-setu

# Backend setup
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp backend/.env.example backend/.env

# Frontend setup
cd frontend
npm install
cp .env.example .env
cd ..
```

---

## Development Workflow

### 1. Branch Naming

```
feature/short-description     # New features
fix/short-description          # Bug fixes
docs/short-description         # Documentation only
refactor/short-description     # Code refactoring
test/short-description         # Test additions
```

### 2. Commit Messages

Follow [Conventional Commits](https://conventionalcommits.org):

```
feat: add collaborative filtering fallback
fix: normalize "bengaluru" alias to "bangalore"
docs: update API reference for /recommendations
refactor: extract scoring weights to config dataclass
test: add unit tests for skill overlap scoring
```

### 3. Pull Request Checklist

Before submitting a PR, verify:

- [ ] Code runs locally without errors
- [ ] All tests pass (`pytest backend/`)
- [ ] No secrets or credentials in any file
- [ ] No large binary files (pkl, npz, csv) committed
- [ ] `requirements.txt` updated if new dependencies added
- [ ] Documentation updated if API changed
- [ ] PR description explains *why*, not just *what*

---

## Code Standards

### Python (Backend)

- Python 3.10+ type hints on all functions
- Docstrings on all public functions (Google style)
- Max line length: 100 characters
- No `print()` debugging left in production code paths — use Python `logging`
- Run `ruff check .` before committing

### TypeScript (Frontend)

- Strict TypeScript (`strict: true` in `tsconfig.json`)
- No `any` types
- Components should be typed with explicit props interfaces
- Use `React.FC` or typed arrow functions

### Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Python functions | `snake_case` | `normalize_location()` |
| Python classes | `PascalCase` | `UserProfile` |
| Python constants | `UPPER_SNAKE` | `PROJECT_ROOT` |
| React components | `PascalCase` | `RecommendationCard` |
| React hooks | `camelCase` with `use` prefix | `useRecommendations` |
| CSS classes | Tailwind utilities | `text-sm font-medium` |

---

## Areas for Contribution

### High Priority

| Area | Description |
|------|-------------|
| **Test Coverage** | Unit tests for `rule_boost.py`, `preprocessing.py`, integration tests for `/recommendations` |
| **Hindi Language Support** | Skill and sector normalization for Hindi inputs |
| **Collaborative Filtering** | User-based CF layer on top of existing TF-IDF pipeline |

### Medium Priority

| Area | Description |
|------|-------------|
| **Performance** | Profile result caching with TTL, benchmarking with locust |
| **Accessibility** | ARIA labels, keyboard navigation in frontend |
| **Error Handling** | Better error messages for edge case profiles |

### Low Priority

| Area | Description |
|------|-------------|
| **Docker** | Dockerfile + docker-compose for local development |
| **CI/CD** | GitHub Actions for automated testing on PR |

---

## Running Tests

```bash
# Backend unit tests
pytest backend/ -v

# Specific test file
pytest backend/test_recommendations.py -v

# Integration tests (requires running server)
pytest test_integration.py -v
```

---

## Reporting Issues

When filing a bug report, include:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Your environment** (OS, Python version, Node version)
5. **Relevant logs** (sanitize any sensitive data before sharing)

Use the GitHub Issues tab.

---

## Code of Conduct

Be respectful, constructive, and inclusive. This project welcomes contributors of all backgrounds and experience levels.
