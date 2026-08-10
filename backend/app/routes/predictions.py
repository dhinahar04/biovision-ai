import os
import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import cv2
import json

from ..database import get_db
from ..models import Prediction, Feedback, PredictionFinger
from ..ai.predict import predict_blood_group

router = APIRouter(prefix="/api", tags=["Predictions"])

# Get environmental configurations
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
MODEL_PATH = os.getenv("MODEL_PATH", "models/blood_group_model.pth")
CLASSES_PATH = os.getenv("CLASSES_PATH", "models/classes.json")

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_fingerprint(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    # Validate files count
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    for f in files:
        if not f.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"File {f.filename} is not an image")

    all_finger_results = []
    classes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

    # We will process each file
    for index, file in enumerate(files):
        file_bytes = await file.read()
        
        # Run prediction & OpenCV enhancements
        try:
            results = predict_blood_group(file_bytes, MODEL_PATH, CLASSES_PATH)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image processing failed for {file.filename}: {str(e)}")

        # Generate unique filenames
        unique_id = uuid.uuid4().hex
        orig_name = f"original_{unique_id}.png"
        enhanced_name = f"enhanced_{unique_id}.png"
        gradcam_name = f"gradcam_{unique_id}.png"

        orig_path = os.path.join(UPLOAD_DIR, orig_name)
        enhanced_path = os.path.join(UPLOAD_DIR, enhanced_name)
        gradcam_path = os.path.join(UPLOAD_DIR, gradcam_name)

        # Save original image to file system
        with open(orig_path, "wb") as f_out:
            f_out.write(file_bytes)

        # Save enhanced grayscale and Grad-CAM color overlay
        cv2.imwrite(enhanced_path, results["enhanced_image"])
        if results["gradcam_image"] is not None:
            cv2.imwrite(gradcam_path, results["gradcam_image"])
        else:
            cv2.imwrite(gradcam_path, results["enhanced_image"])

        all_finger_results.append({
            "image_path": orig_path,
            "enhanced_path": enhanced_path,
            "gradcam_path": gradcam_path,
            "predicted_blood_group": results["predicted_blood_group"],
            "confidence": results["confidence"],
            "probabilities": results["probabilities"],
            "pattern_type": results["pattern_type"],
            "quality_score": results["quality_score"],
            "simulation": results["simulation"]
        })

    # Aggregate predictions across all fingers
    # 1. Average probabilities
    avg_probabilities = {cls: 0.0 for cls in classes}
    for finger in all_finger_results:
        probs = finger["probabilities"]
        for cls in classes:
            avg_probabilities[cls] += probs.get(cls, 0.0)

    for cls in classes:
        avg_probabilities[cls] = round(avg_probabilities[cls] / len(all_finger_results), 2)

    # 2. Determine final prediction based on highest average probability
    predicted_blood_group = max(avg_probabilities, key=avg_probabilities.get)
    confidence = avg_probabilities[predicted_blood_group]

    # 3. Average quality score
    avg_quality = round(sum(f["quality_score"] for f in all_finger_results) / len(all_finger_results), 2)

    # 4. Pattern types (e.g. show combined patterns or majority)
    pattern_types = [f["pattern_type"] for f in all_finger_results if f["pattern_type"]]
    if pattern_types:
        unique_patterns = list(set(pattern_types))
        pattern_type = " & ".join(unique_patterns) if len(unique_patterns) > 1 else unique_patterns[0]
    else:
        pattern_type = "Unknown"

    # Use first finger's paths for back-compatibility
    first_finger = all_finger_results[0]
    simulation_active = any(f["simulation"] for f in all_finger_results)

    # Create parent Prediction Database record
    prediction = Prediction(
        image_path=first_finger["image_path"],
        enhanced_path=first_finger["enhanced_path"],
        gradcam_path=first_finger["gradcam_path"],
        predicted_blood_group=predicted_blood_group,
        confidence=confidence,
        probabilities=avg_probabilities,
        pattern_type=pattern_type,
        quality_score=avg_quality
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    # Create child PredictionFinger records
    for f_res in all_finger_results:
        finger_rec = PredictionFinger(
            prediction_id=prediction.id,
            image_path=f_res["image_path"],
            enhanced_path=f_res["enhanced_path"],
            gradcam_path=f_res["gradcam_path"],
            predicted_blood_group=f_res["predicted_blood_group"],
            confidence=f_res["confidence"],
            probabilities=f_res["probabilities"],
            pattern_type=f_res["pattern_type"],
            quality_score=f_res["quality_score"]
        )
        db.add(finger_rec)
    
    db.commit()
    db.refresh(prediction)

    return {
        "id": prediction.id,
        "predicted_blood_group": prediction.predicted_blood_group,
        "confidence": prediction.confidence,
        "probabilities": prediction.probabilities,
        "pattern_type": prediction.pattern_type,
        "quality_score": prediction.quality_score,
        "original_url": f"/api/static/{os.path.basename(prediction.image_path)}",
        "enhanced_url": f"/api/static/{os.path.basename(prediction.enhanced_path)}",
        "gradcam_url": f"/api/static/{os.path.basename(prediction.gradcam_path)}",
        "created_at": prediction.created_at.isoformat(),
        "simulation": simulation_active
    }

@router.get("/history")
def get_prediction_history(db: Session = Depends(get_db), limit: int = 50):
    predictions = db.query(Prediction).order_by(Prediction.created_at.desc()).limit(limit).all()
    
    history_list = []
    for p in predictions:
        # Check if feedback has been submitted
        feedback = db.query(Feedback).filter(Feedback.prediction_id == p.id).first()
        actual = feedback.actual_blood_group if feedback else None
        
        history_list.append({
            "id": p.id,
            "predicted_blood_group": p.predicted_blood_group,
            "confidence": p.confidence,
            "pattern_type": p.pattern_type,
            "quality_score": p.quality_score,
            "original_url": f"/api/static/{os.path.basename(p.image_path)}",
            "enhanced_url": f"/api/static/{os.path.basename(p.enhanced_path)}",
            "gradcam_url": f"/api/static/{os.path.basename(p.gradcam_path)}",
            "actual_blood_group": actual,
            "created_at": p.created_at.isoformat()
        })
        
    return history_list

@router.get("/prediction/{prediction_id}")
def get_prediction_detail(prediction_id: int, db: Session = Depends(get_db)):
    p = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Prediction not found")
        
    feedback = db.query(Feedback).filter(Feedback.prediction_id == p.id).first()
    actual = feedback.actual_blood_group if feedback else None
    
    return {
        "id": p.id,
        "predicted_blood_group": p.predicted_blood_group,
        "confidence": p.confidence,
        "probabilities": p.probabilities,
        "pattern_type": p.pattern_type,
        "quality_score": p.quality_score,
        "original_url": f"/api/static/{os.path.basename(p.image_path)}",
        "enhanced_url": f"/api/static/{os.path.basename(p.enhanced_path)}",
        "gradcam_url": f"/api/static/{os.path.basename(p.gradcam_path)}",
        "actual_blood_group": actual,
        "created_at": p.created_at.isoformat(),
        "fingers": [
            {
                "id": f.id,
                "predicted_blood_group": f.predicted_blood_group,
                "confidence": f.confidence,
                "probabilities": f.probabilities,
                "pattern_type": f.pattern_type,
                "quality_score": f.quality_score,
                "original_url": f"/api/static/{os.path.basename(f.image_path)}" if f.image_path else None,
                "enhanced_url": f"/api/static/{os.path.basename(f.enhanced_path)}" if f.enhanced_path else None,
                "gradcam_url": f"/api/static/{os.path.basename(f.gradcam_path)}" if f.gradcam_path else None,
            }
            for f in p.fingers
        ]
    }

@router.post("/feedback")
def submit_feedback(
    prediction_id: int = Form(...),
    actual_blood_group: str = Form(...),
    db: Session = Depends(get_db)
):
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction record not found")

    is_correct = (prediction.predicted_blood_group == actual_blood_group)

    # Check if feedback already exists for this prediction
    existing_feedback = db.query(Feedback).filter(Feedback.prediction_id == prediction_id).first()
    if existing_feedback:
        existing_feedback.actual_blood_group = actual_blood_group
        existing_feedback.is_correct = is_correct
        existing_feedback.created_at = datetime.utcnow()
        feedback = existing_feedback
    else:
        feedback = Feedback(
            prediction_id=prediction_id,
            actual_blood_group=actual_blood_group,
            is_correct=is_correct
        )
        db.add(feedback)
        
    db.commit()
    db.refresh(feedback)
    
    return {
        "id": feedback.id,
        "prediction_id": feedback.prediction_id,
        "actual_blood_group": feedback.actual_blood_group,
        "is_correct": feedback.is_correct
    }

@router.get("/report/{prediction_id}")
def generate_pdf_report(prediction_id: int, db: Session = Depends(get_db)):
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")

    # Generate PDF in a temporary local path inside upload directory
    pdf_filename = f"report_{prediction_id}.pdf"
    pdf_path = os.path.join(UPLOAD_DIR, pdf_filename)
    
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        
        doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        story = []
        styles = getSampleStyleSheet()
        
        # Define Custom Styles for Dark/Clean Medical Theme
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#0E7490'), # Neon Cyan Shade
            spaceAfter=15
        )
        subtitle_style = ParagraphStyle(
            'DocSub',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#64748B'),
            spaceAfter=20
        )
        section_style = ParagraphStyle(
            'DocSection',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=10,
            spaceAfter=10
        )
        text_style = ParagraphStyle(
            'DocText',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#334155'),
            leading=14
        )
        disclaimer_style = ParagraphStyle(
            'DocDisclaimer',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#991B1B'), # Dark red
            leading=12
        )

        # 1. Header
        story.append(Paragraph("BioVision AI - Diagnostic Estimation Report", title_style))
        story.append(Paragraph(f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Report ID: BV-{prediction_id}", subtitle_style))
        story.append(Spacer(1, 10))

        # 2. Key Metrics Table
        data = [
            [Paragraph("<b>Metric</b>", text_style), Paragraph("<b>Value</b>", text_style), Paragraph("<b>Clinical Interpretation</b>", text_style)],
            [Paragraph("Estimated Blood Group", text_style), Paragraph(f"<b>{prediction.predicted_blood_group}</b>", text_style), Paragraph(f"Prediction model output with {prediction.confidence}% confidence.", text_style)],
            [Paragraph("Ridge Pattern Classification", text_style), Paragraph(prediction.pattern_type or "Unknown", text_style), Paragraph("Identified topological fingerprint pattern structure.", text_style)],
            [Paragraph("Image Quality Score", text_style), Paragraph(f"{prediction.quality_score}/100", text_style), Paragraph(f"Fingerprint quality assessment based on ridge definition.", text_style)]
        ]
        
        t = Table(data, colWidths=[150, 100, 280])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(t)
        story.append(Spacer(1, 20))

        # 3. Visualizations Section
        story.append(Paragraph("Fingerprint Visualizations", section_style))
        story.append(Spacer(1, 5))
        
        # Prepare images for ReportLab
        # We need to scale them appropriately so they fit nicely
        img_w = 160
        img_h = 160
        
        orig_img_flow = RLImage(prediction.image_path, width=img_w, height=img_h)
        enhanced_img_flow = RLImage(prediction.enhanced_path, width=img_w, height=img_h)
        gradcam_img_flow = RLImage(prediction.gradcam_path, width=img_w, height=img_h)
        
        img_table_data = [
            [orig_img_flow, enhanced_img_flow, gradcam_img_flow],
            [
                Paragraph("<font color='#64748B'><b>Original Upload</b></font>", text_style),
                Paragraph("<font color='#64748B'><b>OpenCV Enhanced</b></font>", text_style),
                Paragraph("<font color='#64748B'><b>Grad-CAM Explainability</b></font>", text_style)
            ]
        ]
        
        img_table = Table(img_table_data, colWidths=[180, 180, 180])
        img_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('PADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(img_table)
        story.append(Spacer(1, 25))

        # 4. Detailed Probabilities Section
        story.append(Paragraph("Prediction Distribution Detail", section_style))
        story.append(Spacer(1, 5))
        
        prob_data = [[Paragraph("<b>Blood Group</b>", text_style), Paragraph("<b>Probability Confidence</b>", text_style)]]
        
        if prediction.probabilities:
            try:
                probs = prediction.probabilities
                if isinstance(probs, str):
                    probs = json.loads(probs)
                
                # Sort descending
                sorted_probs = sorted(probs.items(), key=lambda item: item[1], reverse=True)
                for bg, p_val in sorted_probs:
                    prob_data.append([Paragraph(bg, text_style), Paragraph(f"{p_val}%", text_style)])
            except Exception:
                prob_data.append([Paragraph(prediction.predicted_blood_group, text_style), Paragraph(f"{prediction.confidence}%", text_style)])
        
        prob_table = Table(prob_data, colWidths=[150, 380])
        prob_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F8FAFC')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(prob_table)
        story.append(Spacer(1, 25))

        # 5. Medical Disclaimer Section
        story.append(Paragraph("<b>IMPORTANT MEDICAL DISCLAIMER</b>", ParagraphStyle('RedHeading', parent=section_style, textColor=colors.HexColor('#991B1B'))))
        story.append(Spacer(1, 5))
        disclaimer_text = (
            "This document presents estimation results from the BioVision AI research model. "
            "BioVision AI is not an approved medical device. It should never be used as a replacement for "
            "clinical lab testing, professional medical diagnosis, or standard medical blood grouping procedures. "
            "Any decision regarding clinical treatments or blood transfusions must be based exclusively on "
            "official medical tests validated by certified clinical professionals."
        )
        story.append(Paragraph(disclaimer_text, disclaimer_style))
        
        # Build Document
        doc.build(story)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compile PDF report: {str(e)}")

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"BioVision_AI_Report_{prediction_id}.pdf"
    )
