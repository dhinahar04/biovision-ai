# BioVision AI 🔬🩸
### *Neural Blood Group Estimation & Fingerprint Analysis Research Tool*

BioVision AI is a full-stack research prototype that demonstrates ABO blood group prediction directly from ink-on-paper fingerprint scans using PyTorch deep learning (Transfer Learning via EfficientNet-B0) and classical computer vision (OpenCV).

> [!WARNING]
> **RESEARCH & ESTIMATION TOOL ONLY**
> BioVision AI is not an approved medical device and should never replace clinical lab blood typing. Please read the full Medical Disclaimer inside the app or at the bottom of this page before use.

---

## 🏗️ Project Architecture

```
biovision-ai/
├── backend/                  # FastAPI & PyTorch Server
│   ├── app/
│   │   ├── ai/               # Computer Vision & PyTorch Modules
│   │   │   ├── preprocess.py # OpenCV ridge enhancement & topology
│   │   │   ├── predict.py    # Softmax inference & Grad-CAM generator
│   │   │   └── train.py      # Non-blocking EfficientNet training loop
│   │   ├── routes/
│   │   │   ├── predictions.py# Scan uploads, PDF reports, and feedback routes
│   │   │   └── admin.py      # Dashboard analytics & training status routes
│   │   ├── database.py       # SQLite engine config
│   │   ├── models.py         # SQLAlchemy DB schemas
│   │   └── main.py           # Server entry point
│   ├── requirements.txt      # Python dependencies
│   ├── install_deps.js       # Local helper script
│   └── .env                  # Port, paths, and SQLite settings
└── frontend/                 # Next.js App Router (Tailwind CSS)
    ├── app/                  # Pages: Upload, Dashboard, History, Training
    ├── tailwind.config.js    # UI Style guide
    └── package.json          # Node dependencies
```

---

## 🚀 Getting Started & Local Installation

Because the macOS App Sandbox environment of the IDE terminal blocks outbound TCP/UDP traffic (causing network installation tools like `npm` or `pip` to encounter `ENOTFOUND` / DNS lookup errors), you should run the following commands in your **local system terminal** rather than the IDE terminal.

### Step 1: Install Backend Python dependencies
1. Open your system terminal and navigate to the backend folder:
   ```bash
   cd "/Users/dhina/Desktop/bio ai/biovision-ai/backend"
   ```
2. Activate the virtual environment:
   ```bash
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
4. Run the model initialization script to create the placeholder model checkpoint:
   ```bash
   python app/ai/create_dummy_model.py
   ```
5. Start the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

### Step 2: Install Frontend Next.js dependencies
1. Open another window in your system terminal and navigate to the frontend folder:
   ```bash
   cd "/Users/dhina/Desktop/bio ai/biovision-ai/frontend"
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

Now open your browser and navigate to **[http://localhost:3000](http://localhost:3000)** to launch the premium glassmorphic dashboard interface!

---

## 🧬 Core Technologies & Pipelines

### 1. OpenCV Preprocessing & Enhancement
- **Grayscale Conversion**: Normalizes color space.
- **Bilateral Filtering**: Clears noise while preserving high-frequency ridge boundaries.
- **CLAHE (Contrast Limited Adaptive Histogram Equalization)**: Maximizes contrast between the ridge lines and paper backing.
- **Otsu's Thresholding**: Binarizes the prints dynamically.
- **Contour-based Cropping**: Crops the fingerprint boundary.
- **Topology Classification**: Calculates orientation field entropy to classify pattern types into **Loops**, **Whorls**, or **Arches**.
- **Quality Score (0-100)**: Evaluates print suitability using ridge contrast, Sobel clarity, and binarization density ratio (ideal ~45%).

### 2. PyTorch Classifier & Grad-CAM Explainability
- **Transfer Learning**: Uses an **EfficientNet-B0** network customized to classify inputs into 8 classes: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`.
- **Simulation Mode**: If model weights are uncalibrated or uninitialized, the API runs in simulation mode, generating random Softmax outputs and central mock Grad-CAM heatmaps so the UI runs flawlessly.
- **Grad-CAM Backpropagation**: Dynamically registers forward/backward hook nodes on the last convolutional layer of the network (`model.features[-1][0]`). It overlays target class gradient heatmaps back onto the fingerprint ridges in real-time, showing which ridge structures influenced the classifier.

### 3. ReportLab PDF Compiler
- Compiles pre-processed outputs, Grad-CAM attention heatmaps, statistical class probability charts, metadata parameters, and prominent medical disclaimers into a clean, printable PDF report.

---

## ⚖️ Clinical Disclaimer

> [!IMPORTANT]
> BioVision AI is designed solely as a prototype for research, academic estimation, and developer demonstration. It does not perform actual chemical blood grouping or serological tests. It should never be used in place of clinical tests, blood transfusions, or professional diagnostic procedures. All medical decisions regarding ABO blood groups must be based exclusively on standardized tests performed by clinical professionals.
