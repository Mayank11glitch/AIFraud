from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime

from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship to scans
    scans = relationship("ScanRecord", back_populates="user")

class ScanRecord(Base):
    __tablename__ = "scan_records"

    id = Column(String, primary_key=True, index=True)
    timestamp = Column(String, index=True)  # Indexed for fast sorting
    type = Column(String, index=True)  # image, url, video, text
    risk_score = Column(Float)
    risk_level = Column(String, index=True)
    threat_categories = Column(String)  # We will store this as a JSON string for simplicity in SQLite
    raw_text_extracted = Column(String, nullable=True)
    behavioral_profile = Column(String, nullable=True) # Stored as JSON string
    source = Column(String, nullable=True) # E.g. 'WhatsApp', 'Email', etc.
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="scans")
    explanations = relationship("ScanExplanation", back_populates="scan_record", cascade="all, delete-orphan")

class ScanExplanation(Base):
    __tablename__ = "scan_explanations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    scan_id = Column(String, ForeignKey("scan_records.id"))
    feature = Column(String)
    description = Column(String)
    risk_contribution = Column(Float)

    # Relationship back to parent
    scan_record = relationship("ScanRecord", back_populates="explanations")
