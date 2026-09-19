'use client';

import React from 'react';
import { 
  AppWindow, 
  Layers, 
  Terminal, 
  Maximize2, 
  Sliders, 
  ArrowRight,
  ExternalLink,
  Shield,
  Monitor
} from 'lucide-react';
import { CaleumLogo } from './Logos';

export default function CloudWorkspaceSection() {
  const workspaceFeatures = [
    {
      title: "Concurrent Window Manager",
      desc: "Run terminal sessions, cloud dashboards, and container logs side-by-side with full window controls (minimize, maximize, focus, and z-index ordering).",
      icon: AppWindow
    },
    {
      title: "Real Host Connectivity",
      desc: "Connects to your local machine daemons and cloud APIs over secure WebSockets and authenticated REST endpoints without sandbox limitations.",
      icon: Monitor
    },
    {
      title: "Multi-Context Multitasking",
      desc: "Inspect live Azure VM metrics, execute Terraform validation, tail Docker stdout, and commit code via Git from a single screen layout.",
      icon: Layers
    },
    {
      title: "Customizable System Controls",
      desc: "Integrated brightness, volume, audio, active subtab routing, and workspace preferences stored cleanly in PostgreSQL via Prisma.",
      icon: Sliders
    }
  ];

  return (
    <section id="cloud-workspace" className="py-24 bg-slate-50/50 border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider">
            <AppWindow className="w-3.5 h-3.5 text-blue-600" />
            <span>Developer Interface</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            The Unified Cloud Workspace
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            An integrated operating environment designed for high-throughput infrastructure multitasking, coordinating host daemons and multi-cloud providers.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workspaceFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="p-2.5 w-fit rounded-xl bg-slate-100 text-slate-800">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-sans">{feat.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{feat.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Engineering Showcase Callout Panel */}
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="font-semibold text-slate-900 uppercase">Engineering Showcase</span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-500 font-medium">Bootable OS In Active Development</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-mono">
              Purpose-Built Operating System Architecture
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              CaelumOS is being engineered as a dedicated bootable operating system to overcome browser sandboxing, providing raw socket bindings, deterministic kernel scheduling, and native eBPF telemetry.
            </p>
          </div>

          <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-3">
            <a
              href="https://github.com/TheCaelumOS/caelum-os-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs group"
            >
              <span>View GitHub Source</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              href="#architecture"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors shadow-xs group"
            >
              <span>Explore Architecture &rarr;</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}