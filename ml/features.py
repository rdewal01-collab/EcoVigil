"""Spectral index computation for Sentinel-2 L2A surface reflectance."""

from __future__ import annotations

import numpy as np


def ndci(red_edge: np.ndarray, red: np.ndarray) -> np.ndarray:
    """Normalized Difference Chlorophyll Index (Mishra & Mishra 2012)."""
    denom = red_edge + red
    with np.errstate(divide="ignore", invalid="ignore"):
        out = (red_edge - red) / denom
    return np.nan_to_num(out, nan=0.0, posinf=0.0, neginf=0.0)


def ndwi(green: np.ndarray, nir: np.ndarray) -> np.ndarray:
    """Normalized Difference Water Index (McFeeters 1996)."""
    denom = green + nir
    with np.errstate(divide="ignore", invalid="ignore"):
        out = (green - nir) / denom
    return np.nan_to_num(out, nan=0.0, posinf=0.0, neginf=0.0)


def fai(nir: np.ndarray, red: np.ndarray, swir: np.ndarray) -> np.ndarray:
    """Floating Algae Index (Hu 2009) simplified."""
    # Linear baseline between red (665nm) and swir (1610nm); NIR at 842nm
    baseline = red + (swir - red) * (842 - 665) / (1610 - 665)
    return nir - baseline


def cyano_proxy(red: np.ndarray, blue: np.ndarray) -> np.ndarray:
    """Simplified cyanobacteria proxy from red/blue ratio."""
    denom = red + blue
    with np.errstate(divide="ignore", invalid="ignore"):
        out = (red - blue) / denom
    return np.nan_to_num(out, nan=0.0, posinf=0.0, neginf=0.0)


def aggregate_index(arr: np.ndarray, mask: np.ndarray | None = None) -> dict[str, float]:
    """Compute mean, max, std, p90 for valid pixels."""
    if mask is not None:
        vals = arr[mask]
    else:
        vals = arr.flatten()
    vals = vals[np.isfinite(vals)]
    if len(vals) == 0:
        return {"mean": 0.0, "max": 0.0, "std": 0.0, "p90": 0.0, "count": 0}
    return {
        "mean": float(np.mean(vals)),
        "max": float(np.max(vals)),
        "std": float(np.std(vals)),
        "p90": float(np.percentile(vals, 90)),
        "count": int(len(vals)),
    }


def water_mask_from_ndwi(green: np.ndarray, nir: np.ndarray, threshold: float = 0.0) -> np.ndarray:
    """Mask pixels likely to be water."""
    w = ndwi(green, nir)
    return w > threshold
