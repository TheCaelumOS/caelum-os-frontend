import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Terminal, 
  Sparkles, 
  Github, 
  ShieldCheck, 
  Rocket 
} from 'lucide-react';
import { CaelumLogo } from './Logos';

export default function CtaSection() {
  return (
    <section className="py-24 bg-[#09090b] relative overflow-hidden" aria-labelledby="cta-heading">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-gradient-to-r from-cyan-600/20 via-indigo-600/20 to-purple-600/20 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="rounded-3xl border border-white/[0.12] bg-gradient-to-b from-neutral-900/90 to-[#0c0c10]/95 backdrop-blur-2xl p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-2xl space-y-8 relative overflow-hidden">
          
          {/* Subtle grid in CTA */}
          <div className="absolute inset-0 bg-tech-dots opacity-40 pointer-events-none" />

          {/* Top Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest relative z-10 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Building in public.</span>
          </div>

          {/* Heading */}
          <h2 id="cta-heading" className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white relative z-10 leading-tight">
            The infrastructure layer <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              for what&apos;s next.
            </span>
          </h2>

          {/* Description */}
          <p className="text-slate-300 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed relative z-10 font-normal">
            CaelumOS is being built for developers who want a simpler way to work with modern infrastructure.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 relative z-10 pt-2">
            <a
              href="#what-is-caelum"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/35 transition-all active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Explore CaelumOS</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </a>

            <Link
              href="/download"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all hover:text-white"
            >
              <span>Download CaelumOS</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">ISO</span>
            </Link>

            <a
              href="https://github.com/TheCaelumOS/caelum-os-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] transition-all hover:text-white"
            >
              <Github className="w-4 h-4 text-slate-300" />
              <span>View GitHub</span>
            </a>
          </div>

          {/* Security & Verification trustline */}
          <div className="pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400 relative z-10">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Zero Mock Engines</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Host Sockets Verified</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Open Source Core</span>
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
