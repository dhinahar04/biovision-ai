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
    if (score >= 80) return "text-teal-600";
    if (score >= 60) return "text-emerald-500";
    if (score >= 40) return "text-amber-500";
    return "text-rose-500";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 font-sans text-slate-700">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-500 text-sm font-mono">Loading history indexes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel max-w-xl mx-auto p-8 rounded-2xl border border-red-200 bg-white flex flex-col items-center gap-4 text-center mt-12">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-slate-800">Database Link Offline</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <button onClick={fetchHistory} className="px-5 py-2.5 rounded-lg bg-blue-600 border border-blue-500 text-sm font-semibold hover:bg-blue-700 text-white shadow-sm">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-4 text-left font-sans text-slate-750">
      
      {/* Title Header */}
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
        <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-widest">Database Archives</span>
        <h1 className="text-3xl font-display font-extrabold tracking-tight mt-1 flex items-center gap-3 text-slate-900">
          <History className="w-8 h-8 text-blue-600" /> Prediction History
        </h1>
        <p className="text-sm text-slate-500 font-sans">Review all previously scanned dermatoglyphic markers and calibration feedbacks.</p>
      </div>

      {/* Main Grid List */}
      {history.length === 0 ? (
        <div className="glass-panel p-16 rounded-2xl text-center border border-slate-200 bg-white flex flex-col items-center gap-4 shadow-sm">
          <History className="w-16 h-16 text-slate-300 stroke-[1]" />
          <h3 className="font-display font-bold text-lg text-slate-900">No Database Entries Found</h3>
          <p className="text-sm text-slate-500 max-w-sm font-sans">You have not scanned any prints yet. Complete a new scan to initialize predictions database.</p>
          <Link href="/upload" className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all font-mono">
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
              className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row gap-5 items-center sm:items-start text-left shadow-sm"
            >
              {/* Thumbnail Display */}
              <div className="relative w-28 h-28 border border-slate-100 rounded-xl overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center shadow-inner">
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
                      <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">ID: BV-{item.id}</span>
                      <h3 className="font-display font-extrabold text-2xl text-slate-900 flex items-baseline gap-2 mt-0.5">
                        {item.predicted_blood_group}
                        <span className="text-xs text-blue-600 font-mono font-bold">({item.confidence}% confidence)</span>
                      </h3>
                    </div>
                    
                    <Link 
                      href={`/result/${item.id}`} 
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-blue-650 shadow-sm transition-all hover:scale-105"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1 text-[11px] font-mono font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" /> {formatDate(item.created_at)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-teal-600" /> QUALITY: <span className={getQualityColor(item.quality_score)}>{item.quality_score}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-600" /> PATTERN: {item.pattern_type}
                    </span>
                  </div>
                </div>

                {/* Feedback Indicator */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="font-bold">VERIFICATION STATUS:</span>
                  {item.actual_blood_group ? (
                    <span className="flex items-center gap-1 text-teal-600 font-bold uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Checked ({item.actual_blood_group})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600 font-bold uppercase animate-pulse">
                      <HelpCircle className="w-3.5 h-3.5" /> Awaiting Verification
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
