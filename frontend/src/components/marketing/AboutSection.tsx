'use client';

import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Layers, 
  Globe, 
  Cpu, 
  ArrowRight,
  Compass
} from 'lucide-react';
import { CaleumLogo } from './Logos';

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-slate-50/60 border-b border-slate-200 scroll-mt-16" aria-labelledby="about-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="space-y-4 text-center sm:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>About Caleum</span>
            </div>

            <h2 id="about-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans leading-tight">
              We&apos;re building beyond the next developer tool.
            </h2>

            <p className="text-lg sm:text-xl text-slate-700 font-medium leading-relaxed">
              Caleum is building a technology ecosystem focused on simplifying modern software infrastructure.
            </p>
          </div>

          {/* Narrative Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-600 leading-relaxed font-normal">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-sans">
                The Infrastructure Problem
              </h3>
              <p>
                In the last decade, software development has shifted dramatically toward distributed cloud architectures, container orchestration, and declarative infrastructure. While this transition unlocked immense scalability, it created unprecedented tooling fragmentation.
              </p>
              <p>
                Developers today spend considerable mental overhead context-switching across browser dashboards, isolated CLI sessions, scattered access tokens, and disjointed logs just to observe a simple microservice.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-sans">
                The Caleum Approach
              </h3>
              <p>
                Caleum was established to design developer infrastructure and operating environments that restore coherence to this workflow. Our flagship project, CaelumOS, brings cloud consoles, Docker daemons, Kubernetes clusters, and Terraform states into a unified operating layer.
              </p>
              <p>
                We focus on technical credibility, local-first execution, and open standards. Rather than replacing the technologies developers trust, Caleum coordinates them into a single, reliable environment.
              </p>
            </div>
          </div>

          {/* Key Facts / Organization Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Company / Organization</span>
              <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">Caleum</span>
              <span className="text-xs text-slate-500 font-mono">Infrastructure Technology</span>
            </div>

            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Flagship Product</span>
              <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">CaelumOS</span>
              <span className="text-xs text-slate-500 font-mono">Developer Operating Environment</span>
            </div>

            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Official Web Domain</span>
              <span className="text-base font-bold text-blue-600 font-mono mt-0.5 block">https://caleum.me/</span>
              <span className="text-xs text-slate-500 font-mono">Global Corporate Portal</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
