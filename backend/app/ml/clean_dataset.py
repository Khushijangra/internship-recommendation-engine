from __future__ import annotations

import re
from pathlib import Path
from typing import List, Optional

import pandas as pd


def _project_root() -> Path:
    current = Path(__file__).resolve()
    for parent in [current, *current.parents]:
        if (parent / "data").exists():
            return parent
    return current.parent.parent.parent


def _standardize_comma_separated_text(value: Optional[str], lowercase: bool = True, capitalize: bool = False) -> str:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return "unknown"
    text = str(value).strip()
    if text == "":
        return "unknown"
    text = text.replace(";", ",")
    parts = [p.strip() for p in text.split(",") if p.strip()]
    if lowercase:
        parts = [p.lower() for p in parts]
    if capitalize:
        parts = [p[:1].upper() + p[1:].lower() if p else p for p in parts]
    return ", ".join(parts) if parts else "unknown"


def _clean_string(value: Optional[str], case: Optional[str] = None) -> str:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return "unknown"
    text = str(value).strip()
    if text == "":
        return "unknown"
    if case == "lower":
        return text.lower()
    if case == "title":
        return text.title()
    return text


def _split_location(value: Optional[str]) -> tuple[str, str]:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ("unknown", "unknown")
    text = str(value).strip()
    if text == "":
        return ("unknown", "unknown")
    parts = [p.strip() for p in text.split(",") if p.strip()]
    if len(parts) == 0:
        return ("unknown", "unknown")
    if len(parts) == 1:
        return (parts[0], "unknown")
    return (parts[0], parts[1])


def clean_internship_dataset() -> None:
    root = _project_root()
    data_dir = root / "data"
    input_csv = data_dir / "internships.csv"
    output_csv = data_dir / "internships_cleaned.csv"

    if not input_csv.exists():
        raise FileNotFoundError(f"Input CSV not found at: {input_csv}")

    df = pd.read_csv(input_csv)

    # Trim whitespace across all string columns
    for col in df.columns:
        if pd.api.types.is_string_dtype(df[col]):
            df[col] = df[col].astype(str).map(lambda x: x.strip())

    # Ensure required columns exist even if missing in raw data
    expected_columns: List[str] = [
        "Title",
        "RequiredSkills",
        "Tags",
        "ToolsUsed",
        "Location",
        "Language",
        "Stipend",
        "Duration",
        "ExperienceLevel",
        "EducationLevel",
    ]
    for col in expected_columns:
        if col not in df.columns:
            df[col] = pd.NA

    # 1. Lowercase text fields (where applicable)
    for col in ["Title", "Tags", "ToolsUsed", "RequiredSkills"]:
        if col in df.columns:
            df[col] = df[col].apply(lambda v: _clean_string(v, case="lower"))

    # 2. Remove leading/trailing spaces already handled above; enforce again for safety
    for col in df.columns:
        if pd.api.types.is_string_dtype(df[col]):
            df[col] = df[col].astype(str).map(lambda x: x.strip())

    # 3. Standardize RequiredSkills to comma-separated lowercased list
    if "RequiredSkills" in df.columns:
        df["RequiredSkills"] = df["RequiredSkills"].apply(lambda v: _standardize_comma_separated_text(v, lowercase=True, capitalize=False))

    # 4. Normalize Location -> City, State; drop Location
    if "Location" in df.columns:
        city_state = df["Location"].apply(_split_location)
        df["City"] = city_state.apply(lambda t: _clean_string(t[0]))
        df["State"] = city_state.apply(lambda t: _clean_string(t[1]))
        df = df.drop(columns=["Location"])

    # 5. Standardize Language capitalization and comma spacing
    if "Language" in df.columns:
        df["Language"] = df["Language"].apply(lambda v: _standardize_comma_separated_text(v, lowercase=False, capitalize=True))

    # 6. Clean Stipend, Duration, ExperienceLevel, EducationLevel
    if "Stipend" in df.columns:
        df["Stipend"] = df["Stipend"].apply(lambda v: _clean_string(v))
    if "Duration" in df.columns:
        df["Duration"] = df["Duration"].apply(lambda v: _clean_string(v))
    if "ExperienceLevel" in df.columns:
        df["ExperienceLevel"] = df["ExperienceLevel"].apply(lambda v: _clean_string(v, case="title"))
    if "EducationLevel" in df.columns:
        df["EducationLevel"] = df["EducationLevel"].apply(lambda v: _clean_string(v, case="title"))

    # 7. Fill missing values with placeholders
    df = df.fillna("unknown")
    # Prefer "Not specified" for some descriptive fields if unknown
    for col in ["Stipend", "Duration"]:
        if col in df.columns:
            df[col] = df[col].apply(lambda v: "Not specified" if str(v).strip().lower() in {"", "unknown", "nan"} else str(v).strip())

    # Uniform comma spacing for Tags and ToolsUsed as well
    for col in ["Tags", "ToolsUsed"]:
        if col in df.columns:
            df[col] = df[col].apply(lambda v: _standardize_comma_separated_text(v, lowercase=True, capitalize=False))

    # Save cleaned dataset
    data_dir.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_csv, index=False)

    print("Dataset cleaned and saved to /data/internships_cleaned.csv")


if __name__ == "__main__":
    clean_internship_dataset()


