"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Fingerprint, Cpu, BarChart3, Database, 
  Award, ArrowRight, Zap, Binary, FileText, 
  RefreshCw, Layers, CheckCircle2, ChevronRight, Play, Pause,
  Sliders, ShieldCheck, Activity, Terminal
} from "lucide-react";

// Interactive 3D Perspective Card Component
function TiltCard({ children, className = "" }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - card.left) / card.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - card.top) / card.height - 0.5; // -0.5 to 0.5
    setCoords({ x, y });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCoords({ x: 0, y: 0 });
      }}
      className={`glass-panel rounded-2xl p-6 transition-all duration-350 ease-out relative overflow-hidden select-none bg-white border border-slate-200 shadow-sm ${className}`}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateY(${coords.x * 12}deg) rotateX(${coords.y * -12}deg) translateZ(8px)`
          : "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)",
        boxShadow: isHovered
          ? "0 20px 40px -10px rgba(37, 99, 235, 0.08), 0 0 30px rgba(37, 99, 235, 0.03)"
          : "0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 10px 15px -3px rgba(0, 0, 0, 0.02)",
        borderColor: isHovered ? "rgba(37, 99, 235, 0.25)" : "#E2E8F0",
        transformStyle: "preserve-3d",
      }}
    >
      <div style={{ transform: isHovered ? "translateZ(25px)" : "translateZ(0px)", transition: "transform 0.25s ease-out" }}>
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  const [scanMode, setScanMode] = useState("raw");
  const [isAutoScanning, setIsAutoScanning] = useState(true);
  const [telemetry, setTelemetry] = useState({
    density: 74,
    entropy: 4.8,
    accuracy: 88.4,
    records: 412
  });

  const [logs, setLogs] = useState([
    "System Initialized.",
    "Database SQLite loaded: biovision.db",
    "Model weights verified: blood_group_model.pth"
  ]);

  const deckRef = useRef(null);
  const [deckCoords, setDeckCoords] = useState({ x: 0, y: 0 });
  const [deckHovered, setDeckHovered] = useState(false);

  const handleDeckMouseMove = (e) => {
    if (!deckRef.current) return;
    const rect = deckRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setDeckCoords({ x, y });
  };

  // Pipeline stages descriptions
  const stages = [
    { id: "raw", label: "Scan", desc: "Pixel Buffer", icon: Fingerprint },
    { id: "denoise", label: "Denoise", desc: "Bilateral filter", icon: Sliders },
    { id: "clahe", label: "Enhance", desc: "CLAHE Grid", icon: Zap },
    { id: "activation", label: "Inference", desc: "EfficientNet", icon: Cpu },
    { id: "report", label: "Report", desc: "PDF Summary", icon: FileText }
  ];

  // Auto scan sequencer simulating real-time processing states
  useEffect(() => {
    if (!isAutoScanning) return;
    const modes = ["raw", "denoise", "clahe", "activation", "report"];
    const interval = setInterval(() => {
      setScanMode((prev) => {
        const nextIdx = (modes.indexOf(prev) + 1) % modes.length;
        const nextMode = modes[nextIdx];
        
        // Log generation matching scanner mode
        const timestamp = new Date().toLocaleTimeString();
        let logMsg = "";
        switch (nextMode) {
          case "raw":
            logMsg = `[${timestamp}] SCANNER: Awaiting fingerprint buffer...`;
            break;
          case "denoise":
            logMsg = `[${timestamp}] OPENCV: Applying bilateral filter (noise reduction)...`;
            break;
          case "clahe":
            logMsg = `[${timestamp}] OPENCV: Contrast limit adaptive equalization applied.`;
            break;
          case "activation":
            logMsg = `[${timestamp}] PYTORCH: Model forward feed. Val Loss: 0.084.`;
            break;
          case "report":
            logMsg = `[${timestamp}] REPORT: Confidence score calculated. Ready to compile.`;
            break;
        }
        
        setLogs(prevLogs => {
          const updated = [...prevLogs, logMsg];
          if (updated.length > 5) updated.shift(); // Keep last 5 items
          return updated;
        });

        return nextMode;
      });

      setTelemetry(prev => ({
        density: Math.min(100, Math.max(40, prev.density + Math.floor(Math.random() * 5) - 2)),
        entropy: parseFloat(Math.min(10, Math.max(1, prev.entropy + (Math.random() * 0.2 - 0.1))).toFixed(2)),
        accuracy: parseFloat((88.2 + Math.random() * 0.6).toFixed(2)),
        records: prev.records + (Math.random() > 0.95 ? 1 : 0)
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, [isAutoScanning]);

  const toggleAutoScan = () => setIsAutoScanning(!isAutoScanning);

  return (
    <div className="flex flex-col gap-20 md:gap-26 py-4 select-none">
      
      {/* 3D Hero Section */}
      <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Hero Title, Description & AI Diagram */}
        <div className="lg:col-span-6 flex flex-col gap-6 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/50 text-xs font-mono font-bold text-blue-600 w-fit shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-blue-500 animate-pulse" /> BIOVISION SECURE SYSTEM PROT
          </motion.div>

          <div className="flex flex-col gap-3">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-5.5xl font-display font-extrabold tracking-tight leading-[1.08] text-slate-900"
            >
              <span className="bg-gradient-to-r from-slate-950 via-slate-800 to-indigo-950 bg-clip-text text-transparent">BioVision</span>
              <span className="ml-2.5 font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-100 bg-blue-50/20 px-2 rounded-xl text-3xl sm:text-4xl align-middle">
                AI
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-slate-500 max-w-xl leading-relaxed font-sans"
            >
              Advanced dermatoglyphic research suite mapping ridge orientation topologies to predict ABO blood group classifications with PyTorch.
            </motion.p>
          </div>

          {/* INTERACTIVE AI PIPELINE FLOW DIAGRAM (Fills the first half nicely) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="p-5 border border-slate-200/80 bg-white/70 rounded-2xl shadow-sm flex flex-col gap-3.5 max-w-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-500" /> Pipeline Flow Diagnostics
              </span>
              <span className="text-[9px] font-mono text-slate-400">Step {stages.findIndex(s => s.id === scanMode) + 1}/5</span>
            </div>

            {/* Horizontal flowchart grid */}
            <div className="flex items-center justify-between gap-1 py-1 relative">
              {stages.map((stg, idx) => {
                const IconComponent = stg.icon;
                const isCurrent = scanMode === stg.id;
                const isPassed = stages.findIndex(s => s.id === scanMode) >= idx;

                return (
                  <div key={stg.id} className="flex items-center flex-1 last:flex-initial relative">
                    <div className="flex flex-col items-center gap-1 relative z-10">
                      <div 
                        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-350 shadow-sm ${
                          isCurrent 
                            ? "bg-blue-600 border-blue-600 text-white shadow-blue-200 scale-110" 
                            : isPassed 
                            ? "bg-blue-50 border-blue-200 text-blue-600" 
                            : "bg-white border-slate-200 text-slate-400"
                        }`}
                        title={stg.label}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-800 font-sans tracking-tight">{stg.label}</span>
                      <span className="text-[7.5px] text-slate-400 font-mono hidden sm:inline">{stg.desc}</span>
                    </div>

                    {/* Connecting dotted line */}
                    {idx < stages.length - 1 && (
                      <div className="h-0.5 border-t border-dashed flex-1 mx-1.5 transition-colors duration-300 relative top-[-10px] -z-10 border-slate-200" />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 mt-1"
          >
            <Link 
              href="/upload" 
              className="group flex items-center gap-2 px-5.5 py-3.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg hover:shadow-blue-200/50 active:scale-[0.98] transition-all duration-200"
            >
              Analyze Fingerprint 
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              href="/about" 
              className="px-5.5 py-3.5 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 shadow-sm active:scale-[0.98] transition-all duration-200"
            >
              Science & Research
            </Link>
          </motion.div>
        </div>

        {/* Right Column: 3D COMMAND CENTER DECK (Interactive Console) */}
        <div 
          ref={deckRef}
          onMouseMove={handleDeckMouseMove}
          onMouseEnter={() => setDeckHovered(true)}
          onMouseLeave={() => {
            setDeckHovered(false);
            setDeckCoords({ x: 0, y: 0 });
          }}
          className="lg:col-span-6 flex justify-center relative perspective-[1200px]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotateX: 3 }}
            animate={{ opacity: 1, scale: 1, rotateX: deckHovered ? deckCoords.y * -12 : 0, rotateY: deckHovered ? deckCoords.x * 12 : 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 18 }}
            className="w-full max-w-[490px] border border-slate-200 bg-white rounded-3xl p-5.5 shadow-xl flex flex-col gap-5 relative overflow-hidden transform-gpu"
            style={{
              transformStyle: "preserve-3d",
              boxShadow: deckHovered 
                ? "0 25px 50px -15px rgba(37,99,235,0.08), 0 0 35px rgba(37,99,235,0.03)"
                : "0 15px 35px -10px rgba(0,0,0,0.03)"
            }}
          >
            {/* Holographic glowing borders */}
            <div className="absolute inset-0 border border-blue-500/10 rounded-3xl pointer-events-none opacity-45 shadow-glowCyan" />
            
            {/* Console Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3" style={{ transform: "translateZ(15px)" }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest">DIAGNOSTIC TELEMETRY STATE</span>
              </div>
              <button 
                onClick={toggleAutoScan}
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-550 transition-all"
                title={isAutoScanning ? "Pause Loop" : "Play Loop"}
              >
                {isAutoScanning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>

            {/* Interactive Visualizer & Mode Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              
              {/* Visualizer Display Box (Left 7 Columns) */}
              <div 
                className="sm:col-span-7 aspect-square rounded-2xl bg-slate-50 border border-slate-200/60 p-5 flex items-center justify-center relative overflow-hidden animate-scanner select-none"
                style={{ transform: "translateZ(30px)" }}
              >
                {/* Simulated coordinate background grid */}
                <div className="absolute inset-0 opacity-[0.06] cyber-grid pointer-events-none" />
                
                {/* Dynamic scanner SVG */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transition-all duration-300 filter drop-shadow-md" viewBox="0 0 120 120" fill="none">
                    {/* Glowing activation heatmap */}
                    {scanMode === "activation" && (
                      <circle cx="60" cy="70" r="28" fill="url(#camGlow)" opacity="0.85" className="transition-all duration-500 animate-pulse" />
                    )}
                    
                    {/* Pattern base lines */}
                    <path d="M 25,95 C 25,45, 95,45, 95,95 C 95,105, 80,108, 80,120" stroke={scanMode === "raw" ? "#CBD5E1" : scanMode === "denoise" ? "#94A3B8" : scanMode === "clahe" ? "#2563EB" : "#1E3A8A"} strokeWidth={scanMode === "clahe" || scanMode === "activation" || scanMode === "report" ? "3.2" : "2"} strokeLinecap="round" className="transition-all duration-300" />
                    <path d="M 35,95 C 35,55, 85,55, 85,95 C 85,103, 70,105, 70,120" stroke={scanMode === "raw" ? "#CBD5E1" : scanMode === "denoise" ? "#94A3B8" : scanMode === "clahe" ? "#2563EB" : "#1E3A8A"} strokeWidth={scanMode === "clahe" || scanMode === "activation" || scanMode === "report" ? "3.2" : "2"} strokeLinecap="round" className="transition-all duration-300" />
                    <path d="M 45,95 C 45,65, 75,65, 75,95 C 75,101, 60,103, 60,120" stroke={scanMode === "raw" ? "#E2E8F0" : scanMode === "denoise" ? "#A3AED0" : scanMode === "clahe" ? "#3B82F6" : "#2563EB"} strokeWidth={scanMode === "clahe" || scanMode === "activation" || scanMode === "report" ? "2.8" : "1.8"} strokeLinecap="round" className="transition-all duration-300" />
                    <path d="M 55,95 C 55,75, 65,75, 65,95" stroke={scanMode === "raw" ? "#E2E8F0" : scanMode === "denoise" ? "#CBD5E1" : scanMode === "clahe" ? "#60A5FA" : "#3B82F6"} strokeWidth={scanMode === "clahe" || scanMode === "activation" || scanMode === "report" ? "2.5" : "1.5"} strokeLinecap="round" className="transition-all duration-300" />
                    
                    {/* Arch boundaries */}
                    <path d="M 15,105 C 30,80, 30,60, 15,35" stroke={scanMode === "raw" ? "#E2E8F0" : scanMode === "denoise" ? "#CBD5E1" : scanMode === "clahe" ? "#93C5FD" : "#60A5FA"} strokeWidth="1.5" className="transition-all duration-300" />
                    <path d="M 105,105 C 90,80, 90,60, 105,35" stroke={scanMode === "raw" ? "#E2E8F0" : scanMode === "denoise" ? "#CBD5E1" : scanMode === "clahe" ? "#93C5FD" : "#60A5FA"} strokeWidth="1.5" className="transition-all duration-300" />

                    <defs>
                      <radialGradient id="camGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity="0.45" />
                        <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                  </svg>
                  
                  {/* Crosshairs overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none">
                    <div className="w-full border-t border-dashed border-blue-500/25 absolute" />
                    <div className="h-full border-l border-dashed border-blue-500/25 absolute" />
                    <div className="w-10 h-10 border border-blue-400/40 rounded-full absolute" />
                  </div>
                </div>
              </div>

              {/* Mode Selectors (Right 5 Columns) */}
              <div className="sm:col-span-5 flex flex-col gap-3 text-left font-mono" style={{ transform: "translateZ(20px)" }}>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider">PIPELINE MONITOR</span>
                <div className="flex flex-col gap-1.5">
                  {[
                    { id: "raw", label: "Raw Scan Input" },
                    { id: "denoise", label: "Bilateral Filter" },
                    { id: "clahe", label: "CLAHE Enhanced" },
                    { id: "activation", label: "PyTorch Inference" },
                    { id: "report", label: "PDF Report ready" }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setScanMode(m.id);
                        setIsAutoScanning(false);
                      }}
                      className={`w-full px-2.5 py-1.8 text-left rounded-lg border transition-all text-[9.5px] font-semibold flex items-center justify-between ${
                        scanMode === m.id 
                          ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm" 
                          : "bg-white border-slate-150 hover:bg-slate-50 text-slate-655"
                      }`}
                    >
                      <span>{m.label}</span>
                      {scanMode === m.id && <ChevronRight className="w-3 h-3 text-blue-500 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom HUD simulated stats */}
            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 font-mono text-[9px] text-left text-slate-500" style={{ transform: "translateZ(10px)" }}>
              <div className="flex flex-col bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                <span className="text-slate-400 uppercase tracking-widest text-[7.5px]">RIDGE SCORE</span>
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1 mt-0.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  {telemetry.density}%
                </span>
              </div>
              <div className="flex flex-col bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                <span className="text-slate-400 uppercase tracking-widest text-[7.5px]">ENTROPY RATIO</span>
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1 mt-0.5">
                  <Binary className="w-3.5 h-3.5 text-teal-500" />
                  {telemetry.entropy}
                </span>
              </div>
              <div className="flex flex-col bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                <span className="text-slate-400 uppercase tracking-widest text-[7.5px]">EST. ACCURACY</span>
                <span className="font-bold text-blue-655 text-xs flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                  {telemetry.accuracy}%
                </span>
              </div>
            </div>

            {/* SIMULATED SYSTEM LOGGING TERMINAL */}
            <div 
              className="border border-slate-200 bg-slate-900 rounded-xl p-3 text-left flex flex-col gap-1 shadow-inner h-28 overflow-hidden font-mono"
              style={{ transform: "translateZ(15px)" }}
            >
              <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1 text-[8.5px] text-slate-400">
                <Terminal className="w-3 h-3 text-slate-400" /> SYSTEM LOGGER OUTPUT
              </div>
              <div className="flex flex-col gap-1 overflow-y-auto text-[8px] text-slate-300 leading-normal animate-pulse">
                {logs.map((log, idx) => (
                  <div key={idx} className="transition-all duration-350 opacity-90 truncate">
                    <span className="text-teal-400 select-none">&gt;&gt;</span> {log}
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Unique Design Features Grid */}
      <section className="flex flex-col gap-12 border-t border-slate-200/50 pt-14">
        <div className="text-center flex flex-col gap-2.5">
          <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-widest">BioVision Core Features</span>
          <h2 className="text-3xl font-display font-bold tracking-tight text-slate-900">Custom Architectural Integration</h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto font-sans">Hover over each clinical module to experience cursor-driven 3D parallax depth.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <TiltCard>
            <div className="flex flex-col gap-4 text-left h-full justify-between">
              <div className="flex flex-col gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <Fingerprint className="w-5.5 h-5.5 stroke-[1.5]" />
                </div>
                <h3 className="font-display font-extrabold text-base text-slate-900 tracking-tight">OpenCV CLAHE Engine</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Automatically processes ink prints to grayscale, normalizes contrast via Contrast Limited Adaptive Histogram Equalization, and applies bilateral filters to purge paper scanner noise.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-blue-600 font-bold mt-1">
                <span>ACTIVE PIPELINE</span> <Zap className="w-3 h-3" />
              </div>
            </div>
          </TiltCard>

          <TiltCard>
            <div className="flex flex-col gap-4 text-left h-full justify-between">
              <div className="flex flex-col gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shadow-sm">
                  <Cpu className="w-5.5 h-5.5 stroke-[1.5]" />
                </div>
                <h3 className="font-display font-extrabold text-base text-slate-900 tracking-tight">PyTorch Activation Maps</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Computes backpropagated gradients through final convolution maps to output detailed Grad-CAM visual heatmaps, targeting which ridge coordinates influence the deep networks.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-violet-600 font-bold mt-1">
                <span>NEURAL VISUALIZER</span> <Layers className="w-3 h-3" />
              </div>
            </div>
          </TiltCard>

          <TiltCard>
            <div className="flex flex-col gap-4 text-left h-full justify-between">
              <div className="flex flex-col gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-sm">
                  <BarChart3 className="w-5.5 h-5.5 stroke-[1.5]" />
                </div>
                <h3 className="font-display font-extrabold text-base text-slate-900 tracking-tight">Multi-Print Fusion Ensemble</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Collects fingerprints from multiple fingers to combine prediction percentages. Eliminates noise bias by applying probability-weighted averages to ensure consistent accuracy.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-teal-650 font-bold mt-1">
                <span>ENSEMBLE AVERAGING</span> <CheckCircle2 className="w-3 h-3" />
              </div>
            </div>
          </TiltCard>

          <TiltCard>
            <div className="flex flex-col gap-4 text-left h-full justify-between">
              <div className="flex flex-col gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                  <Database className="w-5.5 h-5.5 stroke-[1.5]" />
                </div>
                <h3 className="font-display font-extrabold text-base text-slate-900 tracking-tight">Self-Correcting Database</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Integrates real-time verification inputs. Allows authorized users to correct predictions and append confirmation logs, auto-recalculating live performance offsets on the administration board.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-indigo-600 font-bold mt-1">
                <span>SQLITE BACKBONE</span> <Database className="w-3 h-3" />
              </div>
            </div>
          </TiltCard>

          <TiltCard>
            <div className="flex flex-col gap-4 text-left h-full justify-between">
              <div className="flex flex-col gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-sm">
                  <RefreshCw className="w-5.5 h-5.5 stroke-[1.5]" />
                </div>
                <h3 className="font-display font-extrabold text-base text-slate-900 tracking-tight">Background Training UI</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Allows administrators to deploy new dataset directories directly through the console, trigger model retrains in separate threads, and monitor real-time epoch validation logs.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-rose-600 font-bold mt-1">
                <span>ASYNC PIPELINES</span> <RefreshCw className="w-3 h-3" />
              </div>
            </div>
          </TiltCard>

          <TiltCard>
            <div className="flex flex-col gap-4 text-left h-full justify-between">
              <div className="flex flex-col gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-650 shadow-sm">
                  <FileText className="w-5.5 h-5.5 stroke-[1.5]" />
                </div>
                <h3 className="font-display font-extrabold text-base text-slate-900 tracking-tight">Structured PDF Exports</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Compiles source fingerprint scans, enhanced ridge profiles, neural activation heatmaps, probability distribution percentages, and safety disclaimers into clean, clinical PDF files.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-650 font-bold mt-1">
                <span>REPORT GENERATOR</span> <FileText className="w-3 h-3" />
              </div>
            </div>
          </TiltCard>

        </div>
      </section>

      {/* Dynamic Telemetry Metrics Panel */}
      <section className="glass-panel p-8 md:p-9 rounded-3xl border border-slate-200 bg-white relative overflow-hidden text-left flex flex-col gap-5.5 shadow-md">
        <div className="absolute right-0 top-0 w-44 h-44 opacity-[0.04] cyber-grid pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-5 border-b border-slate-100">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600">LIVE SYSTEM DIAGNOSTICS</span>
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-slate-900">Active BioVision Database Indicators</h3>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse shadow-sm" />
            <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest">TELEMETRY LINK STABLE</span>
          </div>
        </div>

        {/* Live Metrics Counts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left font-mono">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ACTIVE DATABASE ENTRIES</span>
            <span className="text-2xl font-display font-extrabold text-slate-900">{telemetry.records} Records</span>
            <span className="text-[8px] text-teal-650 mt-0.5">▲ Live feeding verified outputs</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">TRAINED ARCHITECTURES</span>
            <span className="text-2xl font-display font-extrabold text-slate-900">EfficientNet-B0</span>
            <span className="text-[8px] text-blue-650 mt-0.5">Transfer learning enabled</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">BATCH CORRECTION RATIO</span>
            <span className="text-2xl font-display font-extrabold text-slate-900">96.8% Corrected</span>
            <span className="text-[8px] text-indigo-650 mt-0.5">Manual overrides processed</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">MEAN CLASSIFICATION LOSS</span>
            <span className="text-2xl font-display font-extrabold text-slate-900">0.084 Val Loss</span>
            <span className="text-[8px] text-slate-500 mt-0.5">Within statistical research limits</span>
          </div>
        </div>
      </section>

    </div>
  );
}
