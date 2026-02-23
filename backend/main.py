import os
import io
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, WebSocket, WebSocketDisconnect, APIRouter, Request
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, func, case

import httpx
import aiofiles
from contextlib import asynccontextmanager
from PIL import Image as PILImage
import imagehash as ihash

# --- Local Imports ---
from backend.database import get_db
from backend.models import Report, User, Department, ReportStatus, Alert, AlertType
from backend.ai_service import classify_report_local
from backend.ws_manager import manager
from backend.services.duplicate_detector import find_duplicate
from backend.services.impact import calculate_impact
from backend.services.escalation_service import start_scheduler
from backend.logging_config import get_logger
logger = get_logger("main", "main")
from backend.auth_service import verify_password, get_password_hash, create_access_token

# --- Pydantic Models ---
from backend.schemas import (
    LoginRequest, RegisterRequest, Token,
    AnalyticsResponse, DepartmentCreate, DepartmentResponse
)

# --- App Setup ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    start_scheduler()
    logger.info("🚀 SewaSetu Backend Started (Local Mode)")
    yield
    # Shutdown actions (if any)

app = FastAPI(title="SewaSetu Pro", version="4.0-Local", lifespan=lifespan)

# CORS
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files (Local Storage)
UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory="backend/uploads"), name="static")

# --- Routes ---
router = APIRouter(prefix="/api")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Decode JWT and return the authenticated User, or raise 401."""
    from backend.auth_service import decode_access_token
    email = decode_access_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


DEMO_AUTH_ENABLED = True

# --- Auth Routes ---
@router.post("/auth/login", response_model=Token)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == request.email)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if DEMO_AUTH_ENABLED:
        # Demo mode: auto-create user if not exists, skip password check
        if not user:
            role = "admin" if "admin" in request.email else "citizen"
            name = request.email.split("@")[0].capitalize()
            user = User(
                email=request.email,
                name=name,
                role=role,
                password_hash=get_password_hash(request.password)
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        # Handle existing legacy fake hashes
        elif user.password_hash == "hashed_secret":
            user.password_hash = get_password_hash(request.password)
            db.add(user)
            await db.commit()
    else:
        # Production mode: require existing user + correct password
        if not user or not verify_password(request.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email, "user_id": user.id, "role": user.role})

    return {
        "access_token": token,
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
        password_hash=get_password_hash(request.password),
        role="citizen"
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    token = create_access_token({"sub": new_user.email, "user_id": new_user.id, "role": new_user.role})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "role": new_user.role,
        "name": new_user.name
    }

@router.get("/users/me")
async def get_user_profile(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Count user reports
    stmt_total = select(func.count(Report.id)).where(Report.user_id == current_user.id)
    total_result = await db.execute(stmt_total)
    total_reports = total_result.scalar() or 0

    stmt_resolved = select(func.count(Report.id)).where(
        Report.user_id == current_user.id,
        Report.status == ReportStatus.RESOLVED
    )
    resolved_result = await db.execute(stmt_resolved)
    resolved_reports = resolved_result.scalar() or 0

    pending_reports = total_reports - resolved_reports

    rank = "Bronze"
    if current_user.karma > 200:
        rank = "Silver"
    if current_user.karma > 400:
        rank = "Gold"

    return {
        "id": current_user.id,
        "name": current_user.name or "Citizen",
        "email": current_user.email,
        "role": current_user.role,
        "location": "Dadri, Greater Noida", # Can be made dynamic later
        "karma": current_user.karma,
        "rank": rank,
        "stats": {
            "total_reports": total_reports,
            "resolved_reports": resolved_reports,
            "pending_reports": pending_reports
        }
    }

@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    db_status = "connected"
    try:
        await db.execute(select(1))
    except Exception:
        db_status = "unreachable"

    ai_status = "unknown"
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            ai_url = os.getenv("AI_SERVER_BASE_URL", "http://127.0.0.1:8003")
            r = await client.get(f"{ai_url}/health")
            ai_status = "connected" if r.status_code == 200 else "error"
    except Exception:
        ai_status = "unreachable"

    return {
        "status": "active",
        "database": db_status,
        "ai_server": ai_status,
        "demo_mode": os.getenv("DEMO_MODE", "false")
    }


# --- Department Routes ---
@router.get("/departments", response_model=List[DepartmentResponse])
async def get_departments(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
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
async def create_department(dept: DepartmentCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    stmt = select(Department).where(Department.name == dept.name)
    result = await db.execute(stmt)
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Department already exists")
    
    new_dept = Department(name=dept.name, email=dept.email)
    db.add(new_dept)
    await db.commit()
    await db.refresh(new_dept)
    return new_dept

# --- Dashboard & Analytics ---

@router.get("/dashboard")
async def get_dashboard_data(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
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
    
    # Avg Resolution Time (dynamically computed from resolved reports)
    stmt_avg = select(
        func.avg(
            func.extract('epoch', Report.updated_at) -
            func.extract('epoch', Report.created_at)
        )
    ).where(
        Report.status == ReportStatus.RESOLVED,
        Report.updated_at.isnot(None)
    )
    result_avg = await db.execute(stmt_avg)
    avg_seconds = result_avg.scalar()
    if avg_seconds and avg_seconds > 0:
        avg_resolution_time = f"{avg_seconds / 86400:.1f} days"
    else:
        avg_resolution_time = "N/A"

    # 2. Recent Reports
    stmt_recent = select(Report).order_by(desc(Report.created_at)).limit(5)
    result_recent = await db.execute(stmt_recent)
    recent_reports_list = result_recent.scalars().all()
    
    recent_reports_data = []
    for r in recent_reports_list:
        # Calculate relative time string simplistically
        time_diff = datetime.now(timezone.utc) - r.created_at.replace(tzinfo=timezone.utc)
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

    # 3. Department Distribution for Donut Chart (Group by Category)
    stmt_perf = select(
        Report.category, 
        func.count(Report.id).label("total")
    ).group_by(Report.category)
    
    result_perf = await db.execute(stmt_perf)
    perf_rows = result_perf.all()
    
    # We map categories to colors like the original donut chart
    # Default colors for known categories
    category_colors = {
        "Roads & Highways": "#3B82F6",
        "Sanitation": "#22C55E",
        "Water Supply": "#F97316",
        "Electricity": "#EAB308",
        "Public Safety": "#EF4444"
    }

    department_distribution = []
    
    chart_total = sum(row.total for row in perf_rows) if perf_rows else 1
    
    for row in perf_rows:
        cat_name = row.category or "Others"
        color = category_colors.get(cat_name, "#A855F7") 
        department_distribution.append({
            "name": cat_name,
            "value": int((row.total / chart_total) * 100),
            "color": color
        })
        
    # Make sure they add up to exactly 100 if there's any rounding diff
    if department_distribution:
        diff = 100 - sum(d["value"] for d in department_distribution)
        if diff != 0 and diff != 100:
            department_distribution[0]["value"] += diff

    return {
        "kpis": {
            "totalReports": total_reports,
            "reportsResolved": reports_resolved,
            "avgResolutionTime": avg_resolution_time,
            "activeDepartments": active_departments
        },
        "recentReports": recent_reports_data,
        "departmentDistribution": department_distribution
    }

@router.get("/escalations")
async def get_escalations(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
        
    stmt = select(Report).where(
        Report.status.in_([ReportStatus.OPEN, ReportStatus.IN_PROGRESS])
    ).order_by(desc(Report.created_at)).limit(10)
    
    result = await db.execute(stmt)
    escalations = result.scalars().all()
    
    data = []
    for r in escalations:
        time_diff = datetime.now(timezone.utc) - r.created_at.replace(tzinfo=timezone.utc)
        if time_diff.days > 0:
            time_str = f"{time_diff.days}h {time_diff.seconds // 3600}m"
        else:
            time_str = f"{time_diff.seconds // 3600}h {(time_diff.seconds % 3600) // 60}m"
            
        # Determine severity based on impact
        if r.impact_score >= 8.0:
            severity = "Critical"
        elif r.impact_score >= 5.0:
            severity = "High"
        else:
            severity = "Medium"
            
        data.append({
            "id": f"#GN-{r.id}",
            "department": r.category or "Others",
            "location": r.location_name or "Greater Noida",
            "severity": severity,
            "time_elapsed": time_str
        })
        
    return data

@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
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

@router.get("/alerts")
async def get_alerts(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch real alerts targeting the specific citizen or system-wide (user_id = None)
    stmt = select(Alert).where(
        (Alert.user_id == current_user.id) | (Alert.user_id == None)
    ).order_by(desc(Alert.created_at)).limit(20)
    
    result = await db.execute(stmt)
    db_alerts = result.scalars().all()
    
    frontend_alerts = []
    now = datetime.now(timezone.utc)
    
    for a in db_alerts:
        # Calculate human-readable 'time ago'
        created = a.created_at.replace(tzinfo=timezone.utc) if a.created_at.tzinfo is None else a.created_at
        diff = now - created
        
        if diff.days > 0:
            time_str = f"{diff.days} d ago"
        elif diff.seconds >= 3600:
            time_str = f"{diff.seconds // 3600} h ago"
        elif diff.seconds >= 60:
            time_str = f"{diff.seconds // 60} m ago"
        else:
            time_str = "Just now"
            
        frontend_alerts.append({
            "id": f"alert-{a.id}",
            "type": a.type.value,
            "title": a.title,
            "message": a.message,
            "time": time_str,
            "icon": a.icon
        })
        
    return frontend_alerts

@router.get("/reports/assigned")
async def get_assigned_reports(
    request: Request,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return open/in_progress reports sorted by impact_score (highest first) for task queues."""
    query = (
        select(Report)
        .where(Report.is_active == True)
        .where(Report.status.in_([ReportStatus.OPEN, ReportStatus.IN_PROGRESS]))
        .order_by(desc(Report.impact_score))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    reports = result.scalars().all()

    for r in reports:
        db.expunge(r)

    current_base = str(request.base_url).rstrip('/')
    for report in reports:
        if report.image_url and "http" in report.image_url:
            if "/static/uploads/" in report.image_url:
                filename = report.image_url.split("/static/uploads/")[-1]
                report.image_url = f"{current_base}/static/uploads/{filename}"

    return reports

@router.get("/reports/all")
async def get_all_reports(
    request: Request, # Added Request to get current host
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
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
    
    # Detach from session so url mutations don't flush to DB
    for r in reports:
        db.expunge(r)
    
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
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # 1. Handle Image Uploads
        saved_image_urls = []
        image_bytes = None
        image_bytes_hash = None
        
        for image in images:
            file_ext = image.filename.split('.')[-1]
            filename = f"{uuid.uuid4()}.{file_ext}"
            filepath = os.path.join(UPLOAD_DIR, filename)
            
            # Read bytes for duplicate check (first image only)
            content = await image.read()
            if not image_bytes:
                image_bytes = content

            # Compute perceptual hash for the first image
            if not image_bytes_hash and image_bytes:
                try:
                    pil_img = PILImage.open(io.BytesIO(image_bytes))
                    image_bytes_hash = str(ihash.average_hash(pil_img))
                except Exception as e:
                    logger.warning(f"Could not compute image hash: {e}")
                    image_bytes_hash = None
            
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
        
        if duplicate_of_report:
            logger.info(f"♻️  Duplicate Detected! Linked to ID: {duplicate_of_report.id}")

        # 3. AI Classification
        ai_result = await classify_report_local(description, saved_image_urls)
        
        # 4. Create Report Record
        new_report = Report(
            user_id=current_user.id,
            description=description,
            latitude=latitude,
            longitude=longitude,
            category=ai_result['category'],
            confidence=ai_result.get('confidence', 80.0),
            image_url=saved_image_urls[0] if saved_image_urls else None,
            image_hash=image_bytes_hash,
            status=ReportStatus.OPEN,
            duplicate_of=duplicate_of_report.id if duplicate_of_report else None
        )
        
        db.add(new_report)
        await db.flush() # Get ID
        
        # 5. Post-Processing (Impact & Notifications)
        if duplicate_of_report:
            # Update Parent count and impact
            duplicate_of_report.duplicate_count += 1
            duplicate_of_report.impact_score = calculate_impact(duplicate_of_report)
            db.add(duplicate_of_report)
            
            # Notify Admin of Update
            await manager.broadcast("duplicate_detected", {
                "original_id": duplicate_of_report.id,
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
        logger.exception(f"❌ Report Submission Failed: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports")
async def get_reports(request: Request, skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await get_all_reports(request=request, skip=skip, limit=limit, db=db, current_user=current_user)

@router.patch("/reports/{report_id}/status")
async def update_status(report_id: int, status: ReportStatus, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
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
         report.escalation_level = 0
         report.impact_score = calculate_impact(report)
    
    # Generate a real database Alert for the user who created it
    if report.user_id:
        new_alert = Alert(
            user_id=report.user_id,
            type=AlertType.UPDATES,
            title=f"Report #{report.id} Status Updated",
            message=f"Your {report.category.lower() if report.category else 'civic'} report in {report.location_name} was updated to {status.value.upper()}.",
            icon="refresh"
        )
        db.add(new_alert)

    await db.commit()
    
    await manager.broadcast("status_changed", {
        "id": report.id,
        "old_status": old_status,
        "new_status": status,
        "impact_score": report.impact_score
    })
    
    return {"status": "updated", "new_status": status}

@router.post("/transcribe")
async def transcribe_proxy(file: UploadFile = File(...), provider: str = None):
    try:
        audio_bytes = await file.read()
        files = {"file": (file.filename, audio_bytes, file.content_type)}
        
        # Derive base URL from the classify URL
        ai_base_url = os.getenv("AI_SERVER_BASE_URL", "http://127.0.0.1:8003")
        
        # Forward provider param if specified
        params = {}
        if provider:
            params["provider"] = provider
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(f"{ai_base_url}/api/transcribe", files=files, params=params)
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