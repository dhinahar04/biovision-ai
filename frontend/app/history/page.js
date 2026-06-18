"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  History, Calendar, Award, Layers, CheckCircle2, ArrowUpRight, 
  HelpCircle, RefreshCw, AlertCircle
} from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/history");
      if (!res.ok) throw new Error("Failed to fetch history log");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      setError("Failed to retrieve scan history. Ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getQualityColor = (score) => {
    if (score >= 80) return "text-neonGreen";
    if (score >= 60) return "text-emerald-400";
    if (score >= 40) return "text-amber-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-8 h-8 text-neonCyan animate-spin" />
        <p className="text-gray-400 text-sm font-mono">Loading history indexes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel max-w-xl mx-auto p-8 rounded-2xl border border-red-900/30 flex flex-col items-center gap-4 text-center mt-12">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-white">Database Link Offline</h2>
        <p className="text-sm text-gray-400">{error}</p>
        <button onClick={fetchHistory} className="px-5 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-sm font-semibold hover:bg-gray-800 text-white">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-4 text-left">
      
      {/* Title Header */}
      <div className="flex flex-col gap-2 border-b border-gray-900 pb-6">
        <span className="text-xs font-mono text-neonCyan font-bold uppercase tracking-widest">Database Archives</span>
        <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-3">
          <History className="w-8 h-8 text-neonCyan" /> Prediction History
        </h1>
        <p className="text-sm text-gray-400">Review all previously scanned dermatoglyphic markers and calibration feedbacks.</p>
      </div>

      {/* Main Grid List */}
      {history.length === 0 ? (
        <div className="glass-panel p-16 rounded-2xl text-center border border-gray-800 flex flex-col items-center gap-4">
          <History className="w-16 h-16 text-gray-600 stroke-[1]" />
          <h3 className="font-bold text-lg text-white">No Database Entries Found</h3>
          <p className="text-sm text-gray-400 max-w-sm">You have not scanned any prints yet. Complete a new scan to initialize predictions database.</p>
          <Link href="/upload" className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-900 bg-gradient-to-r from-neonCyan to-neonGreen hover:brightness-110 shadow-glowCyan transition-all">
            Scan Fingerprint
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="glass-panel glass-panel-hover p-5 rounded-2xl border border-gray-800 flex flex-col sm:flex-row gap-5 items-center sm:items-start text-left"
            >
              {/* Thumbnail Display */}
              <div className="relative w-28 h-28 border border-gray-950 rounded-xl overflow-hidden shrink-0 bg-gray-950 flex items-center justify-center">
                <img 
                  src={`http://localhost:8000${item.gradcam_url}`} 
                  alt="Grad-CAM activation thumbnail"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Data Detail Block */}
              <div className="grow flex flex-col justify-between h-full gap-4 w-full">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">ID: BV-{item.id}</span>
                      <h3 className="font-extrabold text-2xl text-white flex items-baseline gap-2 mt-0.5">
                        {item.predicted_blood_group}
                        <span className="text-xs text-neonCyan font-mono font-medium">({item.confidence}% confidence)</span>
                      </h3>
                    </div>
                    
                    <Link 
                      href={`/result/${item.id}`} 
                      className="p-1.5 rounded-lg bg-gray-950 hover:bg-gray-900 border border-gray-900 text-neonCyan shadow-inner transition-all hover:scale-105"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1 text-[11px] font-medium text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neonCyan" /> {formatDate(item.created_at)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-neonGreen" /> Quality: <span className={getQualityColor(item.quality_score)}>{item.quality_score}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyberPurple" /> Pattern: {item.pattern_type}
                    </span>
                  </div>
                </div>

                {/* Feedback Indicator */}
                <div className="border-t border-gray-900/60 pt-3 flex items-center justify-between text-[10px] text-gray-500">
                  <span className="font-mono">VERIFICATION:</span>
                  {item.actual_blood_group ? (
                    <span className="flex items-center gap-1 text-neonGreen font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Checked ({item.actual_blood_group})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                      <HelpCircle className="w-3.5 h-3.5" /> Awaiting verified group
                    </span>
                  )}
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}
