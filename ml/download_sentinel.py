#!/usr/bin/env python3
"""
Download Sentinel-2 L2A scenes for NY lakes via Copernicus Data Space.

Requires: pip install sentinelsat (or use OData API manually)
For MVP, spectral features are pre-computed in predictions.json.
This script documents the production pipeline and can run when credentials are set.

Environment:
  COPERNICUS_USER - Copernicus Data Space username
  COPERNICUS_PASSWORD - password
"""

from __future__ import annotations

import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
CACHE_DIR = DATA_DIR / "sentinel_cache"


def get_lake_bboxes() -> dict[str, tuple[float, float, float, float]]:
    """Return WGS84 bboxes (min_lon, min_lat, max_lon, max_lat) per lake."""
    lakes = json.loads((DATA_DIR / "lakes.json").read_text())
    bboxes = {}
    pad = 0.02  # ~2km padding
    for lake in lakes:
        bboxes[lake["id"]] = (
            lake["lon"] - pad,
            lake["lat"] - pad,
            lake["lon"] + pad,
            lake["lat"] + pad,
        )
    return bboxes


def download_sentinel2(
    lake_id: str,
    start_date: str = "2026-06-01",
    end_date: str = "2026-06-27",
    max_cloud: int = 30,
) -> list[Path]:
    """
    Download Sentinel-2 L2A products for a lake bounding box.

    Returns list of downloaded SAFE/ZIP paths.
    Skips if credentials not configured.
    """
    user = os.environ.get("COPERNICUS_USER")
    password = os.environ.get("COPERNICUS_PASSWORD")

    if not user or not password:
        print(
            "COPERNICUS_USER/COPERNICUS_PASSWORD not set. "
            "Skipping live download; using pre-computed indices in predictions.json."
        )
        return []

    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    try:
        from sentinelsat import SentinelAPI, read_geojson, geojson_to_wkt
    except ImportError:
        print("sentinelsat not installed. Run: pip install sentinelsat")
        return []

    api = SentinelAPI(user, password, "https://apihub.copernicus.eu/apihub")
    bboxes = get_lake_bboxes()
    bbox = bboxes[lake_id]

    footprint = f"{bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}"
    products = api.query(
        footprint,
        date=(start_date, end_date),
        platformname="Sentinel-2",
        processinglevel="Level-2A",
        cloudcoverpercentage=(0, max_cloud),
    )

    api.download_all(products, directory_path=str(CACHE_DIR / lake_id))
    return list((CACHE_DIR / lake_id).glob("*.zip"))


def main():
    lakes = json.loads((DATA_DIR / "lakes.json").read_text())
    print(f"Sentinel-2 download pipeline ready for {len(lakes)} lakes")
    print("Set COPERNICUS_USER and COPERNICUS_PASSWORD to enable live downloads.")
    # Demo: attempt first lake
    if lakes:
        download_sentinel2(lakes[0]["id"])


if __name__ == "__main__":
    main()
