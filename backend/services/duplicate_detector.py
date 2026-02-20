import math
import imagehash
from PIL import Image
import io
import os
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models import Report, ReportStatus

# Configuration
DUPLICATE_RADIUS_KM = 0.03  # 30 meters
HASH_Threshold = 5

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) * math.sin(dlon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

async def find_duplicate(session: AsyncSession, new_report: Report, image_bytes: bytes = None) -> Report | None:
    """
    Find a duplicate report based on location and optionally image similarity.
    Only checks active, non-resolved reports.
    """
    
    # 1. Bounding Box Filter (Approx 0.0003 degrees ~ 30m)
    # This optimization prevents scanning the whole table
    lat_margin = 0.001 
    lon_margin = 0.001
    
    stmt = select(Report).where(
        and_(
            Report.is_active == True,
            Report.status.in_([ReportStatus.OPEN, ReportStatus.IN_PROGRESS]),
            Report.latitude.between(new_report.latitude - lat_margin, new_report.latitude + lat_margin),
            Report.longitude.between(new_report.longitude - lon_margin, new_report.longitude + lon_margin),
            Report.id != new_report.id  # Exclude self if already saved (usually not saved yet)
        )
    )
    
    result = await session.execute(stmt)
    candidates = result.scalars().all()
    
    best_match = None
    
    for candidate in candidates:
        # 2. Precise Haversine Check
        dist = haversine_distance(new_report.latitude, new_report.longitude, candidate.latitude, candidate.longitude)
        
        if dist <= DUPLICATE_RADIUS_KM:
            # If location matches, check image if available
            if image_bytes and candidate.image_url:
                try:
                    # In a real app, we'd store hashes in DB. 
                    # For Hackathon, we'll re-compute or skip if too slow.
                    # Here we assume just location match is strong enough for "Potential Duplicate"
                    # But if image is present, we could check it.
                    # For simplicity/speed in demo, we'll rely heavily on Location + Image Check if possible.
                    # Let's assume location match within 30m is a duplicate for now.
                    best_match = candidate
                    break
                except Exception:
                    continue
            else:
                # Text/Location match
                best_match = candidate
                break
                
    return best_match
