from __future__ import annotations

import os
from pathlib import Path
from typing import Dict, Tuple

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer


def _project_root() -> Path:
    current = Path(__file__).resolve()
    for parent in [current, *current.parents]:
        if (parent / "data").exists():
            return parent
    return current.parent.parent.parent


def generate_tfidf_vectorizer_and_matrix() -> Tuple[TfidfVectorizer, Dict[int, int]]:
    """
    Load cleaned internship dataset, combine text fields, and generate TF-IDF vectorizer and matrix.
    
    Returns:
        Tuple of (fitted_vectorizer, internship_id_mapping)
    """
    root = _project_root()
    data_dir = root / "data"
    models_dir = root / "models"
    
    # Ensure models directory exists
    models_dir.mkdir(parents=True, exist_ok=True)
    
    # Load cleaned internship dataset
    input_csv = data_dir / "internships_cleaned.csv"
    if not input_csv.exists():
        raise FileNotFoundError(f"Cleaned dataset not found at: {input_csv}")
    
    df = pd.read_csv(input_csv)
    
    # Ensure we have an ID column, create one if missing
    if 'ID' not in df.columns:
        df['ID'] = range(len(df))
    
    # Combine text fields for vectorization
    text_fields = ['Title', 'Description', 'RequiredSkills', 'Tags', 'ToolsUsed']
    
    # Check which fields exist in the dataset
    available_fields = [field for field in text_fields if field in df.columns]
    
    if not available_fields:
        raise ValueError("No text fields found in the dataset for vectorization")
    
    # Fill missing values with empty strings and combine fields
    combined_texts = []
    for idx, row in df.iterrows():
        text_parts = []
        for field in available_fields:
            value = str(row[field]) if pd.notna(row[field]) else ""
            # Clean and lowercase
            cleaned_value = value.strip().lower()
            if cleaned_value and cleaned_value != "unknown":
                text_parts.append(cleaned_value)
        
        # Join with space separator
        combined_text = " ".join(text_parts)
        combined_texts.append(combined_text)
    
    # Initialize TF-IDF vectorizer
    vectorizer = TfidfVectorizer(
        stop_words='english',
        max_features=5000,
        lowercase=True,
        strip_accents='unicode',
        ngram_range=(1, 2)  # Include both unigrams and bigrams
    )
    
    # Fit and transform the combined texts
    tfidf_matrix = vectorizer.fit_transform(combined_texts)
    
    # Create index mapping (row index -> internship ID)
    internship_id_mapping = {idx: int(df.iloc[idx]['ID']) for idx in range(len(df))}
    
    # Save vectorizer
    vectorizer_path = models_dir / "tfidf.pkl"
    joblib.dump(vectorizer, vectorizer_path)
    
    # Save TF-IDF matrix
    matrix_path = models_dir / "internship_tfidf_matrix.pkl"
    joblib.dump(tfidf_matrix, matrix_path)
    
    print("TF-IDF vectorizer and internship matrix saved.")
    
    return vectorizer, internship_id_mapping


if __name__ == "__main__":
    vectorizer, mapping = generate_tfidf_vectorizer_and_matrix()
    print(f"Vectorizer fitted on {len(mapping)} internships")
    print(f"Matrix shape: {vectorizer.transform(['sample text']).shape[1]} features")
