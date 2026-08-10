"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { 
  Cpu, RefreshCw, Play, CheckCircle2, AlertCircle, ArrowLeft, 
  Terminal, ShieldCheck
} from "lucide-react";

export default function TrainingPage() {
  const [status, setStatus] = useState({
    status: "idle",
    current_epoch: 0,
    total_epochs: 0,
    train_loss: 0,
    train_acc: 0,
    val_loss: 0,
    val_acc: 0,
    message: "Ready to initialize training.",
    history: []
  });

  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [architecture, setArchitecture] = useState("efficientnet_b0");

  // Poll status when active
  useEffect(() => {
    fetchStatus();
    
    const interval = setInterval(() => {
      fetchStatus();
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/train/status");
      if (!res.ok) throw new Error("Failed to fetch training status");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Failed to connect to training status endpoint.");
    } finally {
      setLoading(false);
    }
  };

  const triggerTraining = async () => {
    setTriggering(true);
    try {
      const res = await fetch(`http://localhost:8000/api/train?architecture=${architecture}`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Could not start background training");
      fetchStatus();
    } catch (err) {
      alert("Failed to start training. Check if the database folder has enough images.");
    } finally {
      setTriggering(false);
    }
  };

  const getPercentage = () => {
    if (status.total_epochs === 0) return 0;
    return Math.round((status.current_epoch / status.total_epochs) * 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-8 h-8 text-neonCyan animate-spin" />
        <p className="text-gray-400 text-sm font-mono">Connecting neural train bus...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 flex flex-col gap-8 text-left">
      
      {/* Back to Dashboard */}
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-neonCyan transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Header section */}
      <div className="flex flex-col gap-2 border-b border-gray-900 pb-6">
        <span className="text-xs font-mono text-neonCyan font-bold uppercase tracking-widest">Core Calibration</span>
        <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-3">
          <Cpu className="w-8 h-8 text-neonCyan" /> CNN Model Training
        </h1>
        <p className="text-sm text-gray-400">Fine-tune pre-trained models on local folders. Operates as a non-blocking background thread.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Controls & Status (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Action Card */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col gap-5">
            <h3 className="font-bold text-lg text-white">Model Status Control</h3>
            
            {/* Display State Badge */}
            <div className="flex items-center justify-between border-b border-gray-900/60 pb-3">
              <span className="text-xs text-gray-400 font-mono">Current State:</span>
              <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono uppercase tracking-wider ${
                status.status === "training" 
                  ? "bg-cyan-500/20 border border-cyan-500/40 text-neonCyan animate-pulse" 
                  : status.status === "completed" 
                  ? "bg-emerald-500/20 border border-emerald-500/40 text-neonGreen" 
                  : status.status === "failed" 
                  ? "bg-red-500/20 border border-red-500/40 text-red-400" 
                  : "bg-gray-900 border border-gray-800 text-gray-400"
              }`}>
                {status.status}
              </span>
            </div>

            {/* Architecture Selector */}
            <div className="flex flex-col gap-1.5 text-left">
              <span className="text-[10px] text-gray-500 font-mono tracking-wider">SELECT CNN ARCHITECTURE:</span>
              <select
                value={architecture}
                onChange={(e) => setArchitecture(e.target.value)}
                disabled={status.status === "training" || triggering}
                className="bg-gray-950 border border-gray-800 text-xs rounded-lg p-2.5 focus:border-neonCyan outline-none text-white font-medium disabled:opacity-50"
              >
                <option value="efficientnet_b0">EfficientNet-B0 (Highly Accurate, Default)</option>
                <option value="mobilenet_v2">MobileNet-V2 (Lightweight, Faster Training)</option>
                <option value="resnet50">ResNet-50 (Strong Feature Extractor)</option>
              </select>
            </div>

            {/* Main Trigger Button */}
            {status.status !== "training" ? (
              <button
                onClick={triggerTraining}
                disabled={triggering}
                className="w-full py-3 rounded-lg text-gray-900 bg-gradient-to-r from-neonCyan to-neonGreen hover:brightness-110 font-bold text-sm uppercase tracking-wider shadow-glowCyan transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4.5 h-4.5" /> {triggering ? "Starting Thread..." : "Train Classifier"}
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-cyan-950/20 border border-neonCyan/30 text-neonCyan text-xs justify-center font-mono">
                <RefreshCw className="w-4 h-4 animate-spin" /> Training is active in background...
              </div>
            )}

            {/* Logging message Console */}
            <div className="flex flex-col gap-1.5 text-left border-t border-gray-900 pt-4">
              <span className="text-[10px] text-gray-500 font-mono tracking-wider">CONSOLE LOG:</span>
              <div className="bg-gray-950 border border-gray-900 p-3 rounded-lg font-mono text-[10px] text-neonGreen/80 leading-relaxed min-h-16 flex items-start gap-1.5">
                <Terminal className="w-3.5 h-3.5 shrink-0 mt-0.5 text-neonGreen/50" />
                <span>{status.message}</span>
              </div>
            </div>
          </div>

          {/* Active progress tracker */}
          {status.status === "training" && (
            <div className="glass-panel p-6 rounded-2xl border border-cyan-950 flex flex-col gap-4">
              <h4 className="font-bold text-sm text-white flex items-center justify-between">
                <span>Fine-Tuning Epoch Progress</span>
                <span className="text-neonCyan font-mono">{getPercentage()}%</span>
              </h4>
              
              <div className="w-full h-2.5 bg-gray-950 border border-gray-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-neonCyan to-neonGreen transition-all duration-500"
                  style={{ width: `${getPercentage()}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-900/60 pt-4 text-xs font-mono">
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-500">Epoch Count:</span>
                  <span className="text-white font-bold">{status.current_epoch} / {status.total_epochs}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-500">Current Val Acc:</span>
                  <span className="text-neonGreen font-bold">{status.val_acc}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Complete message */}
          {status.status === "completed" && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-xl flex gap-3 text-left">
              <ShieldCheck className="w-5 h-5 text-neonGreen shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-gray-400">
                <span className="font-bold text-white block">Trained Weights Activated</span>
                The selected architecture weights have been saved and registered. Classification accuracies, quality score thresholds, and Grad-CAM activations are updated.
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Training Performance Charts (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col gap-6 text-left">
          <h3 className="font-bold text-lg text-white">Loss & Accuracy Curves</h3>
          
          {status.history.length < 2 ? (
            <div className="h-72 flex flex-col items-center justify-center gap-3 border border-dashed border-gray-900 rounded-xl bg-gray-950/20 text-gray-500 font-mono text-xs text-center p-8">
              <AlertCircle className="w-8 h-8 text-gray-600" />
              <span>Training graphs will render once at least 2 epochs are logged. Trigger training above to generate metrics.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-8 w-full">
              {/* Accuracy Chart */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Accuracy (%)</h4>
                <div className="h-44 w-full text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={status.history}>
                      <XAxis dataKey="epoch" stroke="#64748b" tickLine={false} />
                      <YAxis stroke="#64748b" domain={[0, 100]} tickLine={false} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={32} />
                      <Line type="monotone" dataKey="train_acc" name="Train Acc" stroke="#10b981" strokeWidth={2} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="val_acc" name="Val Acc" stroke="#06b6d4" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Loss Chart */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Loss (Cross Entropy)</h4>
                <div className="h-44 w-full text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={status.history}>
                      <XAxis dataKey="epoch" stroke="#64748b" tickLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={32} />
                      <Line type="monotone" dataKey="train_loss" name="Train Loss" stroke="#f59e0b" strokeWidth={2} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="val_loss" name="Val Loss" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
