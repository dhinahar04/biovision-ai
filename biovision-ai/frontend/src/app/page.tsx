"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Fingerprint, Eye, Activity, ShieldCheck, ArrowRight, Dna, Microscope, BrainCircuit } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden bg-mesh">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl w-full"
      >
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase">Next-Gen Biometric Intelligence</span>
          </motion.div>
          
          <h1 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter leading-none">
            BioVision <span className="text-gradient">AI</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/40 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Decoding human biology through <span className="text-white/80">advanced neural patterns</span>. 
            The future of biometric blood group prediction is here.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link href="/predict">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(56, 189, 248, 0.2)' }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-white text-black rounded-2xl text-lg font-bold flex items-center gap-3 transition-all"
              >
                Access System <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            
            <button className="px-10 py-5 glass rounded-2xl text-lg font-bold flex items-center gap-3 hover:bg-white/5 transition-all border-white/10">
              Technical Specs
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Fingerprint className="w-6 h-6" />}
            title="Dermal Analysis"
            desc="Deep learning ridge pattern identification with sub-millimeter precision."
            delay={0.4}
          />
          <FeatureCard 
            icon={<Eye className="w-6 h-6" />}
            title="Iris Texture Map"
            desc="Multi-spectral iris scanning for high-confidence biometric validation."
            delay={0.5}
          />
          <FeatureCard 
            icon={<BrainCircuit className="w-6 h-6" />}
            title="Neural Fusion"
            desc="Proprietary AI architecture combining multiple biometric data points."
            delay={0.6}
          />
        </div>

        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-12 opacity-30 grayscale contrast-125">
             <div className="flex items-center gap-2"><Dna className="w-5 h-5" /> <span className="font-bold tracking-widest text-sm">GENO-TECH</span></div>
             <div className="flex items-center gap-2"><Microscope className="w-5 h-5" /> <span className="font-bold tracking-widest text-sm">BIO-CORE</span></div>
             <div className="flex items-center gap-2"><Activity className="w-5 h-5" /> <span className="font-bold tracking-widest text-sm">VITAL-NET</span></div>
          </div>
          <p className="text-[10px] text-white/20 tracking-widest uppercase italic">
            For research and developmental purposes only.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="p-8 rounded-3xl glass border-white/5 group hover:border-primary/30 transition-colors relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        {icon}
      </div>
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 text-primary group-hover:bg-primary/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

