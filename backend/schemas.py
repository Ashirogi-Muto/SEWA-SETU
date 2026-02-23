from pydantic import BaseModel
from typing import Optional


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


class DepartmentCreate(BaseModel):
    name: str
    email: Optional[str] = None


class DepartmentResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None

    class Config:
        from_attributes = True
