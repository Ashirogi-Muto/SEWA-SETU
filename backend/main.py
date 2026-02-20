import os
import io
import json
import uuid
import random
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, WebSocket, WebSocketDisconnect, Query, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, func, case

import httpx
import aiofiles

# --- Local Imports ---
from backend.database import get_db, engine
from backend.models import Report, User, Department, ReportStatus, Base
from backend.ai_service import classify_report_local
from backend.ws_manager import manager
from backend.services.duplicate_detector import find_duplicate
from backend.services.impact import calculate_impact
from backend.services.escalation_service import start_scheduler
from backend.logging_config import logger

# --- Pydantic Models ---
from pydantic import BaseModel
from typing import Optional, List

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str
    name: str

class AnalyticsResponse(BaseModel):
    total_reports: int
    reports_by_category: dict
    reports_by_status: dict

# --- App Setup ---
app = FastAPI(title="SewaSetu Pro", version="4.0-Local")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files (Local Storage)
UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory="backend"), name="static")

# Startup Event
@app.on_event("startup")
async def startup_event():
    start_scheduler()
    logger.info("🚀 SewaSetu Backend Started (Local Mode)")

# --- Routes ---
router = APIRouter(prefix="/api")

# --- Auth Routes ---
@router.post("/auth/login", response_model=Token)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Simple Mock Auth for Demo - PERMISSIVE MODE
    # If user exists, log them in. If not, auto-create. 
    # Password check is skipped for demo smoothness.
    
    stmt = select(User).where(User.email == request.email)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user:
         # Auto-create user
         role = "admin" if "admin" in request.email else "citizen"
         name = request.email.split("@")[0].capitalize()
         
         user = User(email=request.email, name=name, role=role, password_hash="hashed_secret")
         db.add(user)
         await db.commit()
         await db.refresh(user)
         
    return {
        "access_token": f"fake-jwt-token-{user.id}",
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "name": user.name
    }

@router.post("/auth/register", response_model=Token)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check existing
    stmt = select(User).where(User.email == request.email)
    result = await db.execute(stmt)
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    new_user = User(
        email=request.email,
        name=request.name,
        password_hash="hashed_secret", # Mock hash
        role="citizen"
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return {
        "access_token": f"fake-jwt-token-{new_user.id}",
        "token_type": "bearer",
        "user_id": new_user.id,
        "role": new_user.role,
        "name": new_user.name
    }

@router.get("/health")
def health_check():
    return {
        "status": "active", 
        "database": "postgres/local", 
        "ai_server": "mobilenetv2",
        "demo_mode": os.getenv("DEMO_MODE", "false")
    }


class DepartmentCreate(BaseModel):
    name: str
    email: Optional[str] = None

class DepartmentResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    
    class Config:
        orm_mode = True

# --- Department Routes ---
@router.get("/departments", response_model=List[DepartmentResponse])
async def get_departments(db: AsyncSession = Depends(get_db)):
    stmt = select(Department)
    result = await db.execute(stmt)
    departments = result.scalars().all()
    
    # Seed if empty (for demo)
    if not departments:
        seed_data = [
            {"name": "Roads & Highways", "email": "roads@sewasetu.com"},
            {"name": "Sanitation", "email": "sanitation@sewasetu.com"},
            {"name": "Water Supply", "email": "water@sewasetu.com"},
            {"name": "Electricity", "email": "power@sewasetu.com"},
            {"name": "Public Safety", "email": "safety@sewasetu.com"}
        ]
        for data in seed_data:
            d = Department(name=data["name"], email=data["email"])
            db.add(d)
        await db.commit()
        
        # Re-fetch
        result = await db.execute(stmt)
        departments = result.scalars().all()
        
    return departments

@router.post("/departments", response_model=DepartmentResponse)
async def create_department(dept: DepartmentCreate, db: AsyncSession = Depends(get_db)):
    stmt = select(Department).where(Department.name == dept.name)
    result = await db.execute(stmt)
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Department already exists")
    
    new_dept = Department(name=dept.name, email=dept.email)
    db.add(new_dept)
    await db.commit()
    await db.refresh(new_dept)
    return new_dept

# --- Dashboard & Analytics Stub ---

# --- Dashboard & Analytics ---

@router.get("/dashboard")
async def get_dashboard_data(db: AsyncSession = Depends(get_db)):
    # 1. KPIs
    # Total Reports
    stmt_total = select(func.count(Report.id))
    result_total = await db.execute(stmt_total)
    total_reports = result_total.scalar() or 0
    
    # Resolved Reports
    stmt_resolved = select(func.count(Report.id)).where(Report.status == ReportStatus.RESOLVED)
    result_resolved = await db.execute(stmt_resolved)
    reports_resolved = result_resolved.scalar() or 0
    
    # Active Departments (Count departments with at least one user or report, simplified to just count all for now)
    stmt_depts = select(func.count(Department.id))
    result_depts = await db.execute(stmt_depts)
    active_departments = result_depts.scalar() or 0
    
    # Avg Resolution Time (Mock logic for now as we need history tracking, but better than static string)
    # real logic would differ created_at vs updated_at where status=RESOLVED
    avg_resolution_time = "2.4 days" # Placeholder for complex calc, but dynamic in future

    # 2. Recent Reports
    stmt_recent = select(Report).order_by(desc(Report.created_at)).limit(5)
    result_recent = await db.execute(stmt_recent)
    recent_reports_list = result_recent.scalars().all()
    
    recent_reports_data = []
    for r in recent_reports_list:
        # Calculate relative time string simplistically
        time_diff = datetime.utcnow() - r.created_at.replace(tzinfo=None)
        if time_diff.days > 0:
            time_str = f"{time_diff.days} days ago"
        elif time_diff.seconds > 3600:
            time_str = f"{time_diff.seconds // 3600} hours ago"
        else:
             time_str = f"{time_diff.seconds // 60} mins ago"
             
        recent_reports_data.append({
            "id": f"R-{r.id}",
            "issue": r.description[:30] + "..." if len(r.description) > 30 else r.description,
            "time": time_str,
            "status": r.status.value.replace("_", " ").title()
        })

    # 3. Department Performance (Group by Department/Category)
    # We will use 'Category' as a proxy for Department for now
    stmt_perf = select(
        Report.category, 
        func.count(Report.id).label("total"),
        func.sum(case((Report.status == ReportStatus.RESOLVED, 1), else_=0)).label("resolved")
    ).group_by(Report.category)
    
    result_perf = await db.execute(stmt_perf)
    perf_rows = result_perf.all()
    
    department_performance = []
    for row in perf_rows:
        category = row[0] or "General"
        total = row[1]
        resolved = row[2] or 0
        rate = int((resolved / total) * 100) if total > 0 else 0
        
        department_performance.append({
            "name": category,
            "rate": rate
        })
        
    # If no data, return empty list instead of hardcoded
    if not department_performance:
         department_performance = []

    return {
        "kpis": {
            "totalReports": total_reports,
            "reportsResolved": reports_resolved,
            "avgResolutionTime": avg_resolution_time,
            "activeDepartments": active_departments
        },
        "recentReports": recent_reports_data,
        "departmentPerformance": department_performance
    }

@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(db: AsyncSession = Depends(get_db)):
    # Total Reports
    stmt_total = select(func.count(Report.id))
    result_total = await db.execute(stmt_total)
    total_reports = result_total.scalar() or 0
    
    # Reports by Category
    stmt_cat = select(Report.category, func.count(Report.id)).group_by(Report.category)
    result_cat = await db.execute(stmt_cat)
    reports_by_category = {row[0] or "Uncategorized": row[1] for row in result_cat.all()}
    
    # Reports by Status
    stmt_status = select(Report.status, func.count(Report.id)).group_by(Report.status)
    result_status = await db.execute(stmt_status)
    reports_by_status = {row[0].value: row[1] for row in result_status.all()}

    return {
        "total_reports": total_reports,
        "reports_by_category": reports_by_category,
        "reports_by_status": reports_by_status
    }

@router.get("/reports/all")
async def get_all_reports(
    request: Request, # Added Request to get current host
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    # Base query
    query = select(Report).where(Report.is_active == True).order_by(desc(Report.created_at))
    
    # Filters
    if status and status != "all":
        query = query.where(Report.status == status)
    if category and category != "all":
        query = query.where(Report.category == category)
        
    # Execution
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    reports = result.scalars().all()
    
    # Dynamic URL Fix: Rewrite image_urls to match current request host
    # This fixes issues where 'localhost' was saved but accessed via Public IP
    current_base = str(request.base_url).rstrip('/')
    
    for report in reports:
        if report.image_url and "http" in report.image_url:
             # Extract relative path from saved URL (assuming structure contains /static/uploads/)
             if "/static/uploads/" in report.image_url:
                 filename = report.image_url.split("/static/uploads/")[-1]
                 report.image_url = f"{current_base}/static/uploads/{filename}"
    
    return reports

@router.post("/reports", response_model=dict)
async def submit_report(
    request: Request,
    description: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    images: List[UploadFile] = File(default=[]),
    db: AsyncSession = Depends(get_db)
):
    try:
        # 1. Handle Image Uploads
        saved_image_urls = []
        image_bytes = None
        
        for image in images:
            file_ext = image.filename.split('.')[-1]
            filename = f"{uuid.uuid4()}.{file_ext}"
            filepath = os.path.join(UPLOAD_DIR, filename)
            
            # Read bytes for duplicate check (first image only)
            content = await image.read()
            if not image_bytes:
                image_bytes = content
            
            async with aiofiles.open(filepath, 'wb') as f:
                await f.write(content)
                
            # Construct URL dynamically based on request host
            base_url = str(request.base_url).rstrip('/')
            file_url = f"{base_url}/static/uploads/{filename}"
            saved_image_urls.append(file_url)

        # 2. Duplicate Detection (Pre-Check)
        # Create temp object for logic
        temp_report = Report(
            description=description,
            latitude=latitude,
            longitude=longitude
        )
        
        duplicate_of_report = await find_duplicate(db, temp_report, image_bytes)
        
        is_duplicate = False
        duplicate_parent_id = None
        
        if duplicate_of_report:
            is_duplicate = True
            duplicate_parent_id = duplicate_of_report.id
            logger.info(f"♻️  Duplicate Detected! Linked to ID: {duplicate_parent_id}")

        # 3. AI Classification
        ai_result = await classify_report_local(description, saved_image_urls)
        
        # 4. Create Report Record
        new_report = Report(
            description=description,
            latitude=latitude,
            longitude=longitude,
            category=ai_result['category'],
            confidence=ai_result.get('confidence', 80.0),
            image_url=saved_image_urls[0] if saved_image_urls else None,
            status=ReportStatus.OPEN,
            duplicate_of=duplicate_parent_id
        )
        
        db.add(new_report)
        await db.flush() # Get ID
        
        # 5. Post-Processing (Impact & Notifications)
        if is_duplicate:
            # Update Parent count and impact
            duplicate_of_report.duplicate_count += 1
            duplicate_of_report.impact_score = calculate_impact(duplicate_of_report)
            db.add(duplicate_of_report)
            
            # Notify Admin of Update
            await manager.broadcast("duplicate_detected", {
                "original_id": duplicate_parent_id,
                "new_report_id": new_report.id,
                "new_impact": duplicate_of_report.impact_score
            })
            
            user_message = "This issue was already reported. Your report has been linked to strengthen priority."
        else:
            # Calculate Initial Impact
            new_report.impact_score = calculate_impact(new_report)
            user_message = "Report submitted successfully."
            
            # Notify Admin of New Report
            await manager.broadcast("new_report", {
                "id": new_report.id,
                "category": new_report.category,
                "impact_score": new_report.impact_score,
                "description": new_report.description[:50] + "..."
            })

        await db.commit()
        await db.refresh(new_report)
        
        return {
            "id": new_report.id,
            "message": user_message,
            "category": new_report.category,
            "status": new_report.status,
            "duplicate_of": new_report.duplicate_of
        }

    except Exception as e:
        import traceback
        logger.error(f"❌ Report Submission Failed: {e}")
        logger.error(traceback.format_exc())
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports")
async def get_reports(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    stmt = select(Report).where(Report.is_active == True).order_by(desc(Report.created_at)).offset(skip).limit(limit)
    result = await db.execute(stmt)
    reports = result.scalars().all()
    return reports

@router.patch("/reports/{report_id}/status")
async def update_status(report_id: int, status: ReportStatus, db: AsyncSession = Depends(get_db)):
    stmt = select(Report).where(Report.id == report_id)
    result = await db.execute(stmt)
    report = result.scalars().first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    old_status = report.status
    report.status = status
    
    # Recalculate impact if resolved (stops escalation)
    if status == ReportStatus.RESOLVED:
         # Optionally reduce impact or just freeze it. 
         # User requirement: "recalculates downward"
         report.escalation_level = max(0, report.escalation_level - 1)
         report.impact_score = calculate_impact(report)
    
    await db.commit()
    
    await manager.broadcast("status_changed", {
        "id": report.id,
        "old_status": old_status,
        "new_status": status,
        "impact_score": report.impact_score
    })
    
    return {"status": "updated", "new_status": status}

@router.post("/transcribe")
async def transcribe_proxy(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        files = {"file": (file.filename, audio_bytes, file.content_type)}
        
        # Derive base URL from the classify URL
        ai_classify_url = os.getenv("AI_SERVER_URL", "http://127.0.0.1:8003/api/classify")
        ai_base_url = ai_classify_url.replace("/api/classify", "")
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(f"{ai_base_url}/api/transcribe", files=files)
            response.raise_for_status()
            
            return response.json()
            
    except httpx.HTTPError as e:
        logger.error(f"STT Proxy Network Error: {e}")
        raise HTTPException(status_code=503, detail="Transcription AI service unavailable")
    except Exception as e:
        logger.error(f"STT Proxy Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during transcription")

# --- WebSocket ---
@app.websocket("/ws/admin")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text() # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)

app.include_router(router)