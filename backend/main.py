from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from database import save_prediction, get_history, get_analytics_data
from model_utils import mock_predict, BLOOD_GROUPS, load_trained_model
import datetime
import uuid
import re

app = FastAPI(title="BioVision AI API")

@app.on_event("startup")
async def startup_event():
    load_trained_model()


# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "BioVision AI API is running"}

@app.post("/predict")
async def predict(
    fingerprint: UploadFile = File(None),
    eye: UploadFile = File(None),
    mode: str = Form("combined")
):
    print(f"DEBUG: Prediction request received. Mode: {mode}")
    try:
        if mode == "fingerprint" and not fingerprint:
            raise HTTPException(status_code=400, detail="Fingerprint image required for this mode")
        if mode == "eye" and not eye:
            raise HTTPException(status_code=400, detail="Eye image required for this mode")
        if mode == "combined" and (not fingerprint or not eye):
            raise HTTPException(status_code=400, detail="Both fingerprint and eye images required for combined mode")

        # Read image bytes
        f_bytes = await fingerprint.read() if fingerprint else None
        e_bytes = await eye.read() if eye else None
        
        if f_bytes: print(f"DEBUG: Fingerprint size: {len(f_bytes)} bytes")
        if e_bytes: print(f"DEBUG: Eye image size: {len(e_bytes)} bytes")

        # Run prediction
        f_name = fingerprint.filename if fingerprint else ""
        e_name = eye.filename if eye else ""
        
        # Cross-verification check
        warning = None
        f_match = re.search(r'^(\d+)', f_name)
        e_match = re.search(r'^(\d+)', e_name)
        
        if f_match and e_match:
            f_id = f_match.group(1)
            e_id = e_match.group(1)
            if f_id != e_id:
                print(f"SECURITY ALERT: Mismatched Subject IDs ({f_id} vs {e_id})")
                warning = f"Biometric Mismatch Detected: Fingerprint (Subject {f_id}) vs Iris (Subject {e_id}). Result may be unreliable."

        result = mock_predict(f_bytes, e_bytes, mode, f_name, e_name)
        print(f"DEBUG: Prediction result: {result['predicted_class']} with confidence {result['confidence']:.2f}")
        
        # Add metadata
        prediction_entry = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.datetime.now().isoformat(),
            "mode": mode,
            "warning": warning,
            **result
        }
        
        # Save to MongoDB
        await save_prediction(prediction_entry)
        
        return prediction_entry
    except Exception as e:
        print(f"ERROR during prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history")
async def history_endpoint():
    data = await get_history()
    return data

@app.get("/analytics")
async def analytics_endpoint():
    data = await get_analytics_data()
    if not data:
        return {
            "total_predictions": 0,
            "avg_confidence": 0,
            "group_distribution": {g: 0 for g in BLOOD_GROUPS}
        }
    
    # Ensure all groups are present in distribution
    for g in BLOOD_GROUPS:
        if g not in data["group_distribution"]:
            data["group_distribution"][g] = 0
            
    return data

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
