from __future__ import annotations

import os
import sys
from typing import List

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer


# Resolve project root and ensure imports work
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


def _path_data(filename: str) -> str:
    return os.path.join(PROJECT_ROOT, "data", filename)


def _path_models(filename: str) -> str:
    return os.path.join(PROJECT_ROOT, "backend", "app", "models", filename)


def _ensure_models_dir() -> None:
    models_dir = os.path.join(PROJECT_ROOT, "backend", "app", "models")
    os.makedirs(models_dir, exist_ok=True)


def _combine_text_fields(row: pd.Series) -> str:
    parts: List[str] = []
    # Use the same fields that recommend.py vectorizes semantically
    # Title + Description + Sector + RequiredSkills + Tags + ToolsUsed (if present)
    for col in [
        "Title",
        "Description",
        "Sector",
        "RequiredSkills",
        "Tags",
        "ToolsUsed",
        "Subsector",
    ]:
        if col in row and pd.notna(row[col]):
            val = str(row[col]).strip().lower()
            if val and val != "unknown":
                parts.append(val)
    return " ".join(parts)


def main() -> None:
    # Load cleaned internships
    data_path = _path_data("internships_cleaned.csv")
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Cleaned dataset not found at {data_path}")
    df = pd.read_csv(data_path)

    if df.empty:
        raise ValueError("Internship dataset is empty; cannot fit TF-IDF.")

    # Prepare corpus
    corpus = df.apply(_combine_text_fields, axis=1).tolist()
    if not any(corpus):
        raise ValueError("All combined text rows are empty; check dataset fields.")

    # Vectorizer settings aligned with recommend.py preprocessed configuration
    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=5000,
        ngram_range=(1, 2)
    )

    # Fit and transform
    tfidf_matrix = vectorizer.fit_transform(corpus)

    # Ensure models dir
    _ensure_models_dir()

    # Save artifacts
    vec_path = _path_models("tfidf_vectorizer.pkl")
    mat_path = _path_models("internship_matrix.pkl")
    joblib.dump(vectorizer, vec_path)
    joblib.dump(tfidf_matrix, mat_path)

    # Optional: save normalized data copy if needed in future steps
    final_clean_path = _path_data("internships_cleaned_final.csv")
    try:
        df.to_csv(final_clean_path, index=False)
    except Exception:
        pass

    # Reporting
    print("✅ TF-IDF vectorizer saved")
    print("✅ Internship matrix saved")
    print(f"Matrix shape: {tfidf_matrix.shape}")
    print("✅ Artifacts ready for use in recommend.py")


if __name__ == "__main__":
    main()


