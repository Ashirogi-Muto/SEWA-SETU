from datetime import datetime
import enum
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, 
    DateTime, ForeignKey, Enum, Text, Index
)
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
from backend.database import Base

# ... (rest of imports)



    # Indexes for Geo-Performance
# --- Enums ---
class ReportStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    DEPARTMENT = "department_user"
    CITIZEN = "citizen"

# --- Models ---

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    password_hash = Column(String, nullable=True) # Optional for "Instant Auth"
    role = Column(Enum(UserRole), default=UserRole.CITIZEN)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    reports = relationship("Report", back_populates="user")
    department = relationship("Department", back_populates="users")


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, nullable=True)
    
    # Relationships
    users = relationship("User", back_populates="department")
    reports = relationship("Report", back_populates="department")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    
    # Core Data
    description = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    category = Column(String, default="Uncategorized")
    image_url = Column(String, nullable=True)
    
    # Status & Lifecycle
    status = Column(Enum(ReportStatus), default=ReportStatus.OPEN, index=True)
    is_active = Column(Boolean, default=True) # Soft Delete
    
    # Smart Features
    confidence = Column(Float, default=0.0)
    impact_score = Column(Float, default=0.0, index=True)
    escalation_level = Column(Integer, default=0)
    
    # Duplicate Logic
    duplicate_of = Column(Integer, ForeignKey("reports.id"), nullable=True, index=True)
    duplicate_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="reports")
    department = relationship("Department", back_populates="reports")
    
    # Self-referential relationship for duplicates
    duplicates = relationship("Report", 
        backref=backref("original_report", remote_side=[id]),
        uselist=True
    )

    # Indexes for Geo-Performance
    __table_args__ = (
        Index('idx_report_geo', 'latitude', 'longitude'),
    )
