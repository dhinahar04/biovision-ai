import os
import json
import uuid
import threading
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import Prediction, Feedback
from ..ai.train import train_model

router = APIRouter(prefix="/api", tags=["Admin"])

# Environment configurations
MODEL_DIR = os.getenv("MODEL_DIR", "models")
MODEL_PATH = os.getenv("MODEL_PATH", "models/blood_group_model.pth")
DATASET_DIR = os.getenv("DATASET_DIR", os.getenv("DATASET_PATH", "../dataset_blood_group"))
STATUS_FILE = os.path.join(MODEL_DIR, "training_status.json")

# Ensure models directory exists
os.makedirs(MODEL_DIR, exist_ok=True)

CLASSES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

# Thread lock for status updates
status_lock = threading.Lock()

def get_status() -> dict:
    """Helper to read the training status file, falling back to idle if not exists."""
    with status_lock:
        if os.path.exists(STATUS_FILE):
            try:
                with open(STATUS_FILE, "r") as f:
                    return json.load(f)
            except Exception:
                pass
        return {
            "status": "idle",
            "current_epoch": 0,
            "total_epochs": 0,
            "train_loss": 0.0,
            "train_acc": 0.0,
            "val_loss": 0.0,
            "val_acc": 0.0,
            "message": "Model training engine ready.",
            "history": []
        }

def save_status(status_data: dict):
    """Helper to save training status safely."""
    with status_lock:
        try:
            with open(STATUS_FILE, "w") as f:
                json.dump(status_data, f, indent=4)
        except Exception as e:
            print(f"Error saving training status: {e}")

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Total prediction scans count
    total_scans = db.query(Prediction).count()

    # 2. Mean confidence score
    avg_conf = db.query(func.avg(Prediction.confidence)).scalar() or 0.0
    avg_conf = round(float(avg_conf), 2)

    # 3. Feedback statistics
    total_feedback = db.query(Feedback).count()
    correct_feedback = db.query(Feedback).filter(Feedback.is_correct == True).count()
    
    feedback_accuracy = 100.0
    if total_feedback > 0:
        feedback_accuracy = round((correct_feedback / total_feedback) * 100.0, 2)

    # 4. Model trained check
    model_trained = os.path.exists(MODEL_PATH)

    # 5. Blood group class distribution from prediction database logs
    class_dist = {cls: 0 for cls in CLASSES}
    db_dist = db.query(Prediction.predicted_blood_group, func.count(Prediction.id))\
                .group_by(Prediction.predicted_blood_group).all()
    for bg, count in db_dist:
        if bg in class_dist:
            class_dist[bg] = count

    # 6. Pattern type distribution from prediction database logs
    pattern_dist = {"Loop": 0, "Whorl": 0, "Arch": 0}
    db_patterns = db.query(Prediction.pattern_type, func.count(Prediction.id))\
                    .group_by(Prediction.pattern_type).all()
    for pat, count in db_patterns:
        if pat in pattern_dist:
            pattern_dist[pat] = count
        elif pat is not None:
            # Handle standardizing
            pat_clean = pat.strip().capitalize()
            if pat_clean in pattern_dist:
                pattern_dist[pat_clean] += count

    # 7. Local training dataset statistics from dataset folders
    dataset_stats = {cls: 0 for cls in CLASSES}
    total_dataset_samples = 0
    
    # Check absolute / relative paths for dataset_blood_group
    abs_dataset_dir = os.path.abspath(DATASET_DIR)
    if os.path.isdir(abs_dataset_dir):
        for cls in CLASSES:
            cls_dir = os.path.join(abs_dataset_dir, cls)
            if os.path.isdir(cls_dir):
                count = len([f for f in os.listdir(cls_dir) if f.lower().endswith((".png", ".jpg", ".jpeg", ".bmp"))])
                dataset_stats[cls] = count
                total_dataset_samples += count

    return {
        "model_trained": model_trained,
        "total_scans": total_scans,
        "feedback_accuracy": feedback_accuracy,
        "total_feedback": total_feedback,
        "average_confidence": avg_conf,
        "total_dataset_samples": total_dataset_samples,
        "class_distribution": class_dist,
        "pattern_distribution": pattern_dist,
        "dataset_statistics": dataset_stats
    }

@router.get("/train/status")
def get_training_status():
    return get_status()

def background_train_task(dataset_path: str, output_model_dir: str):
    """Executes PyTorch model training and updates the status file dynamically."""
    current_status = {
        "status": "training",
        "current_epoch": 0,
        "total_epochs": 5,
        "train_loss": 0.0,
        "train_acc": 0.0,
        "val_loss": 0.0,
        "val_acc": 0.0,
        "message": "Initializing PyTorch training pipeline...",
        "history": []
    }
    save_status(current_status)

    def progress_callback(epoch, total_epochs, train_loss, train_acc, val_loss, val_acc):
        epoch_log = {
            "epoch": epoch,
            "train_loss": round(train_loss, 4),
            "train_acc": round(train_acc, 2),
            "val_loss": round(val_loss, 4),
            "val_acc": round(val_acc, 2)
        }
        
        current_status["current_epoch"] = epoch
        current_status["total_epochs"] = total_epochs
        current_status["train_loss"] = round(train_loss, 4)
        current_status["train_acc"] = round(train_acc, 2)
        current_status["val_loss"] = round(val_loss, 4)
        current_status["val_acc"] = round(val_acc, 2)
        current_status["message"] = f"Epoch {epoch}/{total_epochs} completed. Train Acc: {train_acc:.2f}%, Val Acc: {val_acc:.2f}%"
        current_status["history"].append(epoch_log)
        
        save_status(current_status)

    try:
        train_model(
            dataset_path=dataset_path,
            output_model_dir=output_model_dir,
            epochs=5,
            progress_callback=progress_callback
        )
        
        current_status["status"] = "completed"
        current_status["message"] = "Fine-tuning completed successfully! Activated new model weights."
        save_status(current_status)
    except Exception as e:
        current_status["status"] = "failed"
        current_status["message"] = f"Training aborted: {str(e)}"
        save_status(current_status)

@router.post("/train")
def trigger_model_training(background_tasks: BackgroundTasks):
    current_status = get_status()
    if current_status["status"] == "training":
        raise HTTPException(status_code=400, detail="Training is already in progress.")

    abs_dataset_dir = os.path.abspath(DATASET_DIR)
    
    # Verify we have images to train
    has_images = False
    if os.path.isdir(abs_dataset_dir):
        for cls in CLASSES:
            cls_dir = os.path.join(abs_dataset_dir, cls)
            if os.path.isdir(cls_dir):
                files = [f for f in os.listdir(cls_dir) if f.lower().endswith((".png", ".jpg", ".jpeg", ".bmp"))]
                if files:
                    has_images = True
                    break
                    
    if not has_images:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot start training. No valid images found in dataset class folders at {abs_dataset_dir}"
        )

    # Launch non-blocking background task
    background_tasks.add_task(background_train_task, abs_dataset_dir, os.path.abspath(MODEL_DIR))
    
    return {"message": "Background training process initialized."}

@router.post("/dataset-upload")
async def dataset_upload(
    blood_group: str = Form(...),
    file: UploadFile = File(...)
):
    if blood_group not in CLASSES:
        raise HTTPException(status_code=400, detail=f"Invalid blood group target folder: {blood_group}")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are accepted for dataset expansion")

    abs_dataset_dir = os.path.abspath(DATASET_DIR)
    target_class_dir = os.path.join(abs_dataset_dir, blood_group)
    os.makedirs(target_class_dir, exist_ok=True)

    # Save file to dataset folder
    unique_id = uuid.uuid4().hex
    # Retain extension
    file_ext = os.path.splitext(file.filename)[1] or ".png"
    target_filename = f"sample_{unique_id}{file_ext}"
    target_filepath = os.path.join(target_class_dir, target_filename)

    try:
        content = await file.read()
        with open(target_filepath, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write image: {str(e)}")

    return {"message": f"Successfully added sample to class {blood_group}"}
