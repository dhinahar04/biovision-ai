"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, History, Fingerprint, Eye, Loader2, BarChart3, AlertCircle, Activity, CheckCircle2, RefreshCcw, ShieldCheck, Zap } from 'lucide-react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Link from 'next/link';

const API_BASE = "http://localhost:8000";

export default function PredictPage() {
  const [mode, setMode] = useState('combined');
  const [fingerprint, setFingerprint] = useState<File | null>(null);
  const [eye, setEye] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const handlePredict = async () => {
    if (mode === 'fingerprint' && !fingerprint) return setError("Biometric data missing: Fingerprint required");
    if (mode === 'eye' && !eye) return setError("Biometric data missing: Iris scan required");
    if (mode === 'combined' && (!fingerprint || !eye)) return setError("Biometric data missing: Dual-factor input required");

    setError(null);
    setLoading(true);
    setScanning(true);

    const formData = new FormData();
    if (fingerprint) formData.append('fingerprint', fingerprint);
    if (eye) formData.append('eye', eye);
    formData.append('mode', mode);

    try {
      const res = await axios.post(`${API_BASE}/predict`, formData);
      // Artificial delay for scanning effect
      await new Promise(r => setTimeout(r, 2000));
      setResult(res.data);
      if (res.data.warning) {
        setError(res.data.warning);
      }
      // Clear inputs for next prediction
      setFingerprint(null);
      setEye(null);
    } catch (err: any) {
      console.error(err);
      if (!err.response) {
        setError("System Offline: Could not connect to the Bio-Engine backend.");
      } else {
        setError(`Processing Error: ${err.response.data?.detail || "Unrecognized pattern"}`);
      }
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  const getConfidenceStatus = (score: number) => {
    if (score > 0.6) return { label: "High Confidence", color: "text-emerald-400", bg: "bg-emerald-400/10" };
    if (score > 0.4) return { label: "Moderate Accuracy", color: "text-amber-400", bg: "bg-amber-400/10" };
    return { label: "Low Confidence", color: "text-rose-400", bg: "bg-rose-400/10" };
  };

  const chartData = result ? Object.entries(result.probabilities).map(([name, value]) => ({
    name,
    value: (value as number) * 100
  })) : [];

  return (
    <div className="min-h-screen bg-mesh p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-16">
          <Link href="/">
            <button className="group flex items-center gap-3 px-5 py-3 glass rounded-2xl hover:bg-white/5 transition-all border-white/5">
              <Home className="w-4 h-4 text-white/40 group-hover:text-primary transition-colors" />
              <span className="text-xs font-bold tracking-widest uppercase text-white/40 group-hover:text-white transition-colors">Return</span>
            </button>
          </Link>
          
          <div className="flex flex-col items-center">
            <h2 className="text-4xl font-black tracking-tighter mb-2">Neural <span className="text-gradient">Engine</span></h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">System Active</span>
            </div>
          </div>

          <Link href="/history">
            <button className="group flex items-center gap-3 px-5 py-3 glass rounded-2xl hover:bg-white/5 transition-all border-white/5">
              <span className="text-xs font-bold tracking-widest uppercase text-white/40 group-hover:text-white transition-colors">History</span>
              <History className="w-4 h-4 text-white/40 group-hover:text-secondary transition-colors" />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Input Section */}
          <section className="space-y-8">
            <div className="p-10 rounded-[2.5rem] glass-card space-y-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-right from-primary to-secondary opacity-20" />
              
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">Factor Selection</h3>
                </div>
                
                <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/5">
                  {['fingerprint', 'eye', 'combined'].map((m) => (
                    <button
                      key={m}
                      onClick={() => { setMode(m); setResult(null); }}
                      className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all ${
                        mode === m ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/5 text-white/30'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">Biometric Input</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {(mode === 'fingerprint' || mode === 'combined') && (
                    <UploadZone 
                      icon={<Fingerprint className="w-10 h-10" />}
                      label="Dermal Scan"
                      file={fingerprint}
                      onFileSelect={setFingerprint}
                      scanning={scanning && mode !== 'eye'}
                    />
                  )}
                  {(mode === 'eye' || mode === 'combined') && (
                    <UploadZone 
                      icon={<Eye className="w-10 h-10" />}
                      label="Iris Matrix"
                      file={eye}
                      onFileSelect={setEye}
                      scanning={scanning && mode !== 'fingerprint'}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handlePredict}
                  disabled={loading}
                  className="w-full py-6 bg-white text-black rounded-2xl text-lg font-black shadow-2xl hover:scale-[1.01] transition-all active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" /> RUNNING SEQUENCE...
                    </>
                  ) : (
                    <>
                      <Activity className="w-6 h-6" /> INITIALIZE PREDICTION
                    </>
                  )}
                </button>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-400 flex items-start gap-4"
                  >
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1">Security Alert</p>
                      <p className="text-sm opacity-80">{error}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </section>

          {/* Results Section */}
          <section className="relative">
            <AnimatePresence mode="wait">
              {!result && !loading ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[500px] flex flex-col items-center justify-center glass-card border-dashed border-white/5 rounded-[2.5rem] p-12 text-center"
                >
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/5">
                    <Activity className="w-10 h-10 text-white/10 animate-pulse" />
                  </div>
                  <h4 className="text-xl font-bold tracking-tight text-white/40 mb-2">Awaiting Neural Input</h4>
                  <p className="text-xs text-white/20 uppercase tracking-[0.2em]">Sequence Not Initialized</p>
                </motion.div>
              ) : result && !loading ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="p-10 rounded-[2.5rem] glass-card relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
                      <Activity className="w-40 h-40" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="flex items-center gap-2 mb-8">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-[10px] font-bold text-primary tracking-[0.3em] uppercase">Biological Match Found</span>
                      </div>
                      
                      <div className="relative mb-8">
                        <h2 className="text-[10rem] font-black leading-none tracking-tighter text-gradient">{result.predicted_class}</h2>
                        <div className="absolute -inset-4 blur-3xl bg-primary/10 -z-10" />
                      </div>

                      <div className={`px-6 py-2 rounded-full font-bold text-xs tracking-widest uppercase flex items-center gap-3 ${getConfidenceStatus(result.confidence).color} ${getConfidenceStatus(result.confidence).bg}`}>
                        <CheckCircle2 className="w-4 h-4" />
                        {getConfidenceStatus(result.confidence).label}: {(result.confidence * 100).toFixed(1)}%
                      </div>

                      <button 
                        onClick={() => {
                          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
                          const downloadAnchorNode = document.createElement('a');
                          downloadAnchorNode.setAttribute("href",     dataStr);
                          downloadAnchorNode.setAttribute("download", `BioVision_Report_${result.id}.json`);
                          document.body.appendChild(downloadAnchorNode);
                          downloadAnchorNode.click();
                          downloadAnchorNode.remove();
                        }}
                        className="mt-8 flex items-center gap-2 text-[10px] font-bold text-white/20 hover:text-primary transition-colors uppercase tracking-[0.2em]"
                      >
                        <RefreshCcw className="w-3 h-3" /> Download Neural Report
                      </button>
                    </div>
                  </div>

                  <div className="p-10 rounded-[2.5rem] glass-card">
                    <div className="flex justify-between items-center mb-10">
                      <h4 className="text-sm font-bold tracking-widest uppercase flex items-center gap-3 text-white/60">
                        <BarChart3 className="w-4 h-4 text-primary" /> Probability Distribution
                      </h4>
                      <div className="text-[10px] font-bold text-white/20 tracking-[0.2em] uppercase">Neural Confidence Map</div>
                    </div>
                    
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <XAxis 
                            dataKey="name" 
                            stroke="rgba(255,255,255,0.2)" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}
                          />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                            contentStyle={{ 
                              background: 'rgba(10,10,10,0.9)', 
                              border: '1px solid rgba(255,255,255,0.1)', 
                              borderRadius: '20px',
                              backdropFilter: 'blur(10px)',
                              padding: '12px'
                            }}
                          />
                          <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={40}>
                            {chartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.name === result.predicted_class ? 'url(#activeGradient)' : 'rgba(255,255,255,0.03)'} 
                                stroke={entry.name === result.predicted_class ? 'rgba(56, 189, 248, 0.5)' : 'transparent'}
                              />
                            ))}
                          </Bar>
                          <defs>
                            <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#38bdf8" />
                              <stop offset="100%" stopColor="#818cf8" />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <button 
                      onClick={() => setResult(null)}
                      className="w-full mt-8 py-4 glass rounded-2xl text-[10px] font-bold tracking-[0.3em] uppercase text-white/40 hover:text-white transition-all flex items-center justify-center gap-3 border-white/5"
                    >
                      <RefreshCcw className="w-3 h-3" /> Reset Sequence
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </div>
  );
}

function UploadZone({ icon, label, file, onFileSelect, scanning }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files?.[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) onFileSelect(blob);
        break;
      }
    }
  };

  return (
    <div 
      tabIndex={0}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
      className={`relative group h-60 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 cursor-pointer overflow-hidden outline-none focus:border-primary/40 ${
        file || isDragging ? 'border-primary/40 bg-primary/5' : isHovered ? 'border-primary/20 bg-white/5' : 'border-white/5 bg-white/[0.01]'
      } ${isDragging ? 'scale-[1.02] shadow-2xl shadow-primary/10' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input 
        type="file" 
        className="absolute inset-0 opacity-0 cursor-pointer z-30" 
        onChange={(e) => {
          if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
        }}
        accept="image/*"
      />
      
      {scanning && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="scanline" />
        </div>
      )}

      {file ? (
        <div className="flex flex-col items-center gap-4 relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-2 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-white/80 block max-w-[150px] truncate">{file.name}</span>
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Captured</span>
          </div>
          <button 
            className="px-4 py-2 glass rounded-xl text-[10px] font-bold tracking-widest uppercase text-white/40 hover:text-white transition-all border-white/5"
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
            }}
          >Replace</button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className={`p-5 rounded-2xl transition-all duration-500 ${isHovered ? 'bg-primary/10 text-primary scale-110' : 'bg-white/5 text-white/20'}`}>
            {icon}
          </div>
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-white/60 tracking-widest uppercase block">{label}</span>
            <span className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em] group-hover:text-primary/50 transition-colors">Awaiting Scan</span>
          </div>
        </div>
      )}
      
      {/* Decorative corner elements */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/5 group-hover:border-primary/20 transition-colors" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/5 group-hover:border-primary/20 transition-colors" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/5 group-hover:border-primary/20 transition-colors" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/5 group-hover:border-primary/20 transition-colors" />
    </div>
  );
}

