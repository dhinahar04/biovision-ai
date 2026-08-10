"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileImage, ShieldAlert, ArrowRight, RefreshCw, Fingerprint, Trash2, CheckCircle2, Circle } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState([]);
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
    "Averaging probability distributions...",
    "Generating Grad-CAM attention heatmaps...",
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFiles(e.target.files);
    }
  };

  const validateAndSetFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter(file => {
      if (!file.type.startsWith("image/")) {
        alert(`Invalid format for ${file.name}: Please upload an image file.`);
        return false;
      }
      return true;
    }).map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      previewUrl: URL.createObjectURL(file)
    }));

    setSelectedFiles(prev => {
      const combined = [...prev, ...validFiles];
      if (combined.length > 10) {
        alert("Maximum limit is 10 fingerprints. Only the first 10 will be kept.");
        return combined.slice(0, 10);
      }
      return combined;
    });
  };

  const removeFile = (idToRemove) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(item => item.id === idToRemove);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter(item => item.id !== idToRemove);
    });
  };

  const clearSelection = () => {
    selectedFiles.forEach(item => URL.revokeObjectURL(item.previewUrl));
    setSelectedFiles([]);
  };

  const startAnalysis = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setProcessStep(0);

    // Simulate progress log changes while server responds
    const stepInterval = setInterval(() => {
      setProcessStep((prev) => {
        if (prev < scanSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 800);

    const formData = new FormData();
    selectedFiles.forEach(item => {
      formData.append("files", item.file);
    });

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
    <div className="max-w-4xl mx-auto py-6 flex flex-col gap-8 text-center">
      
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-widest">Biometric Registration</span>
        <h1 className="text-3xl font-display font-extrabold tracking-tight mt-1 text-slate-900">Upload Ink Fingerprints</h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto font-sans">Provide clean, cropped ink-on-paper fingerprint images for biological marker analysis.</p>
      </div>

      {/* Guidelines Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white text-left shadow-sm">
        <h3 className="text-sm font-display font-extrabold uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
          <Fingerprint className="w-4 h-4" /> Scanning Guidelines for Best Accuracy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1.5 hover:border-blue-300 hover:bg-white transition-all shadow-sm">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> 1. White Paper
            </span>
            <span className="text-slate-500 leading-relaxed text-[11px]">Capture prints on flat, solid white background to avoid pattern confusion.</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1.5 hover:border-blue-300 hover:bg-white transition-all shadow-sm">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> 2. Balanced Light
            </span>
            <span className="text-slate-500 leading-relaxed text-[11px]">Ensure bright, indirect lighting. Avoid harsh overhead shadows.</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1.5 hover:border-blue-300 hover:bg-white transition-all shadow-sm">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> 3. No Blur
            </span>
            <span className="text-slate-500 leading-relaxed text-[11px]">Keep the camera steady. Motion blur distorts the fine ridge patterns.</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1.5 hover:border-blue-300 hover:bg-white transition-all shadow-sm">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> 4. Image Coverage
            </span>
            <span className="text-slate-500 leading-relaxed text-[11px]">The fingerprint pattern should fill the majority of the image frame.</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1.5 hover:border-blue-300 hover:bg-white transition-all shadow-sm">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> 5. Thumb Print
            </span>
            <span className="text-slate-500 leading-relaxed text-[11px]">Thumbs generally offer the clearest ridge valleys for topological analysis.</span>
          </div>
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 flex flex-col gap-1.5 hover:bg-white transition-all shadow-sm">
            <span className="font-bold text-blue-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> 6. Multi-Print Average
            </span>
            <span className="text-blue-900/80 leading-relaxed text-[11px]">Select 2 to 10 images (different angles or fingers) to run averaged predictions.</span>
          </div>
        </div>
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
              className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 min-h-[300px] bg-slate-50/50 hover:bg-slate-50/80 ${
                dragActive 
                  ? "border-blue-500 bg-blue-50/30 shadow-md" 
                  : "border-slate-300 bg-white hover:border-slate-400"
              }`}
            >
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept="image/*"
                multiple
                onChange={handleFileChange} 
              />
              
              {selectedFiles.length === 0 ? (
                <label 
                  htmlFor="file-upload" 
                  className="flex flex-col items-center justify-center gap-5 cursor-pointer w-full h-full py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm animate-pulse">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div className="flex flex-col gap-1 font-sans">
                    <span className="text-sm font-bold text-blue-600 hover:underline">
                      Click to choose files
                    </span>
                    <span className="text-xs text-slate-500"> or drag and drop images here</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Supports PNG, JPG, JPEG, BMP formats (Choose 1 to 10 images)</p>
                </label>
              ) : (
                <div className="flex flex-col gap-6 w-full text-left">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 font-mono">
                    <span className="text-xs font-semibold text-slate-500">
                      SELECTED SAMPLES ({selectedFiles.length} / 10):
                    </span>
                    <label 
                      htmlFor="file-upload" 
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
                    >
                      + Add More
                    </label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {selectedFiles.map((item, index) => (
                      <div 
                        key={item.id} 
                        className="relative group aspect-square bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col items-center justify-center p-2.5 hover:border-blue-400 transition-all hover:scale-102 shadow-sm"
                      >
                        <img 
                          src={item.previewUrl} 
                          alt={`Print ${index + 1}`} 
                          className="max-h-[75%] max-w-full object-contain rounded-md shadow-sm border border-slate-100"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(item.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="text-[9px] font-mono text-slate-500 mt-2 truncate w-full text-center">
                          {item.file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Disclaimer panel */}
            <div className="flex gap-4 p-5 bg-red-50 border border-red-200 rounded-xl text-left shadow-sm">
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <h4 className="text-xs font-display font-extrabold text-red-600 uppercase tracking-wider">RESEARCH PROTOCOL NOTIFY</h4>
                <p className="text-[11px] text-red-700 leading-relaxed font-sans">
                  Biometric diagnostics represented inside this software represent neural-statistical estimations. Never use this output to substitute standard biological antigen matching or clinical lab exams.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            {selectedFiles.length > 0 && (
              <div className="flex items-center justify-end gap-3 mt-2 font-mono">
                <button 
                  onClick={clearSelection}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm"
                >
                  Clear All
                </button>
                <button 
                  onClick={startAnalysis}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                >
                  Analyze Ridges <ArrowRight className="w-4.5 h-4.5" />
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="scanner"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center gap-8 border border-slate-200 shadow-lg relative w-full h-[450px]"
          >
            {/* Visual Scanner HUD */}
            <div className="relative w-48 h-48 border border-blue-200 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner animate-scanner">
              <Fingerprint className="w-28 h-28 text-blue-600/10 stroke-[1]" />
            </div>

            <div className="flex flex-col gap-4 items-center w-full">
              <div className="flex items-center gap-3 text-lg font-bold text-slate-800">
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" /> Processing Neural Core...
              </div>
              
              {/* Dynamic steps console */}
              <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl shadow-inner max-w-sm w-full h-16 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={processStep}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 0.85, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="text-xs font-mono text-neonCyan text-center w-full flex items-center justify-center gap-2"
                  >
                    <Circle className="w-2 h-2 text-neonGreen animate-ping fill-neonGreen shrink-0" />
                    <span>{scanSteps[processStep]}</span>
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
