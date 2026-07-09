#!/usr/bin/env python3
"""Generate sample lakes and predictions for BlueWatch AI MVP."""

import json
import math
import random
from pathlib import Path

random.seed(42)

ROOT = Path(__file__).resolve().parent.parent
ML_DATA = ROOT / "ml" / "data"
FRONTEND_DATA = ROOT / "frontend" / "public" / "data"

LAKES = [
    ("lake-ronkonkoma", "Lake Ronkonkoma", "Suffolk", 40.8128, -73.1134, 243, 12, 3),
    ("blydenburgh-pond", "Blydenburgh Pond", "Suffolk", 40.8617, -73.3656, 18, 4, 1),
    ("canopus-lake", "Canopus Lake", "Putnam", 41.3267, -73.7944, 62, 8, 2),
    ("lake-mahopac", "Lake Mahopac", "Putnam", 41.3656, -73.7403, 241, 15, 2),
    ("greenwood-lake", "Greenwood Lake", "Orange", 41.2206, -74.3892, 762, 25, 1),
    ("lake-waramaug", "Lake Waramaug", "Litchfield", 41.6867, -73.4067, 259, 13, 1),
    ("crystal-lake", "Crystal Lake", "Bennington", 42.9167, -73.2167, 45, 6, 0),
    ("lake-george", "Lake George", "Warren", 43.9250, -73.6550, 4424, 60, 0),
    ("lake-placid", "Lake Placid", "Essex", 44.2794, -73.9797, 890, 45, 1),
    ("mirror-lake", "Mirror Lake", "Essex", 44.2947, -73.9814, 48, 6, 1),
    ("oneida-lake", "Oneida Lake", "Oswego", 43.2000, -75.9333, 20700, 17, 4),
    ("cayuga-lake", "Cayuga Lake", "Tompkins", 42.6667, -76.6667, 17200, 40, 3),
    ("seneca-lake", "Seneca Lake", "Seneca", 42.6500, -76.9167, 17500, 60, 2),
    ("keuka-lake", "Keuka Lake", "Yates", 42.5167, -77.1167, 4600, 57, 1),
    ("skaneateles-lake", "Skaneateles Lake", "Onondaga", 42.9333, -76.4167, 3600, 50, 0),
    ("otsego-lake", "Otsego Lake", "Otsego", 42.7667, -74.9167, 760, 50, 1),
    ("chautauqua-lake", "Chautauqua Lake", "Chautauqua", 42.1167, -79.3667, 5300, 6, 3),
    ("conesus-lake", "Conesus Lake", "Livingston", 42.7167, -77.7167, 1400, 12, 2),
    ("honeoye-lake", "Honeoye Lake", "Ontario", 42.7333, -77.5167, 700, 6, 4),
    ("canandaigua-lake", "Canandaigua Lake", "Ontario", 42.7500, -77.2833, 4200, 80, 1),
    ("owasco-lake", "Owasco Lake", "Cayuga", 42.8333, -76.5167, 2600, 50, 2),
    ("onondaga-lake", "Onondaga Lake", "Onondaga", 43.0833, -76.2167, 1200, 6, 5),
    ("cross-lake", "Cross Lake", "Onondaga", 43.1333, -76.2833, 430, 8, 2),
    ("oneida-creek-reservoir", "Oneida Creek Reservoir", "Madison", 42.8833, -75.6500, 120, 5, 1),
    ("delta-lake", "Delta Lake", "Oneida", 43.2833, -75.4167, 280, 12, 1),
    ("saratoga-lake", "Saratoga Lake", "Saratoga", 43.0167, -73.7500, 580, 30, 2),
    ("ballston-lake", "Ballston Lake", "Saratoga", 42.9333, -73.8500, 380, 10, 1),
    ("great-south-bay", "Great South Bay", "Suffolk", 40.6833, -73.0833, 6400, 3, 2),
    ("montauk-lake", "Fort Pond", "Suffolk", 41.0333, -71.9500, 44, 4, 1),
    ("nassau-lake", "Lake Success", "Nassau", 40.7667, -73.7167, 32, 5, 0),
    ("argyle-lake", "Argyle Lake", "Suffolk", 40.7167, -73.2833, 40, 6, 1),
    ("upper-lake", "Upper Lake", "Suffolk", 40.6833, -73.3167, 25, 4, 2),
    ("lower-lake", "Lower Lake", "Suffolk", 40.6833, -73.3167, 30, 4, 1),
    ("wampus-pond", "Wampus Pond", "Westchester", 41.1167, -73.7833, 12, 3, 0),
    ("muscle-shoals", "Muscle Shoals Lake", "Westchester", 41.0833, -73.7667, 8, 2, 0),
    ("croton-reservoir", "Croton Falls Reservoir", "Westchester", 41.3500, -73.6833, 180, 15, 0),
    ("kensico-reservoir", "Kensico Reservoir", "Westchester", 41.0833, -73.7667, 920, 30, 0),
    ("neversink-reservoir", "Neversink Reservoir", "Sullivan", 41.4833, -74.6167, 550, 50, 1),
    ("ashokan-reservoir", "Ashokan Reservoir", "Ulster", 41.9500, -74.2167, 3400, 40, 0),
    ("cooper-lake", "Cooper Lake", "Ulster", 42.0167, -74.2833, 120, 8, 1),
    ("mohonk-lake", "Mohonk Lake", "Ulster", 41.7667, -74.1833, 28, 18, 0),
    ("minnewaska", "Lake Minnewaska", "Ulster", 41.7333, -74.2500, 8, 12, 0),
    ("harlem-meer", "Harlem Meer", "New York", 40.8000, -73.9500, 4, 3, 1),
    ("central-park-lake", "Central Park Lake", "New York", 40.7750, -73.9650, 6, 2, 1),
    ("prospect-park-lake", "Prospect Park Lake", "Kings", 40.6600, -73.9683, 21, 3, 2),
    ("jamaica-bay", "Jamaica Bay", "Kings", 40.6167, -73.8167, 6500, 4, 1),
    ("irondequoit-bay", "Irondequoit Bay", "Monroe", 43.2167, -77.5167, 690, 6, 2),
    ("hemlock-lake", "Hemlock Lake", "Livingston", 42.7167, -77.6167, 730, 27, 0),
    ("lamoka-lake", "Lamoka Lake", "Schuyler", 42.4167, -77.1167, 308, 5, 3),
    ("waneta-lake", "Waneta Lake", "Schuyler", 42.4167, -77.0833, 350, 8, 1),
]

NYHABS_URL = "https://www.dec.ny.gov/environmental-protection/harmful-algal-blooms"


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


def generate_prediction(lake_id: str, nyhabs: int, area: int) -> dict:
    # Higher nyhabs history -> higher base risk
    base = 0.15 + nyhabs * 0.12 + random.uniform(-0.1, 0.15)
    base = max(0.05, min(0.92, base))

    ndci = 0.1 + base * 0.45 + random.uniform(-0.05, 0.05)
    ndwi = 0.2 + random.uniform(0, 0.3)
    fai = max(0, (base - 0.3) * 0.08 + random.uniform(0, 0.02))
    cyano = max(0, (base - 0.2) * 0.5 + random.uniform(-0.05, 0.1))
    temp = 18 + random.uniform(0, 12)
    rain = random.uniform(0, 2.5)
    pixels = random.randint(8, 120)

    score = base
    level = risk_level(score)
    conf = confidence_level(pixels, score)

    # Feature contributions (mock SHAP-like)
    features = [
        {"name": "ndci_mean", "contribution": round(ndci * 0.4, 3)},
        {"name": "temp_7d_mean", "contribution": round((temp - 20) * 0.02, 3)},
        {"name": "rainfall_7d", "contribution": round(rain * 0.05, 3)},
        {"name": "prior_bloom_season", "contribution": round(nyhabs * 0.04, 3)},
        {"name": "fai_mean", "contribution": round(fai * 2, 3)},
    ]
    features.sort(key=lambda x: abs(x["contribution"]), reverse=True)

    days_ago = random.randint(1, 9)
    from datetime import date, timedelta

    obs = (date.today() - timedelta(days=days_ago)).isoformat()

    return {
        "lakeId": lake_id,
        "observedDate": obs,
        "riskScore": round(score, 3),
        "riskLevel": level,
        "confidence": conf,
        "ndciMean": round(ndci, 3),
        "ndwiMean": round(ndwi, 3),
        "faiMean": round(fai, 4),
        "cyanoProxy": round(cyano, 3),
        "temp7d": round(temp, 1),
        "rainfall7d": round(rain, 2),
        "validPixelCount": pixels,
        "modelVersion": "rf-v1.0.0",
        "topFeatures": features[:3],
    }


def main():
    ML_DATA.mkdir(parents=True, exist_ok=True)
    FRONTEND_DATA.mkdir(parents=True, exist_ok=True)

    lakes = []
    predictions = []

    for lid, name, county, lat, lon, area, depth, nyhabs in LAKES:
        lakes.append(
            {
                "id": lid,
                "name": name,
                "county": county,
                "state": "NY",
                "lat": lat,
                "lon": lon,
                "areaHa": area,
                "maxDepthM": depth,
                "nyhabsEvents2024": nyhabs,
                "officialAdvisoryUrl": NYHABS_URL,
            }
        )
        predictions.append(generate_prediction(lid, nyhabs, area))

    lakes_path_ml = ML_DATA / "lakes.json"
    lakes_path_fe = FRONTEND_DATA / "lakes.json"
    pred_path_ml = ML_DATA / "predictions.json"
    pred_path_fe = FRONTEND_DATA / "predictions.json"

    for p in [lakes_path_ml, lakes_path_fe]:
        p.write_text(json.dumps(lakes, indent=2))
    for p in [pred_path_ml, pred_path_fe]:
        p.write_text(json.dumps(predictions, indent=2))

    # Sample citizen reports
    reports = [
        {
            "id": "rpt-001",
            "lakeId": "lake-ronkonkoma",
            "description": "Green scum visible along northeast shore",
            "tags": ["surface_scum", "green_tint"],
            "lat": 40.815,
            "lon": -73.11,
            "verified": True,
            "createdAt": "2026-06-20T14:30:00Z",
        },
        {
            "id": "rpt-002",
            "lakeId": "honeoye-lake",
            "description": "Strong earthy odor, water appears green",
            "tags": ["odor", "green_tint"],
            "lat": 42.735,
            "lon": -77.518,
            "verified": True,
            "createdAt": "2026-06-18T10:15:00Z",
        },
        {
            "id": "rpt-003",
            "lakeId": "prospect-park-lake",
            "description": "Possible algae accumulation near bridge",
            "tags": ["uncertain"],
            "lat": 40.661,
            "lon": -73.969,
            "verified": False,
            "createdAt": "2026-06-22T16:00:00Z",
        },
    ]
    reports_path = FRONTEND_DATA / "reports.json"
    reports_path.write_text(json.dumps(reports, indent=2))

    print(f"Generated {len(lakes)} lakes and {len(predictions)} predictions")
    print(f"Written to {FRONTEND_DATA}")


if __name__ == "__main__":
    main()
