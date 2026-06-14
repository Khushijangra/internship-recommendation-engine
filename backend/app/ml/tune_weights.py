import os
import sys
import json
from typing import List, Dict, Tuple

import pandas as pd


PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


def load_goldset(path: str) -> List[Dict]:
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    # Create a minimal goldset if missing
    samples = [
        {
            "UserID": "U001",
            "EducationLevel": "UG",
            "Skills": ["python", "sql", "machine learning"],
            "SectorInterest": "IT & Software",
            "Location": "Bengaluru",
            "ExpectedTopInternshipIDs": ["INT0953", "INT0893", "INT0923"],
        },
        {
            "UserID": "U002",
            "EducationLevel": "PG",
            "Skills": ["research", "statistics"],
            "SectorInterest": "Research & Development",
            "Location": "Delhi",
            "ExpectedTopInternshipIDs": ["INT0172", "INT0059"],
        },
        {
            "UserID": "U003",
            "EducationLevel": "UG",
            "Skills": ["javascript", "react"],
            "SectorInterest": "IT & Software",
            "Location": "Mumbai",
            "ExpectedTopInternshipIDs": ["INT0600", "INT0700"],
        },
    ]
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(samples, f, ensure_ascii=False, indent=2)
    return samples


def precision_at_k(expected: List[str], returned_ids: List[str], k: int = 3) -> float:
    if not expected:
        return 0.0
    top_k = set(returned_ids[:k])
    hits = len([eid for eid in expected if eid in top_k])
    return hits / len(expected)


def run_eval(weight_cfg: Dict[str, float], goldset: List[Dict]) -> Tuple[float, List[Dict]]:
    # Patch weights dynamically on import
    from backend.app.ml import recommend as rec
    rec.WEIGHTS.update(weight_cfg or {})

    results_summary: List[Dict] = []
    precisions: List[float] = []

    for profile in goldset:
        user_profile = {
            "EducationLevel": profile.get("EducationLevel", ""),
            "Skills": ", ".join(profile.get("Skills", [])),
            "SectorInterest": profile.get("SectorInterest", ""),
            "Location": profile.get("Location", ""),
            "Mode": profile.get("Mode", ""),
            "ExperienceLevel": profile.get("ExperienceLevel", ""),
        }
        expected_ids = [str(x) for x in profile.get("ExpectedTopInternshipIDs", [])]

        recs = rec.get_recommendations(user_profile, top_n=5)
        recs_sorted = sorted(recs, key=lambda r: r.get("FinalScore", 0.0), reverse=True)
        returned_ids = [str(r.get("InternshipID", "")) for r in recs_sorted]

        # Compute precision@3
        p3 = precision_at_k(expected_ids, returned_ids, k=3)
        precisions.append(p3)

        # Map expected to ranks and scores
        expected_details = []
        for eid in expected_ids:
            if eid in returned_ids:
                rank = returned_ids.index(eid) + 1
                score = next((r.get("FinalScore", 0.0) for r in recs_sorted if str(r.get("InternshipID")) == eid), 0.0)
                expected_details.append({"InternshipID": eid, "Rank": rank, "Score": score})
            else:
                expected_details.append({"InternshipID": eid, "Rank": None, "Score": 0.0})

        results_summary.append({
            "UserID": profile.get("UserID", ""),
            "Precision@3": p3,
            "Expected": expected_details,
            "ReturnedTop5": [{
                "InternshipID": r.get("InternshipID"),
                "FinalScore": r.get("FinalScore"),
                "MatchedSkills": r.get("MatchedSkills", []),
                "Reason": r.get("Reason", ""),
            } for r in recs_sorted]
        })

    avg_p3 = sum(precisions) / len(precisions) if precisions else 0.0
    return avg_p3, results_summary


def print_results(cfg_name: str, cfg: Dict[str, float], avg_p3: float, details: List[Dict]) -> None:
    print("\n=== EVALUATION: " + cfg_name + " ===")
    print(f"Weights: {cfg}")
    print(f"Average Precision@3: {avg_p3:.3f}")
    zero_hit_users = [d["UserID"] for d in details if d.get("Precision@3", 0.0) == 0.0]
    if zero_hit_users:
        print(f"Profiles with 0% hits: {', '.join(zero_hit_users)}")
    for d in details:
        print(f"\nUser {d['UserID']} — Precision@3: {d['Precision@3']:.3f}")
        print("Expected IDs (rank, score):")
        for e in d["Expected"]:
            rank_display = e["Rank"] if e["Rank"] is not None else "-"
            print(f"  {e['InternshipID']}: rank={rank_display}, score={e['Score']:.4f}")
        print("Returned Top5:")
        for r in d["ReturnedTop5"]:
            print(f"  {r['InternshipID']} | score={r['FinalScore']:.4f} | skills={', '.join(r.get('MatchedSkills') or [])}")


if __name__ == "__main__":
    goldset_path = os.path.join(PROJECT_ROOT, "data", "goldset_profiles.json")
    goldset = load_goldset(goldset_path)

    # Grid of weight configurations around baseline
    base = {"cosine": 0.50, "skill": 0.25, "location": 0.15, "education_sector": 0.10, "rural": 1.0}
    deltas = [-0.05, 0.0, 0.05]
    configs = {}
    idx = 0
    for dc in deltas:
        for ds in deltas:
            for dl in deltas:
                for de in deltas:
                    cfg = {
                        "cosine": round(base["cosine"] + dc, 2),
                        "skill": round(base["skill"] + ds, 2),
                        "location": round(base["location"] + dl, 2),
                        "education_sector": round(base["education_sector"] + de, 2),
                        "rural": 1.0,
                    }
                    main_sum = cfg["cosine"] + cfg["skill"] + cfg["location"] + cfg["education_sector"]
                    if 0.9 <= main_sum <= 1.1 and all(0.0 <= v <= 1.0 for v in [cfg["cosine"], cfg["skill"], cfg["location"], cfg["education_sector"]]):
                        configs[f"cfg_{idx}"] = cfg
                        idx += 1

    best_cfg_name = None
    best_avg = -1.0
    best_details: List[Dict] = []

    for name, cfg in configs.items():
        avg_p3, details = run_eval(cfg, goldset)
        print_results(name, cfg, avg_p3, details)
        if avg_p3 > best_avg:
            best_avg = avg_p3
            best_cfg_name = name
            best_details = details

    print("\n=== SUMMARY ===")
    print(f"Best config: {best_cfg_name} with Avg Precision@3={best_avg:.3f}")
    print(f"Final weights used: {configs.get(best_cfg_name)}")

    # Save best weights for production usage
    models_dir = os.path.join(PROJECT_ROOT, "backend", "app", "models")
    os.makedirs(models_dir, exist_ok=True)
    weights_path = os.path.join(models_dir, "weights.json")
    with open(weights_path, "w", encoding="utf-8") as f:
        json.dump(configs.get(best_cfg_name, {}), f, ensure_ascii=False, indent=2)
    print(f"Saved best weights to {weights_path}")

    # Notes:
    # If precision remains below target, expand goldset or refine synonyms and skill weighting.


