"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Activity, BarChart2, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const API_BASE = "http://localhost:8000";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE}/history`);
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-mesh p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-6">
            <Link href="/predict">
              <button className="group p-4 glass rounded-2xl hover:bg-white/5 transition-all border-white/5">
                <ArrowLeft className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
              </button>
            </Link>
            <div>
              <h2 className="text-4xl font-black tracking-tighter">Archive <span className="text-gradient">Vault</span></h2>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Sequence Records</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 opacity-20">
             <ShieldCheck className="w-8 h-8" />
             <Zap className="w-8 h-8" />
             <Activity className="w-8 h-8" />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-24 glass-card rounded-[2.5rem]">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>
            </div>
            <p className="mt-8 text-[10px] font-bold tracking-[0.3em] uppercase text-white/30">Syncing database...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-32 glass-card rounded-[2.5rem] border-dashed border-white/5 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
            <Clock className="w-20 h-20 text-white/5 mx-auto mb-8 relative z-10" />
            <h4 className="text-xl font-bold tracking-tight text-white/40 mb-2 relative z-10">Data Vault Empty</h4>
            <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] relative z-10">No prediction sequences found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((item, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={item.id || `history-${idx}`}
                className="p-8 rounded-[2rem] glass-card flex flex-wrap items-center justify-between gap-8 hover:border-primary/20 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                   <Activity className="w-24 h-24" />
                </div>
                
                <div className="flex items-center gap-8 relative z-10">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center text-primary text-3xl font-black group-hover:bg-primary/10 transition-colors">
                      {item.predicted_class}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                       <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{item.mode} mode</span>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${item.confidence * 100}%` }}
                             className="h-full bg-primary"
                           />
                        </div>
                        <span className="text-xs font-bold text-white/80">{(item.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Confidence Score</span>
                    </div>
                  </div>
                </div>
                
                <Link href="/predict" className="relative z-10">
                  <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white text-white hover:text-black text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5 hover:border-white">
                    Decrypt Details
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

