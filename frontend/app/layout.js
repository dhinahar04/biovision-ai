import "./globals.css";
import Link from "next/link";
import { Home, Fingerprint, History, BarChart3, HelpCircle } from "lucide-react";

export const metadata = {
  title: "BioVision AI - Fingerprint Blood Group Estimator",
  description: "Advanced medical AI research tool predicting blood group classification, pattern structures, and image quality metrics from ink fingerprint scans.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      </head>
      <body className="relative min-h-screen bg-background text-gray-100 cyber-grid antialiased">
        
        {/* Decorative glowing background elements */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-glow-cyan pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-glow-purple pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-glow-cyan pointer-events-none -z-10" opacity="0.5" />

        {/* Global Navigation Header */}
        <header className="sticky top-0 z-50 w-full glass-panel border-b border-gray-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:rotate-12">
                <svg className="w-10 h-10 drop-shadow-[0_0_8px_rgba(204,255,0,0.35)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="44" stroke="#ccff00" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.75" />
                  <circle cx="50" cy="50" r="38" stroke="#00f5ff" strokeWidth="1.5" strokeDasharray="40 10" opacity="0.5" />
                  <path d="M30 50 C 30 35, 70 35, 70 50 C 70 65, 38 68, 38 80" stroke="#ccff00" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
                  <path d="M38 50 C 38 41, 62 41, 62 50 C 62 58, 48 62, 48 70" stroke="#00f5ff" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
                  <path d="M46 50 C 46 47, 54 47, 54 50" stroke="#ff0055" strokeWidth="3" strokeLinecap="round" />
                  <path d="M50 25 C44 34, 40 42, 40 48 C40 55, 44 59, 50 59 C56 59, 60 55, 60 48 C60 42, 56 34, 50 25 Z" fill="url(#dropletGrad)" stroke="#ff0055" strokeWidth="1.5" opacity="0.85" />
                  <defs>
                    <radialGradient id="dropletGrad" cx="40%" cy="30%" r="60%">
                      <stop offset="0%" stopColor="#ff4d7a" />
                      <stop offset="100%" stopColor="#ff0055" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
              <span className="font-display font-black text-2xl tracking-tighter text-white">
                BIO<span className="font-light text-neonCyan font-sans tracking-wide">VISION</span>
                <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-widest text-white bg-neonGreen rounded-md shadow-glowGreen align-middle">
                  AI
                </span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
              <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent text-gray-400 hover:text-neonCyan hover:bg-neonCyan/10 hover:border-neonCyan/20 hover:shadow-[0_0_15px_rgba(204,255,0,0.1)] transition-all duration-300">
                <Home className="w-4 h-4 opacity-80" />
                Home
              </Link>
              <Link href="/upload" className="flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent text-gray-400 hover:text-neonCyan hover:bg-neonCyan/10 hover:border-neonCyan/20 hover:shadow-[0_0_15px_rgba(204,255,0,0.1)] transition-all duration-300">
                <Fingerprint className="w-4 h-4 opacity-80" />
                New Scan
              </Link>
              <Link href="/history" className="flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent text-gray-400 hover:text-neonCyan hover:bg-neonCyan/10 hover:border-neonCyan/20 hover:shadow-[0_0_15px_rgba(204,255,0,0.1)] transition-all duration-300">
                <History className="w-4 h-4 opacity-80" />
                History
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent text-gray-400 hover:text-neonCyan hover:bg-neonCyan/10 hover:border-neonCyan/20 hover:shadow-[0_0_15px_rgba(204,255,0,0.1)] transition-all duration-300">
                <BarChart3 className="w-4 h-4 opacity-80" />
                Analytics
              </Link>
              <Link href="/about" className="flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent text-gray-400 hover:text-neonCyan hover:bg-neonCyan/10 hover:border-neonCyan/20 hover:shadow-[0_0_15px_rgba(204,255,0,0.1)] transition-all duration-300">
                <HelpCircle className="w-4 h-4 opacity-80" />
                Science
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link 
                href="/upload" 
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-900 bg-gradient-to-r from-neonCyan to-neonGreen rounded-lg hover:brightness-110 shadow-glowCyan transition-all"
              >
                Analyze Print
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 min-h-[calc(100vh-220px)]">
          {children}
        </main>

        {/* Diagnostic Footer with Disclaimer */}
        <footer className="w-full border-t border-gray-800 bg-gray-950/80 px-6 py-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold text-gray-400">BioVision AI Project &copy; {new Date().getFullYear()}</p>
              <p className="text-xs text-gray-600 mt-1">Advanced Ridge Orientation & deep learning blood group estimation research.</p>
            </div>
            
            <div className="max-w-xl p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-center md:text-left">
              <p className="text-[10px] leading-relaxed text-red-400/80">
                <span className="font-bold text-red-400">WARNING: MEDICAL DISCLAIMER.</span> BioVision AI is an estimation and academic research tool. It does not replace physical laboratory tests, antigen matching, or professional medical diagnosis. Never rely on AI classifications for clinical decision-making or transfusions.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
