"""Rule-based photo classification for MVP citizen science uploads."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class PhotoClass(str, Enum):
    LIKELY_BLOOM = "likely_bloom"
    CLEAR_WATER = "clear_water"
    UNCERTAIN = "uncertain"


@dataclass
class PhotoClassification:
    label: PhotoClass
    confidence: str  # low | medium | high
    green_score: float
    reason: str


def classify_from_green_score(
    green_score: float,
    user_tags: list[str] | None = None,
) -> PhotoClassification:
    """
    MVP classifier using green dominance score (0-1).
    Production Year 2 replaces this with CNN.
    """
    tags = user_tags or []
    has_scum_tag = any(t in tags for t in ("surface_scum", "green_tint", "odor"))

    if green_score > 0.55 and has_scum_tag:
        return PhotoClassification(
            label=PhotoClass.LIKELY_BLOOM,
            confidence="medium",
            green_score=green_score,
            reason="Elevated green channel dominance with bloom-related user tags.",
        )
    if green_score > 0.65:
        return PhotoClassification(
            label=PhotoClass.LIKELY_BLOOM,
            confidence="low",
            green_score=green_score,
            reason="High green score; awaiting human verification.",
        )
    if green_score < 0.35:
        return PhotoClassification(
            label=PhotoClass.CLEAR_WATER,
            confidence="medium",
            green_score=green_score,
            reason="Blue-green ratio consistent with clear water.",
        )
    return PhotoClassification(
        label=PhotoClass.UNCERTAIN,
        confidence="low",
        green_score=green_score,
        reason="Ambiguous color profile; flagged for community review.",
    )
