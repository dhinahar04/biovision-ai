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
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="relative min-h-screen bg-background text-slate-700 cyber-grid antialiased">
        
        {/* Soft background glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-glow-cyan pointer-events-none -z-10" />
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-glow-purple pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-glow-cyan pointer-events-none -z-10 opacity-40" />

        {/* Global Navigation Header */}
        <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/80 px-6 py-4 bg-white/80">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <svg className="w-11 h-11 drop-shadow-[0_6px_12px_rgba(37,99,235,0.12)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* 3D Isometric Base Platform */}
                  {/* Bottom shadow of slab */}
                  <path d="M 50,86 L 82,70 L 50,54 L 18,70 Z" fill="#000000" opacity="0.06" />
                  {/* Side-left face */}
                  <path d="M 18,66.5 L 50,82.5 L 50,87.5 L 18,71.5 Z" fill="#94A3B8" />
                  {/* Side-right face */}
                  <path d="M 50,82.5 L 82,66.5 L 82,71.5 L 50,87.5 Z" fill="#64748B" />
                  {/* Top face */}
                  <path d="M 50,61.5 L 82,66.5 L 50,82.5 L 18,66.5 Z" fill="url(#slabTopGrad)" />
                  
                  {/* Glowing 3D Biometric Eye Scanner / Iris Aperture (Isometric) */}
                  <ellipse cx="50" cy="72" rx="20" ry="10" stroke="#0D9488" strokeWidth="1.5" opacity="0.8" />
                  <ellipse cx="50" cy="72" rx="12" ry="6" stroke="#2563EB" strokeWidth="1" opacity="0.7" />
                  
                  {/* Isometric Iris lens blades */}
                  <line x1="40" y1="72" x2="43" y2="70.5" stroke="#0D9488" strokeWidth="1.2" opacity="0.8" />
                  <line x1="60" y1="72" x2="57" y2="73.5" stroke="#0D9488" strokeWidth="1.2" opacity="0.8" />
                  <line x1="50" y1="67" x2="50" y2="69" stroke="#2563EB" strokeWidth="1" opacity="0.8" />
                  <line x1="50" y1="77" x2="50" y2="75" stroke="#2563EB" strokeWidth="1" opacity="0.8" />
                  
                  {/* Soft ambient occlusion shadow from the floating droplet */}
                  <ellipse cx="50" cy="72" rx="7" ry="3.5" fill="#E11D48" opacity="0.15" filter="url(#shadowBlur)" />

                  {/* 3D Glossy Floating Blood Droplet (shifted up in the Z-axis) */}
                  <path d="M 50,15 C 44,24 40,32 40,38 C 40,45 44.5,49 50,49 C 55.5,49 60,45 60,38 C 60,32 56,24 50,15 Z" fill="url(#droplet3DGrad)" stroke="#B91C1C" strokeWidth="0.5" opacity="0.95" />
                  
                  {/* Glass highlight glare */}
                  <path d="M 44.5,31 C 44.5,27 47,24 50,23 C 48,25 47.5,28 47.5,31 C 47.5,34.5 48.5,36.5 50,38 C 47,37 44.5,34 44.5,31 Z" fill="#FFFFFF" opacity="0.45" />
                  
                  {/* Neon laser sweep line slicing through droplet (curved isometric path wrapping the front) */}
                  <path d="M 38,38 C 42,41.5 58,41.5 62,38" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" filter="url(#glowFilter)" />
                  
                  <defs>
                    <linearGradient id="slabTopGrad" x1="18" y1="66.5" x2="82" y2="82.5" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#F1F5F9" />
                      <stop offset="100%" stopColor="#CBD5E1" />
                    </linearGradient>
                    <radialGradient id="droplet3DGrad" cx="35%" cy="30%" r="65%">
                      <stop offset="0%" stopColor="#F43F5E" />
                      <stop offset="70%" stopColor="#DC2626" />
                      <stop offset="100%" stopColor="#991B1B" />
                    </radialGradient>
                    <filter id="shadowBlur" x="-10%" y="-10%" width="120%" height="120%">
                      <feGaussianBlur stdDeviation="2" />
                    </filter>
                    <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="1" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                </svg>
              </div>
              <span className="font-display font-black text-2xl tracking-tighter text-slate-900">
                BIO<span className="font-light text-blue-600 tracking-wider">VISION</span>
                <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-widest text-white bg-blue-600 rounded align-middle">
                  AI
                </span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-600">
              <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl hover:text-blue-600 hover:bg-slate-50 transition-all duration-200">
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link href="/upload" className="flex items-center gap-2 px-4 py-2 rounded-xl hover:text-blue-600 hover:bg-slate-50 transition-all duration-200">
                <Fingerprint className="w-4 h-4" />
                New Scan
              </Link>
              <Link href="/history" className="flex items-center gap-2 px-4 py-2 rounded-xl hover:text-blue-600 hover:bg-slate-50 transition-all duration-200">
                <History className="w-4 h-4" />
                History
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-xl hover:text-blue-600 hover:bg-slate-50 transition-all duration-200">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
              <Link href="/about" className="flex items-center gap-2 px-4 py-2 rounded-xl hover:text-blue-600 hover:bg-slate-50 transition-all duration-200">
                <HelpCircle className="w-4 h-4" />
                Science
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link 
                href="/upload" 
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
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
        <footer className="w-full border-t border-slate-200/80 bg-slate-50 px-6 py-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left flex flex-col gap-1">
              <p className="text-sm font-semibold text-slate-800">BioVision AI Project &copy; {new Date().getFullYear()}</p>
              <p className="text-xs text-slate-500 font-sans">Advanced ridge topology extraction and PyTorch deep neural blood group estimation.</p>
            </div>
            
            <div className="max-w-xl p-4 bg-red-50 border border-red-200 rounded-xl text-center md:text-left shadow-sm">
              <p className="text-[10px] leading-relaxed text-red-700">
                <span className="font-bold text-red-600">CLINICAL DISCLAIMER:</span> BioVision AI is an educational research index tool. It is not capable of performing chemical lab tests or serological validation. Do not base blood transfusions or medical treatments on the output of this machine learning system.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
