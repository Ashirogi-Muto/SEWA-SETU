from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select, and_
from backend.database import AsyncSessionLocal
from backend.models import Report, ReportStatus
from backend.services.impact import calculate_impact
from backend.ws_manager import manager
from backend.logging_config import logger
from datetime import datetime, timedelta
import os

# Config
DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"
ESCALATION_INTERVAL_SECONDS = 60 if DEMO_MODE else 3600  # 1 min vs 1 hour
ESCALATION_THRESHOLD_HOURS = 0.05 if DEMO_MODE else 48  # 3 mins vs 48 hours

scheduler = AsyncIOScheduler()

async def check_escalations():
    """
    Periodic job to escalate stale reports.
    """
    logger.info("⏰ Running Escalation Check...")
    
    async with AsyncSessionLocal() as session:
        try:
            # Find open reports older than threshold
            # Note: This is a simplified check. In prod, use DB query for filtering date.
            # Here we fetch active open/in_progress and check python-side for complex logic if needed
            # or simplify with SQL.
            
            stmt = select(Report).where(
                and_(
                    Report.is_active == True,
                    Report.status.in_([ReportStatus.OPEN, ReportStatus.IN_PROGRESS])
                )
            )
            
            result = await session.execute(stmt)
            reports = result.scalars().all()
            
            threshold_delta = timedelta(hours=ESCALATION_THRESHOLD_HOURS)
            now = datetime.utcnow()
            
            updates = 0
            
            for report in reports:
                # Ensure timezone awareness compatibility
                created_at = report.created_at
                if created_at.tzinfo:
                    created_at = created_at.replace(tzinfo=None) # Compare as UTC naive for simplicity
                
                if now - created_at > threshold_delta:
                    # ESCALATE
                    old_level = report.escalation_level
                    report.escalation_level += 1
                    report.impact_score = calculate_impact(report)
                    
                    session.add(report)
                    updates += 1
                    
                    # Notify
                    await manager.broadcast("escalation_triggered", {
                        "id": report.id,
                        "escalation_level": report.escalation_level,
                        "impact_score": report.impact_score,
                        "message": f"Report escalated to level {report.escalation_level}"
                    })
                    
            if updates > 0:
                await session.commit()
                logger.info(f"🚀 Escalated {updates} reports.")
                
        except Exception as e:
            logger.error(f"Escalation job failed: {e}")
            await session.rollback()

def start_scheduler():
    scheduler.add_job(check_escalations, 'interval', seconds=ESCALATION_INTERVAL_SECONDS)
    scheduler.start()
    logger.info(f"⏳ Escalation Scheduler started (Demo Mode: {DEMO_MODE})")
