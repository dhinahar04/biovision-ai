"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Activity, Target, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const API_BASE = "http://localhost:8000";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE}/analytics`);
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const distData = stats ? Object.entries(stats.group_distribution).map(([name, value]) => ({
    name,
    value
  })) : [];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      <div className="flex items-center gap-6 mb-12">
        <Link href="/">
          <button className="p-3 glass rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              icon={<Users className="w-6 h-6 text-primary" />}
              label="Total Predictions"
              value={stats.total_predictions}
            />
            <StatCard 
              icon={<Target className="w-6 h-6 text-emerald-400" />}
              label="Avg. Confidence"
              value={`${(stats.avg_confidence * 100).toFixed(1)}%`}
            />
            <StatCard 
              icon={<Activity className="w-6 h-6 text-amber-400" />}
              label="System Status"
              value="Healthy"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Distribution Bar Chart */}
            <div className="p-8 rounded-3xl glass border-white/5">
              <h4 className="text-lg font-semibold mb-8 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-primary" /> Prediction Distribution
              </h4>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distData}>
                    <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ background: '#121212', border: '1px solid #333', borderRadius: '12px' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {distData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution Pie Chart */}
            <div className="p-8 rounded-3xl glass border-white/5">
              <h4 className="text-lg font-semibold mb-8 flex items-center gap-2">
                <Activity className="w-5 h-5 text-secondary" /> Group Breakdown
              </h4>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#121212', border: '1px solid #333', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="p-8 rounded-3xl glass border-white/5 flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <span className="text-sm font-medium text-white/40 mb-1">{label}</span>
      <span className="text-4xl font-black text-gradient">{value}</span>
    </div>
  );
}
