"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Fingerprint, Cpu, BarChart3, Database, Award, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 py-6">
      
      {/* Hero Section */}
      <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-800/60 bg-cyan-950/30 text-xs font-semibold text-neonCyan w-fit"
          >
            <Shield className="w-3.5 h-3.5" /> BioVision AI Neural Core v1.2 Active
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]"
          >
            Predicting Blood Groups via <span className="bg-gradient-to-r from-neonCyan to-neonGreen bg-clip-text text-transparent">Fingerprint AI</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-gray-400 max-w-xl leading-relaxed"
          >
            Analyze ink-on-paper fingerprint structures to estimate ABO blood group classifications. Harnesses OpenCV ridge-enhancement, orientation topology classification, and PyTorch deep convolutional networks.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 mt-2"
          >
            <Link 
              href="/upload" 
              className="flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-bold text-gray-900 bg-gradient-to-r from-neonCyan to-neonGreen hover:brightness-110 shadow-glowCyan transition-all"
            >
              Start Diagnostic Scan <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/about" 
              className="px-6 py-3.5 rounded-lg text-sm font-semibold text-gray-300 border border-gray-800 bg-gray-950/45 hover:bg-gray-900/50 hover:text-white transition-all"
            >
              Read Scientific Methodology
            </Link>
          </motion.div>
        </div>

        {/* Floating Scan Visualizer */}
        <div className="lg:col-span-5 flex justify-center relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-2xl border border-cyan-800/40 bg-gray-950/60 p-8 flex items-center justify-center shadow-2xl glass-panel animate-scanner"
          >
            <Fingerprint className="w-48 h-48 sm:w-60 sm:h-60 text-neonCyan/25 stroke-[1]" />
            
            <div className="absolute inset-0 border border-neonCyan/30 rounded-2xl pointer-events-none opacity-40 shadow-glowCyan" />
            
            {/* HUD Status display */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-gray-500 tracking-wider">
              <span>SCANNER READY</span>
              <span className="text-neonCyan animate-pulse">RESOLVING RIDGE FREQUENCY...</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="flex flex-col gap-12 border-t border-gray-900 pt-16">
        <div className="text-center flex flex-col gap-3">
          <h2 className="text-3xl font-bold tracking-tight">Full-Stack Core Functionality</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">Explore the integrated features powered by classical computer vision pipelines and trained convolutional networks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="glass-panel glass-panel-hover p-6 rounded-xl flex flex-col gap-4 text-left">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-neonCyan/30 flex items-center justify-center text-neonCyan shadow-glowCyan">
              <Fingerprint className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-bold text-lg text-white">CLAHE Ridge Enhancement</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Converts ink scans to grayscale, applies bilateral filters, and enhances low-contrast print valleys using OpenCV Adaptive Histogram Equalization.</p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-xl flex flex-col gap-4 text-left">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-neonGreen/30 flex items-center justify-center text-neonGreen shadow-glowGreen">
              <Cpu className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-bold text-lg text-white">Grad-CAM Activation</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Computes gradients through PyTorch convolutional feature layers to overlay visual heatmaps, highlighting the exact ridges driving the prediction.</p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-xl flex flex-col gap-4 text-left">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-cyberPurple/30 flex items-center justify-center text-cyberPurple shadow-glowCyan">
              <BarChart3 className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-bold text-lg text-white">Feature Analysis</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Measures local orientation entropy to classify Loop, Whorl, and Arch pattern structures while scoring contrast density out of 100.</p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-xl flex flex-col gap-4 text-left">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-neonCyan/30 flex items-center justify-center text-neonCyan shadow-glowCyan">
              <Database className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-bold text-lg text-white">Feedback Corrections</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Allows users to submit verified blood groups to store local feedback loops, generating real-time accuracy indicators on the admin board.</p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-xl flex flex-col gap-4 text-left">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-neonGreen/30 flex items-center justify-center text-neonGreen shadow-glowGreen">
              <Award className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-bold text-lg text-white">Dynamic Model Training</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Administrators can directly upload new dataset samples to expand folders, trigger background training, and monitor epoch performance charts.</p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-xl flex flex-col gap-4 text-left">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-cyberPurple/30 flex items-center justify-center text-cyberPurple shadow-glowCyan">
              <Shield className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-bold text-lg text-white">PDF Clinical Summary</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Compiles original prints, CLAHE ridge filters, Grad-CAM attention heatmaps, class probability scores, and safety disclaimers into downloadable PDFs.</p>
          </div>

        </div>
      </section>

      {/* Info CTA */}
      <section className="glass-panel p-8 md:p-12 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center border border-gray-800">
        <div className="md:col-span-8 text-left flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-neonGreen">Research Tool Only</span>
          <h3 className="text-2xl font-bold tracking-tight text-white">Understanding ABO-Ridge Association</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Historical anthropological studies hypothesize dermatoglyphic correlations (fingerprint ridge density, pattern counts) with certain biological markers like ABO blood group types. This app employs computer vision to explore these structural relationships.
          </p>
        </div>
        <div className="md:col-span-4 flex justify-end">
          <Link 
            href="/about" 
            className="w-full md:w-auto px-6 py-3.5 rounded-lg text-sm font-bold text-white border border-cyan-800/40 hover:bg-cyan-950/20 text-center transition-all"
          >
            Learn Dermatoglyphics
          </Link>
        </div>
      </section>

    </div>
  );
}
