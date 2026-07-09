#!/usr/bin/env python3
"""Train Random Forest bloom risk classifier for BlueWatch AI MVP."""

from __future__ import annotations

import json
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import GroupKFold
from sklearn.calibration import CalibratedClassifierCV

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
MODEL_PATH = ROOT / "model.pkl"
METRICS_PATH = ROOT / "metrics.json"
FEATURE_NAMES_PATH = ROOT / "feature_names.json"

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


def load_or_synthesize_training_data() -> pd.DataFrame:
    """Load training CSV or synthesize from lakes + predictions."""
    csv_path = DATA_DIR / "training_features.csv"
    if csv_path.exists():
        return pd.read_csv(csv_path)

    lakes = json.loads((DATA_DIR / "lakes.json").read_text())
    preds = json.loads((DATA_DIR / "predictions.json").read_text())
    lake_map = {l["id"]: l for l in lakes}

    rows = []
    rng = np.random.default_rng(42)

    for p in preds:
        lake = lake_map[p["lakeId"]]
        label = 1 if p["riskScore"] >= 0.5 or lake["nyhabsEvents2024"] >= 2 else 0
        # Augment with noisy duplicates for training volume
        for _ in range(4):
            rows.append(
                {
                    "lake_id": p["lakeId"],
                    "ndci_mean": p["ndciMean"] + rng.normal(0, 0.03),
                    "ndci_max": p["ndciMean"] * 1.2 + rng.normal(0, 0.02),
                    "ndwi_mean": p["ndwiMean"] + rng.normal(0, 0.02),
                    "fai_mean": p["faiMean"] + rng.normal(0, 0.005),
                    "cyano_proxy": p["cyanoProxy"] + rng.normal(0, 0.03),
                    "temp_7d_mean": p["temp7d"] + rng.normal(0, 1),
                    "rainfall_7d": max(0, p["rainfall7d"] + rng.normal(0, 0.2)),
                    "lake_area_ha": lake["areaHa"],
                    "prior_bloom_season": lake["nyhabsEvents2024"],
                    "day_sin": np.sin(2 * np.pi * 200 / 365),
                    "day_cos": np.cos(2 * np.pi * 200 / 365),
                    "label": label,
                }
            )

    df = pd.DataFrame(rows)
    df.to_csv(csv_path, index=False)
    return df


def train() -> dict:
    df = load_or_synthesize_training_data()
    X = df[FEATURE_COLS].values
    y = df["label"].values
    groups = df["lake_id"].values

    gkf = GroupKFold(n_splits=min(5, len(np.unique(groups))))
    aucs, f1s = [], []

    for train_idx, test_idx in gkf.split(X, y, groups):
        X_train, X_test = X[train_idx], X[test_idx]
        y_train, y_test = y[train_idx], y[test_idx]

        base = RandomForestClassifier(
            n_estimators=200,
            max_depth=8,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        )
        clf = CalibratedClassifierCV(base, cv=3, method="isotonic")
        clf.fit(X_train, y_train)
        proba = clf.predict_proba(X_test)[:, 1]
        pred = (proba >= 0.5).astype(int)
        if len(np.unique(y_test)) > 1:
            aucs.append(roc_auc_score(y_test, proba))
        f1s.append(f1_score(y_test, pred, zero_division=0))

    # Final model on all data
    final_base = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    final_clf = CalibratedClassifierCV(final_base, cv=3, method="isotonic")
    final_clf.fit(X, y)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(final_clf, f)

    importances = final_base.fit(X, y).feature_importances_
    feat_imp = dict(zip(FEATURE_COLS, importances.tolist()))

    metrics = {
        "roc_auc_mean": round(float(np.mean(aucs)), 3) if aucs else None,
        "f1_mean": round(float(np.mean(f1s)), 3),
        "n_samples": len(df),
        "n_lakes": int(df["lake_id"].nunique()),
        "feature_importances": feat_imp,
        "model_version": "rf-v1.0.0",
    }

    METRICS_PATH.write_text(json.dumps(metrics, indent=2))
    FEATURE_NAMES_PATH.write_text(json.dumps(FEATURE_COLS, indent=2))

    y_pred = final_clf.predict(X)
    metrics["confusion_matrix"] = confusion_matrix(y, y_pred).tolist()
    metrics["classification_report"] = classification_report(y, y_pred, output_dict=True)

    print(json.dumps(metrics, indent=2))
    return metrics


if __name__ == "__main__":
    train()
