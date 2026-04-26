from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models.db_models as db_models
import json

router = APIRouter(prefix="/stats", tags=["Analytics"])

@router.get("")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Return aggregated analytics for the dashboard."""
    
    total_scans = db.query(func.count(db_models.ScanRecord.id)).scalar() or 0
    
    # Average risk score
    avg_risk = db.query(func.avg(db_models.ScanRecord.risk_score)).scalar() or 0
    avg_risk = round(float(avg_risk), 1)
    
    # Threats detected (scans with risk_level Critical or High)
    threats_detected = db.query(func.count(db_models.ScanRecord.id)).filter(
        db_models.ScanRecord.risk_level.in_(["Critical", "High"])
    ).scalar() or 0
    
    # Safe scans
    safe_scans = db.query(func.count(db_models.ScanRecord.id)).filter(
        db_models.ScanRecord.risk_level.in_(["Low"])
    ).scalar() or 0
    
    # Scans by type
    type_counts = db.query(
        db_models.ScanRecord.type,
        func.count(db_models.ScanRecord.id)
    ).group_by(db_models.ScanRecord.type).all()
    
    scans_by_type = [{"name": t[0].capitalize() if t[0] else "Unknown", "value": t[1]} for t in type_counts]
    
    # Risk distribution
    risk_counts = db.query(
        db_models.ScanRecord.risk_level,
        func.count(db_models.ScanRecord.id)
    ).group_by(db_models.ScanRecord.risk_level).all()
    
    risk_distribution = [{"name": r[0] if r[0] else "Unknown", "value": r[1]} for r in risk_counts]
    
    # Top threat categories (flatten all categories, count occurrences)
    all_records = db.query(db_models.ScanRecord.threat_categories).all()
    category_counts = {}
    for record in all_records:
        if record[0]:
            try:
                cats = json.loads(record[0])
                for cat in cats:
                    category_counts[cat] = category_counts.get(cat, 0) + 1
            except:
                pass
    
    top_threats = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    top_threats = [{"name": t[0], "value": t[1]} for t in top_threats]
    
    # Recent risk scores for trend line (last 20 scans)
    recent = db.query(
        db_models.ScanRecord.timestamp,
        db_models.ScanRecord.risk_score
    ).order_by(db_models.ScanRecord.timestamp.desc()).limit(20).all()
    
    risk_trend = [{"time": r[0], "score": r[1]} for r in reversed(recent)]
    
    return {
        "total_scans": total_scans,
        "threats_detected": threats_detected,
        "safe_scans": safe_scans,
        "avg_risk": avg_risk,
        "scans_by_type": scans_by_type,
        "risk_distribution": risk_distribution,
        "top_threats": top_threats,
        "risk_trend": risk_trend
    }
