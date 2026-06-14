from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import List

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import save_npz

# Set up project root path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.ml.preprocessing import make_document


def _get_data_path(filename: str) -> str:
    """Get absolute path to data file."""
    return os.path.join(PROJECT_ROOT, "data", filename)


def _get_models_path(filename: str) -> str:
    """Get absolute path to models file."""
    models_dir = os.path.join(PROJECT_ROOT, "backend", "app", "models")
    os.makedirs(models_dir, exist_ok=True)
    return os.path.join(models_dir, filename)


def train_save_artifacts():
    """Train TF-IDF vectorizer and save all artifacts."""
    print("🔧 Day 6.5 Step 1: Training TF-IDF artifacts...")
    
    # 1. Load cleaned internships data
    data_path = _get_data_path("internships_cleaned.csv")
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Data file not found: {data_path}")
    
    print(f"Loading data from: {data_path}")
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} internships")
    
    # 2. Apply preprocessing to create documents
    print("Creating documents from internship data...")
    documents = []
    for idx, row in df.iterrows():
        doc = make_document(row)
        documents.append(doc)
    
    print(f"Created {len(documents)} documents")
    
    # 3. Train TF-IDF vectorizer
    print("Training TF-IDF vectorizer...")
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),  # unigrams and bigrams
        max_features=15000,  # limit vocabulary size
        min_df=3,           # ignore terms that appear in less than 3 documents
        sublinear_tf=True,  # apply sublinear tf scaling
        stop_words='english'  # remove English stop words
    )
    
    # Fit and transform documents
    tfidf_matrix = vectorizer.fit_transform(documents)
    
    print(f"TF-IDF matrix shape: {tfidf_matrix.shape}")
    print(f"Vocabulary size: {len(vectorizer.vocabulary_)}")
    
    # 4. Extract internship IDs
    internship_ids = df['InternshipID'].tolist()
    
    # 5. Save all artifacts
    print("Saving artifacts...")
    
    # Save vectorizer
    vectorizer_path = _get_models_path("tfidf_vectorizer.pkl")
    joblib.dump(vectorizer, vectorizer_path)
    print(f"✓ Saved vectorizer: {vectorizer_path}")
    
    # Save TF-IDF matrix as sparse format
    matrix_path = _get_models_path("internship_matrix.npz")
    save_npz(matrix_path, tfidf_matrix)
    print(f"✓ Saved matrix: {matrix_path}")
    
    # Save internship IDs
    ids_path = _get_models_path("internship_ids.pkl")
    joblib.dump(internship_ids, ids_path)
    print(f"✓ Saved IDs: {ids_path}")
    
    # Save original dataframe
    df_path = _get_models_path("internships_df.pkl")
    joblib.dump(df, df_path)
    print(f"✓ Saved dataframe: {df_path}")
    
    # 6. Print verification
    print("\n📊 Verification:")
    print(f"Number of internships processed: {len(df)}")
    print(f"Matrix shape: {tfidf_matrix.shape}")
    print(f"Features: {tfidf_matrix.shape[1]}")
    
    # Show 3 sample documents
    print("\n📝 Sample documents (showing boosted tokens):")
    for i in range(min(3, len(documents))):
        doc = documents[i]
        # Show first 200 characters
        preview = doc[:200] + "..." if len(doc) > 200 else doc
        print(f"  {i+1}. {preview}")
    
    print("\n✅ All artifacts saved successfully!")
    return vectorizer, tfidf_matrix, internship_ids, df


if __name__ == "__main__":
    try:
        vectorizer, matrix, ids, df = train_save_artifacts()
        print(f"\n🎯 Training completed successfully!")
        print(f"   - Processed {len(df)} internships")
        print(f"   - Matrix shape: {matrix.shape}")
        print(f"   - Vocabulary size: {len(vectorizer.vocabulary_)}")
    except Exception as e:
        print(f"❌ Error during training: {e}")
        sys.exit(1)