import math
import imagehash
from PIL import Image
import io
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models import Report, ReportStatus
from backend.logging_config import get_logger
logger = get_logger("duplicate_detector", "duplicate_detector")

# Configuration
DUPLICATE_RADIUS_KM = 0.03  # 30 meters
IMAGE_HASH_THRESHOLD = 5    # Hamming distance threshold (0 = identical, higher = more different)


def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two GPS coordinates in km."""
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) * math.sin(dlon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def compute_image_hash(image_bytes: bytes) -> str | None:
    """Compute perceptual hash from image bytes."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        return str(imagehash.average_hash(img))
    except Exception as e:
        logger.warning(f"Could not compute image hash: {e}")
        return None


def image_hashes_match(hash1: str, hash2: str) -> bool:
    """Compare two hex hash strings by hamming distance."""
    try:
        h1 = imagehash.hex_to_hash(hash1)
        h2 = imagehash.hex_to_hash(hash2)
        distance = h1 - h2  # Hamming distance
        return distance <= IMAGE_HASH_THRESHOLD
    except Exception:
        return False


async def find_duplicate(
    session: AsyncSession,
    new_report: Report,
    image_bytes: bytes = None
) -> Report | None:
    """
    Find a duplicate report based on:
    1. Geographic proximity (within 30m)
    2. Image similarity (perceptual hash comparison, if images present)
    
    Location match alone is sufficient. Image match strengthens confidence.
    """
    # Bounding box pre-filter (~111m at equator)
    lat_margin = 0.001
    lon_margin = 0.001

    stmt = select(Report).where(
        and_(
            Report.is_active == True,
            Report.status.in_([ReportStatus.OPEN, ReportStatus.IN_PROGRESS]),
            Report.latitude.between(
                new_report.latitude - lat_margin,
                new_report.latitude + lat_margin
            ),
            Report.longitude.between(
                new_report.longitude - lon_margin,
                new_report.longitude + lon_margin
            ),
            Report.id != new_report.id
        )
    )

    result = await session.execute(stmt)
    candidates = result.scalars().all()

    # Compute hash for new image (if provided)
    new_hash = compute_image_hash(image_bytes) if image_bytes else None

    best_match = None

    for candidate in candidates:
        dist = haversine_distance(
            new_report.latitude, new_report.longitude,
            candidate.latitude, candidate.longitude
        )

        if dist <= DUPLICATE_RADIUS_KM:
            # Location match found — check image if both have hashes
            if new_hash and candidate.image_hash:
                if image_hashes_match(new_hash, candidate.image_hash):
                    logger.info(
                        f"Duplicate: location ({dist:.0f}m) + image hash match "
                        f"for report {candidate.id}"
                    )
                    best_match = candidate
                    break
                else:
                    # Same location but different image — still flag as potential duplicate
                    # (location within 30m is strong enough signal)
                    best_match = candidate
                    break
            else:
                # No image comparison possible — location match is sufficient
                best_match = candidate
                break

    return best_match
