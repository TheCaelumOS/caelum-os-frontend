'use client';

import React from 'react';
import { 
  ArrowRight, 
  Terminal, 
  Layers,
  BookOpen
} from 'lucide-react';
import { GithubLogo } from './Logos';

export default function CtaSection() {
  return (
    <section id="cta" className="py-24 bg-slate-50/60 border-b border-slate-200 scroll-mt-16" aria-labelledby="cta-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-xs space-y-6">
          
          {/* Top Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Official Engineering Showcase</span>
          </div>

          {/* Heading */}
          <h2 id="cta-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans leading-tight">
            Explore the engineering <br className="hidden sm:inline" />
            behind CaelumOS.
          </h2>

          {/* Description */}
          <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-normal">
            Explore the engineering behind CaelumOS — from cloud integrations and container tooling to infrastructure automation and the architecture being built toward a dedicated bootable operating system.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="https://github.com/TheCaelumOS/caelum-os-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs group"
            >
              <GithubLogo className="w-4 h-4 text-white" />
              <span>View GitHub Source</span>
            </a>

            <a
              href="#architecture"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-xs group"
            >
              <span>Explore Architecture &rarr;</span>
            </a>
          </div>

          {/* Guarantee Note */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-500">
            <span>&bull; Zero Fake Features</span>
            <span>&bull; Open Source TypeScript</span>
            <span>&bull; Real Infrastructure SDKs</span>
          </div>

        </div>

      </div>
    </section>
  );
}