from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models.db_models as db_models
import json

router = APIRouter(prefix="/history", tags=["History"])

@router.get("")
async def get_scan_history(limit: int = 50, db: Session = Depends(get_db)):
    """Retrieve the most recent scan records from the database."""
    records = db.query(db_models.ScanRecord).order_by(
        db_models.ScanRecord.timestamp.desc()
    ).limit(limit).all()
    
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
