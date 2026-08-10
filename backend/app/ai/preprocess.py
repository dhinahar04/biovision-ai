import cv2
import numpy as np

def enhance_fingerprint(image_bytes: bytes):
    """
    Applies classical OpenCV enhancement pipeline to raw fingerprint image bytes:
    1. Grayscale conversion
    2. Bilateral filtering (denoising while preserving edges)
    3. CLAHE (Contrast Limited Adaptive Histogram Equalization)
    4. Adaptive thresholding (Otsu's method)
    5. Contour-based cropping
    6. Resize to 224x224
    """
    # Load image from bytes
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Invalid image file format")

    # 1. Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 2. Bilateral filtering for noise removal (preserves ridge boundaries)
    denoised = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)

    # 3. Apply CLAHE to enhance ridge contrast
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(denoised)

    # 4. Adaptive thresholding to isolate ridges (white ridges on black background for contour analysis)
    _, binary = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # 5. Crop fingerprint area by locating bounding box of largest contour
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        # Sort contours by area and pick the largest one
        largest_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest_contour)
        
        # Ensure crop isn't too small; fallback to original if tiny
        min_size = 30
        if w > min_size and h > min_size:
            cropped_enhanced = enhanced[y:y+h, x:x+w].copy()
            cropped_binary = binary[y:y+h, x:x+w]
            # Remove background: set background pixels (0 in binary) to 255 (white) in enhanced
            cropped_enhanced[cropped_binary == 0] = 255
        else:
            cropped_enhanced = enhanced.copy()
            cropped_enhanced[binary == 0] = 255
            cropped_binary = binary
    else:
        cropped_enhanced = enhanced.copy()
        cropped_enhanced[binary == 0] = 255
        cropped_binary = binary

    # 6. Resize to standard AI input dimensions (224x224)
    resized_enhanced = cv2.resize(cropped_enhanced, (224, 224), interpolation=cv2.INTER_AREA)
    resized_binary = cv2.resize(cropped_binary, (224, 224), interpolation=cv2.INTER_AREA)

    return gray, resized_enhanced, resized_binary

def calculate_quality_score(enhanced_img: np.ndarray, binary_img: np.ndarray) -> float:
    """
    Calculates fingerprint quality score (0 to 100) based on:
    1. Global contrast (standard deviation of grayscale values)
    2. Ridge clarity (average gradient magnitude using Sobel)
    3. Binarization density (closeness to optimal 45% ridge ratio)
    """
    # 1. Contrast Score (based on standard deviation of gray values)
    std_val = np.std(enhanced_img)
    contrast_score = min(1.0, std_val / 65.0) * 100.0

    # 2. Ridge Clarity Score (using Sobel gradients)
    sobelx = cv2.Sobel(enhanced_img, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(enhanced_img, cv2.CV_64F, 0, 1, ksize=3)
    magnitude = cv2.magnitude(sobelx, sobely)
    clarity_score = min(1.0, np.mean(magnitude) / 45.0) * 100.0

    # 3. Density Score (ideal print has ~40-50% ridge pixels)
    ridge_pixels = np.sum(binary_img == 255)
    total_pixels = binary_img.size
    density_ratio = ridge_pixels / total_pixels if total_pixels > 0 else 0
    deviation = abs(density_ratio - 0.45)
    density_score = max(0.0, 1.0 - (deviation / 0.25)) * 100.0

    # Weighted sum
    quality = (0.3 * contrast_score) + (0.4 * clarity_score) + (0.3 * density_score)
    return round(float(np.clip(quality, 0, 100)), 2)

def classify_pattern_type(enhanced_img: np.ndarray) -> str:
    """
    Classifies fingerprint pattern type (Loop, Whorl, Arch) based on orientation field entropy.
    - Arch: ridges flow side to side. Uniform horizontal directions. Low entropy.
    - Loop: ridges curve back. Diagonal peaks. Medium entropy.
    - Whorl: circular flow. Wide distribution of angles. High entropy.
    """
    # Compute Sobel gradients in central region
    h, w = enhanced_img.shape
    cy, cx = h // 2, w // 2
    r = 60 # central crop radius
    core_region = enhanced_img[max(0, cy-r):min(h, cy+r), max(0, cx-r):min(w, cx+r)]

    sobelx = cv2.Sobel(core_region, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(core_region, cv2.CV_64F, 0, 1, ksize=3)

    # Compute orientation field angles (0 to pi)
    # Using squared gradient method for orientations
    numerator = 2.0 * sobelx * sobely
    denominator = (sobelx**2) - (sobely**2)
    angles = 0.5 * np.arctan2(numerator, denominator) + np.pi/2.0

    # Map angles to degrees [0, 180]
    angles_deg = np.degrees(angles)

    # Compute histogram of orientation angles
    hist, bin_edges = np.histogram(angles_deg, bins=18, range=(0, 180), density=True)

    # Calculate Shannon Entropy of the angle distribution
    # High entropy = Whorl (angles are evenly spread in all directions)
    # Low entropy = Arch (most ridges flow horizontally, few angles)
    # Medium entropy = Loop
    hist = hist[hist > 0]
    entropy = -np.sum(hist * np.log2(hist))

    # Thresholds tuned for typical fingerprint orientation distributions
    # Normal Shannon Entropy of 18 bins ranges from 0 to log2(18) = 4.17
    if entropy < 2.3:
        return "Arch"
    elif entropy > 3.1:
        return "Whorl"
    else:
        return "Loop"
