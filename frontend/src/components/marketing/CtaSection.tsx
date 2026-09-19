import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Terminal, 
  Sparkles, 
  ShieldCheck, 
  BookOpen
} from 'lucide-react';
import { GithubLogo } from './Logos';

export default function CtaSection() {
  return (
    <section id="cta" className="py-24 bg-slate-50/60 border-b border-slate-200 scroll-mt-16" aria-labelledby="cta-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-xs space-y-6">
          
          {/* Top Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700 uppercase tracking-wider shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Developer Operating Environment</span>
          </div>

          {/* Heading */}
          <h2 id="cta-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans leading-tight">
            Ready to simplify your <br className="hidden sm:inline" />
            infrastructure workflow?
          </h2>

          {/* Description */}
          <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Start organizing your cloud platforms, containers, and development environments into one unified, local-first operating environment.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="#platform"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
            >
              <span>Explore CaelumOS</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#docs"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-slate-600" />
              <span>Documentation</span>
            </a>

            <a
              href="https://github.com/TheCaelumOS/caelum-os-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-xs"
            >
              <GithubLogo className="w-4 h-4 text-slate-700" />
              <span>GitHub</span>
            </a>
          </div>

          {/* Trustline */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero Mock Engines</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Local Host Sockets Verified</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Apache 2.0 Open Source Core</span>
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
