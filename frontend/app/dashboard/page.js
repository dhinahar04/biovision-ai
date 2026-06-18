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
      const res = await fetch("http://localhost:8000/api/dashboard");
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-8 h-8 text-neonCyan animate-spin" />
        <p className="text-gray-400 text-sm font-mono">Compiling database metrics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="glass-panel max-w-xl mx-auto p-8 rounded-2xl border border-red-900/30 flex flex-col items-center gap-4 text-center mt-12">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
        <h2 className="text-xl font-bold text-white">Metrics Connection Offline</h2>
        <p className="text-sm text-gray-400">{error}</p>
        <button onClick={fetchStats} className="px-5 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-sm font-semibold hover:bg-gray-800 text-white">
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
  const PIE_COLORS = ["#06b6d4", "#10b981", "#6366f1"];
  const BAR_COLORS = ["#0e7490", "#0891b2", "#06b6d4", "#22d3ee", "#15803d", "#16a34a", "#10b981", "#34d399"];

  return (
    <div className="flex flex-col gap-8 py-4 text-left">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-900 pb-6">
        <div className="text-left">
          <span className="text-xs font-mono text-neonCyan font-bold uppercase tracking-widest">System HUD</span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-neonCyan" /> System Analytics
          </h1>
          <p className="text-sm text-gray-400">Overview of neural classification statistics, database volume, and calibration feedback logs.</p>
        </div>

        <div className="flex gap-2">
          <Link href="/dataset" className="px-4 py-2 border border-gray-800 bg-gray-950 hover:bg-gray-900 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-300 transition-all">
            Manage Dataset
          </Link>
          <Link href="/training" className="px-4 py-2 border border-cyan-800/40 bg-cyan-950/20 hover:bg-cyan-950/40 rounded-lg text-xs font-bold uppercase tracking-wider text-neonCyan shadow-inner transition-all">
            Model Training
          </Link>
        </div>
      </div>

      {/* Warning if model is untrained */}
      {!stats.model_trained && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-xl flex items-center gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-amber-400">Untrained Model Warning:</span> The CNN blood group classifier is running in simulation mode with random weights. Please navigate to the <Link href="/training" className="underline font-bold text-neonCyan hover:text-white">Model Training</Link> page to fine-tune the classifier.
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1 border border-gray-800">
          <span className="text-xs font-mono text-gray-500 font-semibold tracking-wider">TOTAL UPLOADS</span>
          <span className="text-4xl font-extrabold text-white mt-1">{stats.total_scans}</span>
          <p className="text-[10px] text-gray-400 mt-2">Active fingerprint entries logged in db.</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1 border border-gray-800">
          <span className="text-xs font-mono text-gray-500 font-semibold tracking-wider">FEEDBACK ACCURACY</span>
          <span className="text-4xl font-extrabold text-neonGreen mt-1">{stats.feedback_accuracy}%</span>
          <p className="text-[10px] text-gray-400 mt-2">Matches verified by clinical labels ({stats.total_feedback} logs).</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1 border border-gray-800">
          <span className="text-xs font-mono text-gray-500 font-semibold tracking-wider">MEAN CONFIDENCE</span>
          <span className="text-4xl font-extrabold text-neonCyan mt-1">{stats.average_confidence}%</span>
          <p className="text-[10px] text-gray-400 mt-2">Mean Softmax classification confidence.</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1 border border-gray-800">
          <span className="text-xs font-mono text-gray-500 font-semibold tracking-wider">DATASET SAMPLES</span>
          <span className="text-4xl font-extrabold text-cyberPurple mt-1">{stats.total_dataset_samples}</span>
          <p className="text-[10px] text-gray-400 mt-2">Images currently available in classes folder.</p>
        </div>

      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Class distribution chart */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col gap-4">
          <h3 className="font-bold text-lg text-white">Estimated Blood Group Frequency</h3>
          <p className="text-xs text-gray-400">Distribution of all estimated blood groups recorded in system logs.</p>
          <div className="h-64 w-full text-[10px] mt-2">
            {stats.total_scans === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 font-mono">No prediction logs yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classDistData}>
                  <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pattern distribution chart */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col gap-4">
          <h3 className="font-bold text-lg text-white">Fingerprint Topology (Patterns)</h3>
          <p className="text-xs text-gray-400">Classified distribution of Loop, Whorl, and Arch structures.</p>
          <div className="h-64 w-full text-[10px] mt-2 flex items-center justify-center">
            {stats.total_scans === 0 ? (
              <div className="text-gray-500 font-mono">No predictions logged.</div>
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
                  >
                    {patternDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Dataset statistics chart */}
        <div className="lg:col-span-12 glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col gap-4">
          <h3 className="font-bold text-lg text-white">Local Training Dataset Distribution</h3>
          <p className="text-xs text-gray-400">Size distribution of image classes currently residing in dataset directories.</p>
          
          <div className="h-64 w-full text-[10px] mt-2">
            {stats.total_dataset_samples === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 font-mono">No local dataset samples found.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datasetStatsData}>
                  <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {datasetStatsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
