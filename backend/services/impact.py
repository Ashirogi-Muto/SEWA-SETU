from datetime import datetime, timezone
from backend.models import Report

def get_days_open(report: Report) -> float:
    """Calculate days open dynamically."""
    if not report.created_at:
        return 0.0
    
    # Use timezone-aware now
    now = datetime.now(report.created_at.tzinfo) if report.created_at.tzinfo else datetime.now(timezone.utc)
    delta = now - report.created_at
    return max(0.0, delta.total_seconds() / 86400.0)

def calculate_impact(report: Report) -> float:
    """
    Calculate impact score based on:
    - Duplicates (Validation) -> 2.0x
    - Escalation Level (Urgency) -> 3.0x
    - Days Open (Neglect) -> 1.5x
    """
    days = get_days_open(report)
    
    # Convert duplicate_count to float to ensure float result
    dup_weight = float(report.duplicate_count) * 2.0
    esc_weight = float(report.escalation_level) * 3.0
    time_weight = days * 1.5
    
    return round(dup_weight + esc_weight + time_weight, 2)
