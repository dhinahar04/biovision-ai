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
        <RefreshCw className="w-8 h-8 text-neonCyan animate-spin" />
        <p className="text-gray-400 text-sm font-mono">Fetching neural diagnostics...</p>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="glass-panel max-w-xl mx-auto p-8 rounded-2xl border border-red-900/30 flex flex-col items-center gap-4 text-center mt-12">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-white">Diagnostic Error</h2>
        <p className="text-sm text-gray-400">{error || "Result not found in databases."}</p>
        <a href="/upload" className="px-5 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-sm font-semibold hover:bg-gray-800 text-white">
          Start New Scan
        </a>
      </div>
    );
  }

  // Prep Recharts Data
  const chartData = Object.entries(prediction.probabilities || {}).map(([name, value]) => ({
    name,
    probability: value
  })).sort((a, b) => b.probability - a.probability);

  // Colors for bar chart cells
  const getCellColor = (name) => {
    return name === prediction.predicted_blood_group ? "#06b6d4" : "#1e293b";
  };

  const getQualityLabel = (score) => {
    if (score >= 80) return { label: "Excellent Ridge Clarity", color: "text-neonGreen" };
    if (score >= 60) return { label: "Good Ridge Definitions", color: "text-emerald-400" };
    if (score >= 40) return { label: "Fair Ridge Contrast", color: "text-amber-400" };
    return { label: "Poor Print Contrast", color: "text-red-400" };
  };

  const getPatternDescription = (pattern) => {
    if (pattern === "Whorl") return "Concentric loops forming spiral or circular ridge paths. High density of singular points.";
    if (pattern === "Loop") return "Ridges enter, recurve, and exit from the same side. Diagonal core orientation fields.";
    return "Ridges run from one side of the print, rise in the center, and exit on the opposite side.";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4">
      
      {/* Page Title Header */}
      <div className="lg:col-span-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-900 pb-6">
        <div className="text-left">
          <span className="text-xs font-mono text-neonCyan font-bold uppercase tracking-widest">Diagnostic Report</span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Classification Results</h1>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`http://localhost:8000/api/report/${prediction.id}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-900 bg-gradient-to-r from-neonCyan to-neonGreen rounded-lg hover:brightness-110 shadow-glowCyan transition-all"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </a>
        </div>
      </div>

      {/* LEFT COLUMN: Visualizations Tab Viewer (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6 text-left border border-gray-800">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-neonCyan" /> Dermatoglyphic Visual Analysis
          </h3>

          {/* Toggle Tabs */}
          <div className="flex bg-gray-950 p-1.5 rounded-lg border border-gray-800 self-start text-xs font-semibold text-gray-400">
            <button 
              onClick={() => setActiveTab("original")}
              className={`px-3 py-1.5 rounded-md transition-all ${activeTab === "original" ? "bg-gray-900 text-neonCyan border border-cyan-950" : "hover:text-white"}`}
            >
              Original Print
            </button>
            <button 
              onClick={() => setActiveTab("enhanced")}
              className={`px-3 py-1.5 rounded-md transition-all ${activeTab === "enhanced" ? "bg-gray-900 text-neonCyan border border-cyan-950" : "hover:text-white"}`}
            >
              OpenCV CLAHE
            </button>
            <button 
              onClick={() => setActiveTab("gradcam")}
              className={`px-3 py-1.5 rounded-md transition-all ${activeTab === "gradcam" ? "bg-gray-900 text-neonCyan border border-cyan-950" : "hover:text-white"}`}
            >
              Grad-CAM Heatmap
            </button>
          </div>

          {/* Active Image Render */}
          <div className="relative w-full aspect-square border border-gray-950 rounded-xl overflow-hidden bg-gray-950 flex items-center justify-center">
            {activeTab === "original" && (
              <img 
                src={`http://localhost:8000${prediction.original_url}`} 
                alt="Original Scan"
                className="max-h-full max-w-full object-contain"
              />
            )}
            {activeTab === "enhanced" && (
              <img 
                src={`http://localhost:8000${prediction.enhanced_url}`} 
                alt="CLAHE Enhancement"
                className="max-h-full max-w-full object-contain"
              />
            )}
            {activeTab === "gradcam" && (
              <img 
                src={`http://localhost:8000${prediction.gradcam_url}`} 
                alt="Gradcam Layer"
                className="max-h-full max-w-full object-contain"
              />
            )}
            
            {/* Simulation tag */}
            {prediction.simulation && (
              <div className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded text-[10px] font-bold text-amber-400 tracking-wider">
                SIMULATION MODE
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 leading-relaxed italic">
            {activeTab === "original" && "Raw fingerprint scan captured from ink paper, representing initial signal noise and contrast boundaries."}
            {activeTab === "enhanced" && "Enhanced output using CLAHE (clipLimit=3.0) and bilateral filtering. Maximizes ridge definition and removes paper background grain."}
            {activeTab === "gradcam" && "Class activation map overlaid on the CLAHE print. Red and orange highlights indicate where the CNN feature layers focused gradients to infer blood group."}
          </p>
        </div>

        {/* Neural Network Probability Distribution */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 text-left border border-gray-800">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-cyberPurple" /> Softmax Prediction Probabilities
          </h3>
          
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                <YAxis stroke="#64748b" unit="%" tickLine={false} />
                <Tooltip 
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-950 border border-gray-800 p-2 rounded-lg text-xs">
                          <span className="font-bold text-white">{payload[0].payload.name}: </span>
                          <span className="text-neonCyan font-semibold">{payload[0].value}%</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCellColor(entry.name)} />
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
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 text-left border border-gray-800 bg-gradient-to-tr from-cyan-950/20 to-transparent">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-neonCyan font-bold uppercase tracking-wider">Estimated Marker</span>
            <Fingerprint className="w-6 h-6 text-neonCyan animate-pulse" />
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <span className="text-6xl font-black text-white">{prediction.predicted_blood_group}</span>
            <span className="text-sm text-neonCyan font-mono">({prediction.confidence}% confidence)</span>
          </div>

          <div className="border-t border-gray-900 pt-4 flex flex-col gap-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Primary Estimation Class:</span>
              <span className="font-bold text-white">{prediction.predicted_blood_group} Blood Type</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Classifier Target:</span>
              <span className="font-bold text-white">EfficientNet-B0 (ABO Layer)</span>
            </div>
          </div>
        </div>

        {/* Quality Score HUD */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 text-left border border-gray-800">
          <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Award className="w-4 h-4 text-neonGreen" /> Quality Diagnostic
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{prediction.quality_score}</span>
            <span className="text-xs text-gray-500 font-mono">/ 100 Quality Index</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-900">
            <div 
              className="h-full bg-gradient-to-r from-neonCyan to-neonGreen transition-all duration-1000"
              style={{ width: `${prediction.quality_score}%` }}
            />
          </div>

          <span className={`text-xs font-semibold ${getQualityLabel(prediction.quality_score).color}`}>
            {getQualityLabel(prediction.quality_score).label}
          </span>
        </div>

        {/* Pattern Classification HUD */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 text-left border border-gray-800">
          <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4 text-neonCyan" /> Pattern Topology
          </h3>
          
          <div className="text-xl font-extrabold text-white">
            {prediction.pattern_type} Structure
          </div>
          
          <p className="text-xs text-gray-400 leading-relaxed">
            {getPatternDescription(prediction.pattern_type)}
          </p>
        </div>

        {/* User Feedback & Model Calibration Loop */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 text-left border border-gray-800">
          <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-neonGreen" /> Verify Prediction
          </h3>
          
          <p className="text-xs text-gray-400 leading-relaxed">
            Help improve neural classification models by submitting the actual laboratory-verified blood group.
          </p>

          <form onSubmit={submitFeedback} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <select
                value={actualGroup}
                onChange={(e) => setActualGroup(e.target.value)}
                className="grow bg-gray-950 border border-gray-800 text-xs rounded-lg p-2.5 focus:border-neonCyan outline-none text-white font-medium"
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
                className="px-4 py-2.5 bg-gray-900 border border-gray-800 text-xs font-bold uppercase tracking-wider text-neonCyan hover:bg-gray-800 rounded-lg disabled:opacity-40 disabled:hover:bg-gray-900 transition-all shrink-0"
              >
                {submittingFeedback ? "Submitting..." : "Verify"}
              </button>
            </div>

            {feedbackSuccess && (
              <div className="flex items-center gap-2 text-xs font-medium text-neonGreen">
                <CheckCircle className="w-4 h-4" /> Feedback recorded successfully!
              </div>
            )}
          </form>
        </div>

        {/* Medical disclaimer warning */}
        <div className="p-4 bg-red-950/20 border border-red-950 rounded-xl flex items-start gap-3 text-left">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-gray-400 leading-relaxed">
            <span className="font-bold text-red-400">RESEARCH INDICES.</span> Prediction classifications generated by the convolutional engine represent statistical correlations. This tool should not guide clinical procedures or transfusions under any circumstance.
          </p>
        </div>

      </div>

    </div>
  );
}
