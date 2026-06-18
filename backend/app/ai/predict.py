import os
import sys
import json
import random
import torch
import torch.nn as nn
import torchvision.models as models
from torchvision import transforms
from PIL import Image
import cv2
import numpy as np

# Adjust path to import preprocess
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from app.ai.preprocess import enhance_fingerprint, calculate_quality_score, classify_pattern_type

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")

def get_efficientnet_model(num_classes=8):
    """
    Builds EfficientNet-B0 model architecture matching the train script.
    """
    try:
        from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights
        model = efficientnet_b0(weights=None)
    except ImportError:
        model = models.efficientnet_b0(pretrained=False)
    
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, num_classes)
    return model

def generate_mock_gradcam(enhanced_gray: np.ndarray) -> np.ndarray:
    """
    Generates a realistic mock Grad-CAM JET heatmap overlay for simulation mode.
    Places a glowing Gaussian attention hotspot in the center of the print.
    """
    h, w = enhanced_gray.shape
    # Create a 2D Gaussian mask
    x = np.linspace(-1, 1, w)
    y = np.linspace(-1, 1, h)
    x, y = np.meshgrid(x, y)
    
    # Random offset to look organic
    ox, oy = random.uniform(-0.25, 0.25), random.uniform(-0.25, 0.25)
    sigma = random.uniform(0.35, 0.55)
    
    mask = np.exp(-(((x - ox)**2 + (y - oy)**2) / (2 * sigma**2)))
    mask = (mask - mask.min()) / (mask.max() - mask.min())
    mask = (mask * 255).astype(np.uint8)
    
    # Apply JET color map
    heatmap = cv2.applyColorMap(mask, cv2.COLORMAP_JET)
    
    # Convert enhanced grayscale to RGB
    enhanced_rgb = cv2.cvtColor(enhanced_gray, cv2.COLOR_GRAY2RGB)
    
    # Blend images
    overlay = cv2.addWeighted(enhanced_rgb, 0.5, heatmap, 0.5, 0)
    return overlay

def predict_blood_group(image_bytes: bytes, model_path: str, classes_path: str) -> dict:
    """
    Predicts blood group class from fingerprint image.
    Supports real inference if weights exist, otherwise falls back to simulator.
    """
    # 1. Preprocess using classical CV
    gray, enhanced_gray, binary_img = enhance_fingerprint(image_bytes)
    quality_score = calculate_quality_score(enhanced_gray, binary_img)
    pattern_type = classify_pattern_type(enhanced_gray)

    classes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    
    # Initialize variables for Grad-CAM & inference
    model_loaded = False
    simulation = True
    predicted_blood_group = "O+"
    confidence = 50.0
    probabilities = {cls: 12.5 for cls in classes}
    gradcam_image = None

    # Try loading model
    if os.path.exists(model_path):
        try:
            model = get_efficientnet_model(num_classes=8)
            model.load_state_dict(torch.load(model_path, map_location=device))
            model.to(device)
            model.eval()
            model_loaded = True
            simulation = False
        except Exception as e:
            print(f"Warning: Failed to load PyTorch model weights: {e}. Running in simulation mode.", file=sys.stderr)

    if model_loaded:
        try:
            # Prepare image tensor
            rgb_img = cv2.cvtColor(enhanced_gray, cv2.COLOR_GRAY2RGB)
            pil_img = Image.fromarray(rgb_img)
            
            val_transform = transforms.Compose([
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
            input_tensor = val_transform(pil_img).unsqueeze(0).to(device)

            # Grad-CAM variables
            feature_blobs = []
            gradients = []

            def hook_feature(module, input, output):
                feature_blobs.append(output.data.cpu().numpy())

            def hook_gradient(module, grad_input, grad_output):
                gradients.append(grad_output[0].data.cpu().numpy())

            # Register hook on the last conv layer of EfficientNet-B0
            # torchvision efficientnet_b0 structure:
            # model.features: Sequential
            # Last block in features is features[8] or features[-1], which is Conv2dNormActivation
            # Inside Conv2dNormActivation: 0 is Conv2d
            target_layer = model.features[-1][0]
            
            handle_forward = target_layer.register_forward_hook(hook_feature)
            handle_backward = target_layer.register_backward_hook(hook_gradient)

            # Forward pass
            outputs = model(input_tensor)
            probs_tensor = torch.softmax(outputs, dim=1)
            
            # Get predictions
            pred_idx = torch.argmax(probs_tensor, dim=1).item()
            
            # Backpropagation for Grad-CAM
            model.zero_grad()
            class_score = outputs[0, pred_idx]
            class_score.backward()

            # Remove hooks
            handle_forward.remove()
            handle_backward.remove()

            # Retrieve class mapping
            if os.path.exists(classes_path):
                with open(classes_path, "r") as f:
                    cls_mapping = json.load(f)
                    # Convert to list ordered by index
                    classes_list = [cls_mapping[str(i)] for i in range(8)]
            else:
                classes_list = classes

            predicted_blood_group = classes_list[pred_idx]
            
            # Format probabilities dict
            prob_vals = probs_tensor[0].detach().cpu().numpy()
            probabilities = {classes_list[i]: round(float(prob_vals[i] * 100.0), 2) for i in range(8)}
            confidence = probabilities[predicted_blood_group]

            # Generate Grad-CAM image
            if feature_blobs and gradients:
                feature_map = feature_blobs[0][0] # shape (C, H, W)
                grads = gradients[0][0] # shape (C, H, W)
                
                weights = np.mean(grads, axis=(1, 2)) # Global average pooling
                cam = np.zeros(feature_map.shape[1:], dtype=np.float32)
                
                for i, w_val in enumerate(weights):
                    cam += w_val * feature_map[i, :, :]
                
                cam = np.maximum(cam, 0) # ReLU
                if cam.max() > 0:
                    cam = (cam - cam.min()) / (cam.max() - cam.min())
                
                cam_resized = cv2.resize(cam, (224, 224))
                heatmap = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)
                
                # Blend with original grayscale resized image
                enhanced_rgb = cv2.cvtColor(enhanced_gray, cv2.COLOR_GRAY2RGB)
                gradcam_image = cv2.addWeighted(enhanced_rgb, 0.55, heatmap, 0.45, 0)
            else:
                gradcam_image = generate_mock_gradcam(enhanced_gray)

        except Exception as ex:
            print(f"Error executing actual inference: {ex}. Falling back to simulation.", file=sys.stderr)
            simulation = True

    if simulation:
        # Generate random predictions
        predicted_blood_group = random.choice(classes)
        
        # Generate random probabilities favoring the prediction
        remaining_pct = 100.0
        prob_list = []
        for _ in range(7):
            val = random.uniform(2.0, remaining_pct / 3.0)
            prob_list.append(round(val, 2))
            remaining_pct -= val
        
        pred_val = round(remaining_pct, 2)
        prob_list.append(pred_val)
        
        # Ensure prediction gets the highest probability
        prob_list.sort()
        pred_val = prob_list.pop() # largest value
        
        random.shuffle(prob_list)
        
        probabilities = {}
        idx = 0
        for cls in classes:
            if cls == predicted_blood_group:
                probabilities[cls] = pred_val
            else:
                probabilities[cls] = prob_list[idx]
                idx += 1
                
        confidence = pred_val
        gradcam_image = generate_mock_gradcam(enhanced_gray)

    return {
        "predicted_blood_group": predicted_blood_group,
        "confidence": confidence,
        "probabilities": probabilities,
        "pattern_type": pattern_type,
        "quality_score": quality_score,
        "enhanced_image": enhanced_gray,
        "gradcam_image": gradcam_image,
        "simulation": simulation
    }
