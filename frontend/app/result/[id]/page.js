"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { 
  Fingerprint, Award, Layers, ShieldAlert, Download, CheckCircle, 
  HelpCircle, AlertCircle, HeartPulse, RefreshCw
} from "lucide-react";

export default function ResultPage() {
  const { id } = useParams();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Image Viewer Active Tab: 'original', 'enhanced', 'gradcam'
  const [activeTab, setActiveTab] = useState("gradcam");

  // Multi-Finger navigation index
  const [activeFingerIndex, setActiveFingerIndex] = useState(0);

  // Feedback State
  const [actualGroup, setActualGroup] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPredictionDetails();
    }
  }, [id]);

  const fetchPredictionDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/api/prediction/${id}`);
      if (!res.ok) throw new Error("Failed to fetch prediction details");
      const data = await res.json();
      setPrediction(data);
      setActualGroup(data.actual_blood_group || "");
    } catch (err) {
      setError("Failed to load result. Ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!actualGroup) return;

    setSubmittingFeedback(true);
    setFeedbackSuccess(false);

    try {
      const formData = new URLSearchParams();
      formData.append("prediction_id", id);
      formData.append("actual_blood_group", actualGroup);

      const res = await fetch("http://localhost:8000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      });

      if (!res.ok) throw new Error("Feedback submission failed");
      
      setFeedbackSuccess(true);
      // Refresh local metrics
      fetchPredictionDetails();
    } catch (err) {
      alert("Failed to submit feedback. Try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-500 text-sm font-mono">Fetching neural diagnostics...</p>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="glass-panel max-w-xl mx-auto p-8 rounded-2xl border border-red-200 flex flex-col items-center gap-4 text-center mt-12">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-slate-800">Diagnostic Error</h2>
        <p className="text-sm text-slate-500">{error || "Result not found in databases."}</p>
        <a href="/upload" className="px-5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm font-semibold hover:bg-slate-800 text-white">
          Start New Scan
        </a>
      </div>
    );
  }

  // Active finger data extraction
  const hasMultipleFingers = prediction.fingers && prediction.fingers.length > 1;
  const activeFinger = prediction.fingers && prediction.fingers.length > 0 ? prediction.fingers[activeFingerIndex] : null;

  // Prep Recharts Data
  const chartData = Object.entries(prediction.probabilities || {}).map(([name, value]) => ({
    name,
    probability: value
  })).sort((a, b) => b.probability - a.probability);

  const getQualityLabel = (score) => {
    if (score >= 80) return { label: "Excellent Ridge Clarity", color: "text-teal-600" };
    if (score >= 60) return { label: "Good Ridge Definitions", color: "text-emerald-600" };
    if (score >= 40) return { label: "Fair Ridge Contrast", color: "text-amber-600" };
    return { label: "Poor Print Contrast", color: "text-rose-600" };
  };

  const getPatternDescription = (pattern) => {
    if (!pattern) return "Unknown print structure pattern.";
    if (pattern.includes("Whorl")) return "Concentric loops forming spiral or circular ridge paths. High density of singular points.";
    if (pattern.includes("Loop")) return "Ridges enter, recurve, and exit from the same side. Diagonal core orientation fields.";
    return "Ridges run from one side of the print, rise in the center, and exit on the opposite side.";
  };

  // Determine active visual data
  const visualSource = activeFinger || prediction;
  const activeImageUrl = () => {
    if (activeTab === "original") return `http://localhost:8000${visualSource.original_url}`;
    if (activeTab === "enhanced") return `http://localhost:8000${visualSource.enhanced_url}`;
    return `http://localhost:8000${visualSource.gradcam_url}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4 font-sans text-slate-700">
      
      {/* Page Title Header */}
      <div className="lg:col-span-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6 text-left">
        <div>
          <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-widest">Diagnostic Report</span>
          <h1 className="text-3xl font-display font-extrabold tracking-tight mt-1 text-slate-900">Classification Results</h1>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`http://localhost:8000/api/report/${prediction.id}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all font-mono"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </a>
        </div>
      </div>

      {/* LEFT COLUMN: Visualizations Tab Viewer (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 text-left border border-slate-200 bg-white">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" /> Dermatoglyphic Visual Analysis
          </h3>

          {/* Finger Selector (if multiple uploaded) */}
          {hasMultipleFingers && (
            <div className="flex flex-col gap-2 border-b border-slate-200/80 pb-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Select Input Finger to Inspect:</span>
              <div className="flex flex-wrap gap-2">
                {prediction.fingers.map((f, idx) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFingerIndex(idx)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                      activeFingerIndex === idx
                        ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    FINGER {idx + 1} ({f.predicted_blood_group})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toggle Tabs */}
          <div className="flex bg-slate-50 p-1.5 rounded-lg border border-slate-200 self-start text-xs font-mono font-bold text-slate-500">
            <button 
              onClick={() => setActiveTab("original")}
              className={`px-3 py-1.5 rounded-md transition-all ${activeTab === "original" ? "bg-white text-blue-600 shadow-sm border border-slate-200/60" : "hover:text-slate-850"}`}
            >
              Original Print
            </button>
            <button 
              onClick={() => setActiveTab("enhanced")}
              className={`px-3 py-1.5 rounded-md transition-all ${activeTab === "enhanced" ? "bg-white text-blue-600 shadow-sm border border-slate-200/60" : "hover:text-slate-850"}`}
            >
              OpenCV enhanced
            </button>
            <button 
              onClick={() => setActiveTab("gradcam")}
              className={`px-3 py-1.5 rounded-md transition-all ${activeTab === "gradcam" ? "bg-white text-blue-600 shadow-sm border border-slate-200/60" : "hover:text-slate-850"}`}
            >
              Grad-CAM Heatmap
            </button>
          </div>

          {/* Active Image Render */}
          <div className="relative w-full aspect-square border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center shadow-inner">
            <img 
              src={activeImageUrl()} 
              alt="Classification visualization"
              className="max-h-full max-w-full object-contain"
            />
            
            {/* Simulation tag */}
            {prediction.simulation && (
              <div className="absolute top-3 right-3 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded text-[10px] font-bold text-amber-600 tracking-wider">
                SIMULATION MODE
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed italic">
            {activeTab === "original" && "Raw fingerprint scan captured from ink paper, representing initial signal noise and contrast boundaries."}
            {activeTab === "enhanced" && "Enhanced output using CLAHE (clipLimit=3.0) and bilateral filtering. Background removal sets surrounding pixels to solid white, isolating fingerprint ridges."}
            {activeTab === "gradcam" && "Class activation map overlaid on the CLAHE print. Red and orange highlights indicate where the CNN feature layers focused gradients to infer blood group."}
          </p>
        </div>

        {/* Neural Network Probability Distribution */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 text-left border border-slate-200 bg-white">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-blue-600" /> Softmax Prediction Probabilities (Averaged)
          </h3>
          
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.85}/>
                    <stop offset="100%" stopColor="#0D9488" stopOpacity={0.4}/>
                  </linearGradient>
                  <linearGradient id="barNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e2e8f0" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#cbd5e1" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                <YAxis stroke="#64748b" unit="%" tickLine={false} />
                <Tooltip 
                  cursor={{ fill: "rgba(0,0,0,0.01)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-slate-200 p-2.5 rounded-lg text-xs font-mono shadow-sm">
                          <span className="font-bold text-slate-900">{payload[0].payload.name}: </span>
                          <span className="text-blue-600 font-bold">{payload[0].value}%</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === prediction.predicted_blood_group ? "url(#barGrad)" : "url(#barNormal)"} 
                      stroke={entry.name === prediction.predicted_blood_group ? "#2563EB" : "#94a3b8"}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Diagnostic Summary & Feedback (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Core Prediction Display */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 text-left border border-blue-100 bg-gradient-to-tr from-blue-50/50 to-transparent">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider">Estimated Marker</span>
            <Fingerprint className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>

          <div className="flex items-baseline gap-2.5 my-2">
            <span className="text-6xl font-display font-black text-slate-900">{prediction.predicted_blood_group}</span>
            <span className="text-xs text-blue-600 font-mono font-bold">({prediction.confidence}% confidence)</span>
          </div>

          <div className="border-t border-slate-200 pt-4 flex flex-col gap-2 text-xs text-slate-500 font-medium">
            <div className="flex justify-between">
              <span>Primary Estimation Class:</span>
              <span className="font-bold text-slate-800">{prediction.predicted_blood_group} Blood Type</span>
            </div>
            <div className="flex justify-between">
              <span>Classifier Target:</span>
              <span className="font-bold text-slate-800">Multi-Model Ensemble Average</span>
            </div>
            {hasMultipleFingers && (
              <div className="flex justify-between">
                <span>Aggregated Inputs:</span>
                <span className="font-bold text-blue-600 font-mono">{prediction.fingers.length} finger prints</span>
              </div>
            )}
          </div>
        </div>

        {/* Quality Score HUD */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 text-left border border-slate-200 bg-white">
          <h3 className="font-mono text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-650" /> Quality Diagnostic {activeFinger && `(Finger ${activeFingerIndex + 1})`}
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {activeFinger ? activeFinger.quality_score : prediction.quality_score}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100 Quality Index</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-250">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all duration-1000"
              style={{ width: `${activeFinger ? activeFinger.quality_score : prediction.quality_score}%` }}
            />
          </div>

          <span className={`text-xs font-bold ${getQualityLabel(activeFinger ? activeFinger.quality_score : prediction.quality_score).color}`}>
            {getQualityLabel(activeFinger ? activeFinger.quality_score : prediction.quality_score).label}
          </span>
        </div>

        {/* Pattern Classification HUD */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 text-left border border-slate-200 bg-white">
          <h3 className="font-mono text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" /> Pattern Topology {activeFinger && `(Finger ${activeFingerIndex + 1})`}
          </h3>
          
          <div className="text-xl font-display font-extrabold text-slate-900">
            {activeFinger ? activeFinger.pattern_type : prediction.pattern_type} Structure
          </div>
          
          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            {getPatternDescription(activeFinger ? activeFinger.pattern_type : prediction.pattern_type)}
          </p>
        </div>

        {/* User Feedback & Model Calibration Loop */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 text-left border border-slate-200 bg-white">
          <h3 className="font-mono text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-teal-650" /> Verify Prediction
          </h3>
          
          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            Help improve neural classification models by submitting the actual laboratory-verified blood group.
          </p>

          <form onSubmit={submitFeedback} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <select
                value={actualGroup}
                onChange={(e) => setActualGroup(e.target.value)}
                className="grow bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:border-blue-600 outline-none text-slate-700 font-medium"
              >
                <option value="">Select verified group...</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>

              <button
                type="submit"
                disabled={submittingFeedback || !actualGroup}
                className="px-4 py-2.5 bg-blue-600 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 rounded-lg disabled:opacity-40 disabled:hover:bg-blue-600 transition-all shrink-0 shadow-sm"
              >
                {submittingFeedback ? "Submitting..." : "Verify"}
              </button>
            </div>

            {feedbackSuccess && (
              <div className="flex items-center gap-2 text-xs font-medium text-teal-600">
                <CheckCircle className="w-4 h-4" /> Feedback recorded successfully!
              </div>
            )}
          </form>
        </div>

        {/* Medical disclaimer warning */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-left">
          <ShieldAlert className="w-4 h-4 text-red-650 shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-700 leading-relaxed font-sans">
            <span className="font-bold text-red-600">RESEARCH INDEX ONLY.</span> Prediction classifications generated by this engine represent statistical correlations. Do not base any blood transfusion or clinical operations on these outputs.
          </p>
        </div>

      </div>

    </div>
  );
}
