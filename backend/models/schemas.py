from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class FeatureExplanation(BaseModel):
    feature: str
    description: str
    risk_contribution: float

class ScanningResult(BaseModel):
    id: str
    timestamp: str
    type: str # 'url', 'image', 'video', 'text'
    risk_score: float
    risk_level: str # 'Low', 'Medium', 'High', 'Critical'
    threat_categories: List[str]
    explanations: List[FeatureExplanation]
    raw_text_extracted: Optional[str] = None
    behavioral_profile: Optional[dict] = None
    source: Optional[str] = None
    user_id: Optional[int] = None
