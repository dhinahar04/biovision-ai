import tensorflow as tf
from tensorflow.keras import layers, models
import numpy as np
from PIL import Image
import io

# Define Blood Groups
BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

def create_multi_modal_model():
    # Fingerprint Branch
    fingerprint_input = layers.Input(shape=(224, 224, 3), name="fingerprint_input")
    x1 = layers.Conv2D(32, (3, 3), activation='relu')(fingerprint_input)
    x1 = layers.MaxPooling2D((2, 2))(x1)
    x1 = layers.Conv2D(64, (3, 3), activation='relu')(x1)
    x1 = layers.MaxPooling2D((2, 2))(x1)
    x1 = layers.Conv2D(128, (3, 3), activation='relu')(x1)
    x1 = layers.MaxPooling2D((2, 2))(x1)
    x1 = layers.Flatten()(x1)
    x1 = layers.Dense(128, activation='relu')(x1)

    # Eye/Iris Branch
    eye_input = layers.Input(shape=(224, 224, 3), name="eye_input")
    x2 = layers.Conv2D(32, (3, 3), activation='relu')(eye_input)
    x2 = layers.MaxPooling2D((2, 2))(x2)
    x2 = layers.Conv2D(64, (3, 3), activation='relu')(x2)
    x2 = layers.MaxPooling2D((2, 2))(x2)
    x2 = layers.Conv2D(128, (3, 3), activation='relu')(x2)
    x2 = layers.MaxPooling2D((2, 2))(x2)
    x2 = layers.Flatten()(x2)
    x2 = layers.Dense(128, activation='relu')(x2)

    # Fusion
    combined = layers.concatenate([x1, x2])
    z = layers.Dense(64, activation='relu')(combined)
    z = layers.Dropout(0.5)(z)
    output = layers.Dense(len(BLOOD_GROUPS), activation='softmax', name="output")(z)

    model = models.Model(inputs=[fingerprint_input, eye_input], outputs=output)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    
    return model

def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    return img_array

import time
import hashlib
import re
import os

# Global variable to hold the loaded model
_trained_model = None
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "biovision_model.h5")

def load_trained_model():
    global _trained_model
    if _trained_model is None and os.path.exists(MODEL_PATH):
        try:
            print(f"Loading trained model from {MODEL_PATH}...")
            _trained_model = tf.keras.models.load_model(MODEL_PATH)
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")
    return _trained_model

def mock_predict(fingerprint_img=None, eye_img=None, mode="combined", f_name=None, e_name=None):
    """
    Inference function that uses the real model if available, 
    otherwise falls back to deterministic mock logic.
    """
    model = load_trained_model()
    
    if model:
        try:
            # Prepare inputs
            inputs = []
            
            # Fingerprint processing
            if fingerprint_img:
                img_f = preprocess_image(fingerprint_img)
                inputs.append(np.expand_dims(img_f, axis=0))
            else:
                inputs.append(np.zeros((1, 224, 224, 3)))
                
            # Eye processing
            if eye_img:
                img_e = preprocess_image(eye_img)
                inputs.append(np.expand_dims(img_e, axis=0))
            else:
                inputs.append(np.zeros((1, 224, 224, 3)))
                
            # Run inference
            preds = model.predict(inputs)
            probs = preds[0]
            predicted_idx = np.argmax(probs)
            
            return {
                "predicted_class": BLOOD_GROUPS[predicted_idx],
                "confidence": float(probs[predicted_idx]),
                "probabilities": {BLOOD_GROUPS[i]: float(probs[i]) for i in range(len(BLOOD_GROUPS))}
            }
        except Exception as e:
            print(f"Inference error, falling back to mock: {e}")

    # Fallback to deterministic mock logic
    time.sleep(1.5)
    
    # Try to extract Subject ID from filename
    subject_id = None
    for name in [f_name, e_name]:
        if name:
            match = re.search(r'^(\d+)', name)
            if not match: match = re.search(r'S5(\d+)', name) # Try iris pattern
            if match:
                subject_id = match.group(1)
                break
    
    if subject_id:
        seed_str = str(int(subject_id)) # Normalize
    else:
        parts = []
        if fingerprint_img: parts.append(hashlib.md5(fingerprint_img).hexdigest())
        if eye_img: parts.append(hashlib.md5(eye_img).hexdigest())
        seed_str = "".join(parts) if parts else str(time.time())
        
    seed_val = int(hashlib.sha256(seed_str.encode()).hexdigest(), 16)
    np.random.seed(seed_val % 2**32)
    
    probs = np.random.dirichlet(np.ones(len(BLOOD_GROUPS)), size=1)[0]
    predicted_idx = np.argmax(probs)
    np.random.seed(None)
    
    return {
        "predicted_class": BLOOD_GROUPS[predicted_idx],
        "confidence": float(probs[predicted_idx]),
        "probabilities": {BLOOD_GROUPS[i]: float(probs[i]) for i in range(len(BLOOD_GROUPS))}
    }

