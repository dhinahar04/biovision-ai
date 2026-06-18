from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from .database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String, nullable=False)
    enhanced_path = Column(String, nullable=True)
    gradcam_path = Column(String, nullable=True)
    predicted_blood_group = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    probabilities = Column(JSON, nullable=True) # Dictionary mapping blood group to confidence
    pattern_type = Column(String, nullable=True) # Loop, Whorl, Arch
    quality_score = Column(Float, nullable=True) # Numerical score representing image quality
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to feedback
    feedbacks = relationship("Feedback", back_populates="prediction", cascade="all, delete-orphan")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id", ondelete="CASCADE"), nullable=False)
    actual_blood_group = Column(String, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to prediction
    prediction = relationship("Prediction", back_populates="feedbacks")
