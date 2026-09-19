'use client';

import React from 'react';
import { 
  Split, 
  Layers, 
  ShieldCheck, 
  Terminal, 
  Server, 
  Cpu, 
  Check, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { CaleumLogo } from './Logos';

export default function WhatIsSection() {
  const principles = [
    {
      title: "Consolidated Operations",
      desc: "Instead of context-switching between AWS Console, Azure Portal, Docker Desktop, and disjointed shell tabs, CaleumOS hosts all infrastructure tooling in one unified workspace.",
      badge: "Workflow Efficiency"
    },
    {
      title: "Real Engine Integration",
      desc: "Zero mock data. The platform communicates directly with your host Docker daemon via local sockets, queries Azure via ARM SDK, and triggers authentic Terraform CLI runs.",
      badge: "Authentic Execution"
    },
    {
      title: "Transparent Architecture",
      desc: "Built in public with a modular NestJS API backend, Next.js static export on Cloudflare Pages, PostgreSQL via Prisma, and open-source TypeScript code.",
      badge: "Open Standards"
    }
  ];

  return (
    <section id="what-is-caleumos" className="py-24 bg-white border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Platform Overview</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            What is CaelumOS?
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            CaelumOS is the flagship platform from <strong className="text-slate-900 font-semibold">Caleum</strong> — a unified cloud and infrastructure operating environment engineered to eliminate DevOps tool sprawl, currently advancing toward a dedicated bootable operating system.
          </p>
        </div>

        {/* Comparison / Problem & Solution Grid */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Fragmented Reality */}
          <div className="p-8 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                <Split className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-mono">The Traditional DevOps Reality</h3>
                <span className="text-xs text-slate-500 font-mono">Fragmented consoles &amp; disjointed contexts</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Software engineers and cloud architects spend hours navigating fragmented environments:
            </p>

            <ul className="space-y-3 text-xs font-mono text-slate-700">
              <li className="flex items-start space-x-2.5">
                <span className="text-rose-500 font-bold">&times;</span>
                <span>Opening dozens of browser tabs across AWS Console, Azure Portal, and GCP</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-rose-500 font-bold">&times;</span>
                <span>Switching to separate desktop apps for Docker, Postman, and VS Code</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-rose-500 font-bold">&times;</span>
                <span>Running manual terminal commands to tail container stdout and inspect pods</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-rose-500 font-bold">&times;</span>
                <span>Juggling separate credentials, API keys, and environment variables</span>
              </li>
            </ul>
          </div>

          {/* CaleumOS Solution */}
          <div className="p-8 rounded-2xl bg-blue-50/30 border border-blue-200/70 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-blue-200/60">
              <div className="p-2 rounded-xl bg-blue-600 text-white">
                <CaleumLogo className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-mono">The CaleumOS Architecture</h3>
                <span className="text-xs text-blue-700 font-mono font-medium">Single coherent developer workspace</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              CaleumOS brings infrastructure and tooling into one local-first operating layer:
            </p>

            <ul className="space-y-3 text-xs font-mono text-slate-700">
              <li className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Side-by-side terminal, container logs, and cloud consoles in one window manager</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Native integration with real host Docker daemon and cloud provider SDKs</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Embedded Terraform sandbox with real CLI init, validate, and plan execution</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Secure central backend gateway protecting encrypted service credentials</span>
              </li>
            </ul>
          </div>

        </div>

        {/* 3 Engineering Principles */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {principles.map((item) => (
            <div key={item.title} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">
                {item.badge}
              </span>
              <h4 className="text-base font-bold text-slate-900 font-sans">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}