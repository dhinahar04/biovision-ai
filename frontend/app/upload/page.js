"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileImage, ShieldAlert, ArrowRight, RefreshCw, Fingerprint } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  
  // Loading & Processing States
  const [isUploading, setIsUploading] = useState(false);
  const [processStep, setProcessStep] = useState(0);

  // Steps shown to user during scanning animation
  const scanSteps = [
    "Reading raw pixel buffer...",
    "Converting to grayscale...",
    "Applying bilateral filter denoising...",
    "Enhancing contrast using CLAHE grids...",
    "Binarizing ridges via Otsu threshold...",
    "Cropping bounding contours...",
    "Running PyTorch deep CNN feed-forward...",
    "Generating Grad-CAM attention heatmap...",
    "Recording database entry..."
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    if (!file.type.startsWith("image/")) {
      alert("Invalid format: Please upload an image file (PNG, JPG, JPEG, BMP).");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const startAnalysis = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setProcessStep(0);

    // Simulate progress log changes while server responds
    const stepInterval = setInterval(() => {
      setProcessStep((prev) => {
        if (prev < scanSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 900);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error("API responded with an error");
      }

      const result = await response.json();
      router.push(`/result/${result.id}`);
    } catch (error) {
      clearInterval(stepInterval);
      setIsUploading(false);
      alert("Scan failed. Ensure the FastAPI backend server is running on localhost:8000.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 flex flex-col gap-8 text-center">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Upload Ink Fingerprint</h1>
        <p className="text-sm text-gray-400">Provide a clean, cropped ink-on-paper fingerprint image for biological marker analysis.</p>
      </div>

      <AnimatePresence mode="wait">
        {!isUploading ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            {/* Drag & Drop Area */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
                dragActive 
                  ? "border-neonCyan bg-cyan-950/20 shadow-glowCyan" 
                  : "border-gray-800 bg-gray-950/30 hover:border-gray-700"
              }`}
            >
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange} 
              />
              
              {!selectedFile ? (
                <label 
                  htmlFor="file-upload" 
                  className="flex flex-col items-center justify-center gap-4 cursor-pointer w-full h-full"
                >
                  <div className="w-16 h-16 rounded-full bg-cyan-950/45 border border-neonCyan/20 flex items-center justify-center text-neonCyan shadow-glowCyan animate-pulse">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-neonCyan hover:underline">
                      Click to choose file
                    </span>
                    <span className="text-sm text-gray-400"> or drag and drop image here</span>
                  </div>
                  <p className="text-xs text-gray-500">Supports PNG, JPG, JPEG, BMP formats (Max 8MB)</p>
                </label>
              ) : (
                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="relative w-64 h-64 border border-gray-800 rounded-lg overflow-hidden flex items-center justify-center bg-gray-900/30">
                    <img 
                      src={previewUrl} 
                      alt="Fingerprint Preview" 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-300 bg-gray-900/40 px-3 py-1.5 rounded-lg border border-gray-800">
                    <FileImage className="w-4 h-4 text-neonGreen" /> {selectedFile.name}
                  </div>
                </div>
              )}
            </div>

            {/* Disclaimer panel */}
            <div className="flex gap-3 p-4 bg-red-950/25 border border-red-900/50 rounded-xl text-left">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Research & Estimation Tool</h4>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                  Fingerprint diagnostics are estimation indexes. Results should not be substituted for biological laboratory tests. Uploading smudged, partial, or low-resolution prints will skew the classification output.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            {selectedFile && (
              <div className="flex items-center justify-end gap-3 mt-2">
                <button 
                  onClick={clearSelection}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-400 border border-gray-800 bg-gray-950/45 hover:bg-gray-900/50 hover:text-white transition-all"
                >
                  Clear Selection
                </button>
                <button 
                  onClick={startAnalysis}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-gray-900 bg-gradient-to-r from-neonCyan to-neonGreen hover:brightness-110 shadow-glowCyan transition-all"
                >
                  Analyze Ridges <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="scanner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center gap-8 border border-cyan-950/60 shadow-2xl relative w-full h-[400px]"
          >
            {/* Visual Scanner HUD */}
            <div className="relative w-48 h-48 border border-cyan-800/40 rounded-xl bg-gray-950/60 flex items-center justify-center shadow-inner animate-scanner">
              <Fingerprint className="w-28 h-28 text-neonCyan/20 stroke-[1]" />
            </div>

            <div className="flex flex-col gap-3 items-center">
              <div className="flex items-center gap-3 text-lg font-bold text-white">
                <RefreshCw className="w-5 h-5 text-neonCyan animate-spin" /> Scanning Fingerprint...
              </div>
              
              {/* Dynamic steps console */}
              <div className="w-80 h-10 overflow-hidden relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={processStep}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 0.8, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs font-mono text-neonGreen text-center w-full"
                  >
                    {scanSteps[processStep]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
