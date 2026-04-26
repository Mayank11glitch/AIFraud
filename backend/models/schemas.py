from pydantic import BaseModel
from typing import List, Optional

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
