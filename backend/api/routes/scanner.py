from fastapi import APIRouter, File, UploadFile, Form, Depends
from models.schemas import ScanningResult
from services.scam_detection import process_image, process_video, process_url, process_text

from sqlalchemy.orm import Session
from database import get_db
import models.db_models as db_models
import json
import asyncio
from api.ws_manager import manager

router = APIRouter(prefix="/scan", tags=["Scanner"])

def save_scan_to_db(db: Session, result: ScanningResult):
    """Persist a ScanningResult into the SQLite database."""
    db_record = db_models.ScanRecord(
        id=result.id,
        timestamp=result.timestamp,
        type=result.type,
        risk_score=result.risk_score,
        risk_level=result.risk_level,
        threat_categories=json.dumps(result.threat_categories),
        raw_text_extracted=result.raw_text_extracted,
        behavioral_profile=json.dumps(result.behavioral_profile) if result.behavioral_profile else None
    )
    
    for exp in result.explanations:
        db_exp = db_models.ScanExplanation(
            scan_id=result.id,
            feature=exp.feature,
            description=exp.description,
            risk_contribution=exp.risk_contribution
        )
        db_record.explanations.append(db_exp)
        
    db.add(db_record)
    db.commit()

@router.post("/image", response_model=ScanningResult)
async def scan_image(file: UploadFile = File(...), ephemeral: str = Form("false"), db: Session = Depends(get_db)):
    contents = await file.read()
    result = process_image(contents)
    if ephemeral.lower() != "true":
        save_scan_to_db(db, result)
    broadcast_scan_result(result)
    return result

@router.post("/video", response_model=ScanningResult)
async def scan_video(file: UploadFile = File(...), ephemeral: str = Form("false"), db: Session = Depends(get_db)):
    contents = await file.read()
    result = process_video(contents)
    if ephemeral.lower() != "true":
        save_scan_to_db(db, result)
    broadcast_scan_result(result)
    return result

@router.post("/url", response_model=ScanningResult)
async def scan_url(url: str = Form(...), ephemeral: str = Form("false"), db: Session = Depends(get_db)):
    result = process_url(url)
    if ephemeral.lower() != "true":
        save_scan_to_db(db, result)
    broadcast_scan_result(result)
    return result

@router.post("/text", response_model=ScanningResult)
async def scan_text(text: str = Form(...), ephemeral: str = Form("false"), db: Session = Depends(get_db)):
    result = process_text(text)
    if ephemeral.lower() != "true":
        save_scan_to_db(db, result)
    broadcast_scan_result(result)
    return result

def broadcast_scan_result(result: ScanningResult):
    minimal_payload = {
        "id": result.id,
        "type": result.type,
        "risk_score": result.risk_score,
        "risk_level": result.risk_level,
        "threat_categories": result.threat_categories,
        "timestamp": result.timestamp
    }
    asyncio.create_task(manager.broadcast(minimal_payload))
