#!/usr/bin/env python3
"""Run batch predictions and write predictions.json."""

from __future__ import annotations

import json
import math
import pickle
from datetime import date, timedelta
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
MODEL_PATH = ROOT / "model.pkl"
FRONTEND_DATA = ROOT.parent / "frontend" / "public" / "data"

FEATURE_COLS = [
    "ndci_mean",
    "ndci_max",
    "ndwi_mean",
    "fai_mean",
    "cyano_proxy",
    "temp_7d_mean",
    "rainfall_7d",
    "lake_area_ha",
    "prior_bloom_season",
    "day_sin",
    "day_cos",
]


def risk_level(score: float) -> str:
    if score < 0.25:
        return "low"
    if score < 0.5:
        return "moderate"
    if score < 0.75:
        return "high"
    return "very_high"


def confidence_level(pixels: int, score: float) -> str:
    if pixels >= 50 and (score < 0.3 or score > 0.7):
        return "high"
    if pixels >= 10:
        return "medium"
    return "low"


def predict_all() -> list[dict]:
    lakes = json.loads((DATA_DIR / "lakes.json").read_text())
    existing = {p["lakeId"]: p for p in json.loads((DATA_DIR / "predictions.json").read_text())}

    clf = None
    if MODEL_PATH.exists():
        with open(MODEL_PATH, "rb") as f:
            clf = pickle.load(f)

    metrics = {}
    if (ROOT / "metrics.json").exists():
        metrics = json.loads((ROOT / "metrics.json").read_text())

    feat_imp = metrics.get("feature_importances", {})
    day_of_year = date.today().timetuple().tm_yday
    day_sin = math.sin(2 * math.pi * day_of_year / 365)
    day_cos = math.cos(2 * math.pi * day_of_year / 365)

    results = []
    for lake in lakes:
        ex = existing.get(lake["id"], {})
        row = {
            "ndci_mean": ex.get("ndciMean", 0.2),
            "ndci_max": ex.get("ndciMean", 0.2) * 1.15,
            "ndwi_mean": ex.get("ndwiMean", 0.25),
            "fai_mean": ex.get("faiMean", 0.01),
            "cyano_proxy": ex.get("cyanoProxy", 0.1),
            "temp_7d_mean": ex.get("temp7d", 22),
            "rainfall_7d": ex.get("rainfall7d", 0.5),
            "lake_area_ha": lake["areaHa"],
            "prior_bloom_season": lake["nyhabsEvents2024"],
            "day_sin": day_sin,
            "day_cos": day_cos,
        }

        if clf is not None:
            X = np.array([[row[c] for c in FEATURE_COLS]])
            score = float(clf.predict_proba(X)[0, 1])
        else:
            score = ex.get("riskScore", 0.3)

        pixels = ex.get("validPixelCount", 34)
        level = risk_level(score)
        conf = confidence_level(pixels, score)

        top_features = sorted(
            [
                {"name": k, "contribution": round(v * row.get(k.replace("_mean", "_mean"), 0.1), 3)}
                for k, v in feat_imp.items()
            ],
            key=lambda x: abs(x["contribution"]),
            reverse=True,
        )[:3]

        if not top_features:
            top_features = ex.get("topFeatures", [])

        obs = ex.get("observedDate", (date.today() - timedelta(days=3)).isoformat())

        results.append(
            {
                "lakeId": lake["id"],
                "observedDate": obs,
                "riskScore": round(score, 3),
                "riskLevel": level,
                "confidence": conf,
                "ndciMean": round(row["ndci_mean"], 3),
                "ndwiMean": round(row["ndwi_mean"], 3),
                "faiMean": round(row["fai_mean"], 4),
                "cyanoProxy": round(row["cyano_proxy"], 3),
                "temp7d": round(row["temp_7d_mean"], 1),
                "rainfall7d": round(row["rainfall_7d"], 2),
                "validPixelCount": pixels,
                "modelVersion": metrics.get("model_version", "rf-v1.0.0"),
                "topFeatures": top_features,
            }
        )

    out_paths = [DATA_DIR / "predictions.json", FRONTEND_DATA / "predictions.json"]
    FRONTEND_DATA.mkdir(parents=True, exist_ok=True)
    for p in out_paths:
        p.write_text(json.dumps(results, indent=2))

    print(f"Updated predictions for {len(results)} lakes")
    return results


if __name__ == "__main__":
    predict_all()
