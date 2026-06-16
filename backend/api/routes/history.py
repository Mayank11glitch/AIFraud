from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
import models.db_models as db_models
import json
from typing import Optional
from api.routes.auth import get_current_user

router = APIRouter(prefix="/history", tags=["History"])

@router.get("")
async def get_scan_history(
    limit: int = 50, 
    scope: str = Query("global", description="Scope of history: 'global' or 'my'"),
    db: Session = Depends(get_db),
    current_user: Optional[db_models.User] = Depends(get_current_user)
):
    """Retrieve the most recent scan records from the database."""
    query = db.query(db_models.ScanRecord)
    
    if scope == "my":
        if not current_user:
            return [] # Or raise 401
        query = query.filter(db_models.ScanRecord.user_id == current_user.id)
        
    records = query.order_by(db_models.ScanRecord.timestamp.desc()).limit(limit).all()
    
    results = []
    for record in records:
        results.append({
            "id": record.id,
            "timestamp": str(record.timestamp),
            "type": record.type,
            "risk_score": record.risk_score,
            "risk_level": record.risk_level,
            "threat_categories": json.loads(record.threat_categories) if record.threat_categories else [],
            "raw_text_extracted": record.raw_text_extracted,
            "behavioral_profile": json.loads(record.behavioral_profile) if getattr(record, "behavioral_profile", None) else None,
            "source": getattr(record, "source", None),
            "user_id": getattr(record, "user_id", None),
            "explanations": [
                {
                    "feature": exp.feature,
                    "description": exp.description,
                    "risk_contribution": exp.risk_contribution
                }
                for exp in record.explanations
            ]
        })
    
    return results
