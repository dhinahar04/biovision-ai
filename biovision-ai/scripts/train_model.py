import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from PIL import Image
from sklearn.model_selection import train_test_split
import re

# Paths to datasets (adjust based on actual location)
SOCOFING_PATH = "/Users/dhina/Desktop/sample/SOCOFing/Real"
IRIS_PATH = "/Users/dhina/Desktop/sample/archive-2/CASIA-Iris-Thousand"

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

def load_data():
    print("Scanning datasets...")
    fingerprints = []
    eyes = []
    labels = []
    
    # Subject ID to Blood Group Mapping (Deterministic for demo)
    def get_blood_group_idx(subject_id):
        import hashlib
        return int(hashlib.md5(str(subject_id).encode()).hexdigest(), 16) % 8

    # Collect all available Subject IDs from SOCOFing
    subject_files = {}
    for f in os.listdir(SOCOFING_PATH):
        if f.endswith('.BMP'):
            match = re.search(r'^(\d+)', f)
            if match:
                sid = match.group(1)
                if sid not in subject_files: subject_files[sid] = {'f': [], 'e': []}
                subject_files[sid]['f'].append(os.path.join(SOCOFING_PATH, f))

    # Collect corresponding Iris scans
    for root, dirs, files in os.walk(IRIS_PATH):
        for f in files:
            if f.endswith('.jpg') or f.endswith('.BMP'):
                # Try to extract from filename S5xxx or from directory name
                match = re.search(r'S5(\d+)', f)
                sid = None
                if match:
                    sid = str(int(match.group(1))) # Convert to int to remove leading zeros, then back to string
                else:
                    # Fallback to directory name check
                    path_parts = root.split(os.sep)
                    for part in path_parts:
                        if part.isdigit() and len(part) <= 4:
                            sid = str(int(part))
                            break
                
                if sid and sid in subject_files:
                    subject_files[sid]['e'].append(os.path.join(root, f))

    print(f"Found {len(subject_files)} unique subjects.")
    
    # Create pairs
    X_f = []
    X_e = []
    Y = []
    
    for sid, data in subject_files.items():
        if data['f'] and data['e']:
            # For simplicity in this demo, take the first available pair
            f_path = data['f'][0]
            e_path = data['e'][0]
            
            try:
                # Preprocess Fingerprint
                img_f = Image.open(f_path).convert('RGB').resize((224, 224))
                X_f.append(np.array(img_f) / 255.0)
                
                # Preprocess Eye
                img_e = Image.open(e_path).convert('RGB').resize((224, 224))
                X_e.append(np.array(img_e) / 255.0)
                
                # Label
                Y.append(get_blood_group_idx(sid))
                
                if len(X_f) >= 200: break # Limit for initial training speed
            except Exception as e:
                print(f"Error loading Subject {sid}: {e}")

    X_f = np.array(X_f)
    X_e = np.array(X_e)
    Y = tf.keras.utils.to_categorical(np.array(Y), num_classes=8)
    
    print(f"Prepared {len(X_f)} samples for training.")
    return train_test_split(X_f, X_e, Y, test_size=0.2)

def build_model():
    # Fingerprint Branch
    f_input = layers.Input(shape=(224, 224, 3))
    f = layers.Conv2D(32, 3, activation='relu')(f_input)
    f = layers.MaxPooling2D()(f)
    f = layers.Flatten()(f)
    
    # Iris Branch
    i_input = layers.Input(shape=(224, 224, 3))
    i = layers.Conv2D(32, 3, activation='relu')(i_input)
    i = layers.MaxPooling2D()(i)
    i = layers.Flatten()(i)
    
    # Merge
    merged = layers.concatenate([f, i])
    merged = layers.Dense(64, activation='relu')(merged)
    output = layers.Dense(8, activation='softmax')(merged)
    
    model = models.Model(inputs=[f_input, i_input], outputs=output)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model

if __name__ == "__main__":
    X_f_train, X_f_test, X_i_train, X_i_test, y_train, y_test = load_data()
    model = build_model()
    
    print("Starting training...")
    model.fit([X_f_train, X_i_train], y_train, epochs=5, batch_size=8, validation_split=0.1)
    
    # Create models directory if it doesn't exist
    os.makedirs("../models", exist_ok=True)
    
    # Save the model
    model_path = "../models/biovision_model.h5"
    model.save(model_path)
    print(f"Model saved successfully to {model_path}")
    
    # Final evaluation
    loss, acc = model.evaluate([X_f_test, X_i_test], y_test)
    print(f"Test Accuracy: {acc:.4f}")

