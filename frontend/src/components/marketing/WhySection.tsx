'use client';

import React from 'react';
import { 
  Hammer, 
  Minimize2, 
  Code2, 
  TrendingUp, 
  ShieldCheck, 
  Compass, 
  CheckCircle2 
} from 'lucide-react';

export default function WhySection() {
  const pillars = [
    {
      title: "Build",
      summary: "Build reliable developer infrastructure.",
      desc: "We engineer developer infrastructure with production-grade reliability from the foundation. No fragile mocks or simulated layers — our runtimes connect directly to real host engines and verified cloud SDKs.",
      icon: Hammer,
      badge: "Core Foundation"
    },
    {
      title: "Simplify",
      summary: "Remove unnecessary complexity from modern infrastructure.",
      desc: "Modern developers waste hours every day juggling fragmented web consoles, disparate secret keys, and disconnected shells. Caleum removes friction by unifying operations into one coherent interface.",
      icon: Minimize2,
      badge: "User Experience"
    },
    {
      title: "Open",
      summary: "Build with open technologies and developer-friendly workflows.",
      desc: "Our platform is built around standard open technologies — Linux, Docker, Kubernetes, Terraform, and Git. We prioritize local-first execution, transparent protocols, and zero vendor lock-in.",
      icon: Code2,
      badge: "Open Standards"
    },
    {
      title: "Scale",
      summary: "Design systems that can grow from individual developers to teams and organizations.",
      desc: "Architecture designed to seamlessly expand. What starts on an individual engineer's workstation evolves into team environments, fleet orchestration, and enterprise-grade infrastructure governance.",
      icon: TrendingUp,
      badge: "Growth & Enterprise"
    },
  ];

  return (
    <section id="why" className="py-24 bg-white border-b border-slate-200 scroll-mt-16" aria-labelledby="why-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Philosophy & Principles</span>
          </div>

          <h2 id="why-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Why Caleum
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            We believe the modern infrastructure stack is unnecessarily fragmented. Caleum is built on four core principles to restore clarity, focus, and velocity to software engineering.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 flex flex-col justify-between hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 shadow-2xs">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                      {pillar.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 font-sans">
                      {pillar.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-700 font-mono mt-1">
                      {pillar.summary}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center space-x-1.5 text-[11px] font-mono text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Caleum Standard</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
