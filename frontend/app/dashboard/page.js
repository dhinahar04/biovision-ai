"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Legend
} from "recharts";
import { 
  BarChart3, Database, Users, CheckCircle, ShieldAlert, Cpu, 
  HelpCircle, RefreshCw, AlertTriangle
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/dashboard`);
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError("Failed to retrieve dashboard metrics. Verify backend server.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 font-sans text-slate-750">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-500 text-sm font-mono">Compiling database metrics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="glass-panel max-w-xl mx-auto p-8 rounded-2xl border border-red-200 bg-white flex flex-col items-center gap-4 text-center mt-12">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
        <h2 className="text-xl font-bold text-slate-800">Metrics Connection Offline</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <button onClick={fetchStats} className="px-5 py-2.5 rounded-lg bg-blue-600 border border-blue-500 text-sm font-semibold hover:bg-blue-700 text-white shadow-sm">
          Retry Link
        </button>
      </div>
    );
  }

  // Format Recharts Arrays
  const classDistData = Object.entries(stats.class_distribution || {}).map(([name, count]) => ({
    name,
    count
  }));

  const patternDistData = Object.entries(stats.pattern_distribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  const datasetStatsData = Object.entries(stats.dataset_statistics || {}).map(([name, count]) => ({
    name,
    count
  }));

  // Constants
  const PIE_COLORS = ["#2563EB", "#0D9488", "#7C3AED"];

  return (
    <div className="flex flex-col gap-8 py-4 text-left font-sans text-slate-750">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="text-left">
          <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-widest">System HUD</span>
          <h1 className="text-3xl font-display font-extrabold tracking-tight mt-1 flex items-center gap-3 text-slate-900">
            <BarChart3 className="w-8 h-8 text-blue-600" /> System Analytics
          </h1>
          <p className="text-sm text-slate-500 font-sans">Overview of neural classification statistics, database volume, and calibration feedback logs.</p>
        </div>

        <div className="flex gap-2 font-mono">
          <Link href="/dataset" className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-700 transition-all shadow-sm">
            Manage Dataset
          </Link>
          <Link href="/training" className="px-4 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-bold uppercase tracking-wider text-blue-600 transition-all shadow-sm">
            Model Training
          </Link>
        </div>
      </div>

      {/* Warning if model is untrained */}
      {!stats.model_trained && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs text-amber-800">
            <span className="font-bold">Untrained Model Warning:</span> The CNN classifier is running in simulation mode with random weights. Please navigate to the <Link href="/training" className="underline font-bold text-blue-600 hover:text-blue-800">Model Training</Link> page to fine-tune the classifier.
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
          <span className="text-xs font-mono text-slate-400 font-bold tracking-wider">TOTAL UPLOADS</span>
          <span className="text-4xl font-display font-extrabold text-slate-900 mt-1">{stats.total_scans}</span>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">Scans logged in database</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
          <span className="text-xs font-mono text-slate-400 font-bold tracking-wider">FEEDBACK ACCURACY</span>
          <span className="text-4xl font-display font-extrabold text-teal-600 mt-1">{stats.feedback_accuracy}%</span>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">Matches on verified labels ({stats.total_feedback} logs)</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
          <span className="text-xs font-mono text-slate-400 font-bold tracking-wider">MEAN CONFIDENCE</span>
          <span className="text-4xl font-display font-extrabold text-blue-600 mt-1">{stats.average_confidence}%</span>
          <p className="text-[10px] text-slate-400 mt-2 font-mono font-bold">Mean neural Softmax confidence</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
          <span className="text-xs font-mono text-slate-400 font-bold tracking-wider">DATASET SAMPLES</span>
          <span className="text-4xl font-display font-extrabold text-purple-650 mt-1">{stats.total_dataset_samples}</span>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">Images logged in classes folder</p>
        </div>

      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
        
        {/* Class distribution chart */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col gap-4">
          <h3 className="font-display font-bold text-lg text-slate-900">Estimated Blood Group Frequency</h3>
          <p className="text-xs text-slate-500 font-sans">Distribution of all estimated blood groups recorded in system logs.</p>
          <div className="h-64 w-full text-[10px] mt-2">
            {stats.total_scans === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-mono">No prediction logs yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classDistData}>
                  <defs>
                    <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={0.85}/>
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: "rgba(0,0,0,0.01)" }}
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: 8, fontSize: 11, fontFamily: "monospace" }}
                  />
                  <Bar dataKey="count" fill="url(#cyanGrad)" stroke="#2563EB" strokeWidth={1} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pattern distribution chart */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col gap-4">
          <h3 className="font-display font-bold text-lg text-slate-900">Fingerprint Topology (Patterns)</h3>
          <p className="text-xs text-slate-500 font-sans">Classified distribution of Loop, Whorl, and Arch structures.</p>
          <div className="h-64 w-full text-[10px] mt-2 flex items-center justify-center">
            {stats.total_scans === 0 ? (
              <div className="text-slate-400 font-mono">No predictions logged.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={patternDistData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {patternDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: 8, fontSize: 11, fontFamily: "monospace" }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Dataset statistics chart */}
        <div className="lg:col-span-12 glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col gap-4">
          <h3 className="font-display font-bold text-lg text-slate-900">Local Training Dataset Distribution</h3>
          <p className="text-xs text-slate-500 font-sans">Size distribution of image classes currently residing in dataset directories.</p>
          
          <div className="h-64 w-full text-[10px] mt-2">
            {stats.total_dataset_samples === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-mono">No local dataset samples found.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datasetStatsData}>
                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.85}/>
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: "rgba(0,0,0,0.01)" }}
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: 8, fontSize: 11, fontFamily: "monospace" }}
                  />
                  <Bar dataKey="count" fill="url(#purpleGrad)" stroke="#7C3AED" strokeWidth={1} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
