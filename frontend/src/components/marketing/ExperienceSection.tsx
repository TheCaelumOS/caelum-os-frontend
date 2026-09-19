"use client";

import React, { useState } from 'react';
import { 
  User, 
  Layers, 
  Cpu, 
  Server, 
  Check, 
  Zap, 
  ChevronRight, 
  ShieldCheck, 
  Terminal, 
  Activity 
} from 'lucide-react';
import { CaelumLogo } from './Logos';

export default function ExperienceSection() {
  const [selectedLayer, setSelectedLayer] = useState<number>(1);

  const layers = [
    {
      id: 0,
      title: "Developer Workstation",
      subtitle: "The Engineer's Entry Point",
      description: "Engineers interface directly from their local workstation with zero environment contamination, preparing for a dedicated bare-metal OS runtime.",
      icon: User,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      stats: "Single Entrypoint &bull; Zero Context-Switching",
      bullets: ["Direct Host Daemon Binding", "No Local VM Overhead", "Zero Client Configuration Drift"]
    },
    {
      id: 1,
      title: "CaelumOS Unified Workspace",
      subtitle: "The Operating Environment",
      description: "An architectural operating layer that coordinates host daemons, HCL editors, terminals, and cloud SDKs into one unified environment.",
      icon: CaelumLogo,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      stats: "Real Host Daemons &bull; WebSocket Streaming",
      bullets: ["Real-time PTY Terminals", "Multi-window Coordination", "Workspace State Isolation"]
    },
    {
      id: 2,
      title: "Cloud & Infrastructure Layer",
      subtitle: "The Bridge Supervisor",
      description: "Low-latency background microservices connecting directly to local Docker pipes, host Terraform binaries, and cloud REST APIs.",
      icon: Layers,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      stats: "Sub-second Querying &bull; Loopback Sockets",
      bullets: ["Host Named Pipes & Unix Sockets", "Docker Engine v29 Controller", "Terraform Binary Streams"]
    },
    {
      id: 3,
      title: "Multi-Cloud & Engine Matrix",
      subtitle: "The Infrastructure Runtimes",
      description: "Simultaneous orchestration across Docker Engine, Terraform CLI, AWS SDK, Azure Resource Manager, and Kubernetes clusters.",
      icon: Cpu,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      stats: "Multi-Cloud Provisioning &bull; Real Credentials",
      bullets: ["AWS STS Caller Identity", "Azure Resource Group Hierarchy", "Containerized OCI Workloads"]
    },
    {
      id: 4,
      title: "Applications & Live Infrastructure",
      subtitle: "Production Systems",
      description: "The deployed result: production containers, relational databases, isolated virtual networks, and highly available clusters.",
      icon: Server,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      stats: "100% Verified Real Infrastructure Output",
      bullets: ["High Availability", "Active Healthchecks", "Zero Mock Data or Simulations"]
    },
  ];

  return (
    <section id="experience" className="py-24 bg-slate-50/60 border-b border-slate-200 scroll-mt-16" aria-labelledby="experience-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Developer Workflow</span>
          </div>

          <h2 id="experience-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            The Developer Experience
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Trace the execution pipeline from developer input to real infrastructure deployment. Select any architectural tier below to inspect its data flow.
          </p>
        </div>

        {/* Interactive Architecture Visualization */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive Pipeline Stack */}
          <div className="lg:col-span-7 space-y-3">
            {layers.map((layer, index) => {
              const isSelected = selectedLayer === layer.id;
              const Icon = layer.icon;
              return (
                <div key={layer.id} className="relative">
                  <div
                    onClick={() => setSelectedLayer(layer.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected 
                        ? 'bg-white border-blue-600 shadow-sm ring-1 ring-blue-600/20' 
                        : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg border ${layer.color} flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                            Tier 0{index + 1}
                          </span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 font-sans">
                          {layer.title}
                        </h4>
                        <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                          {layer.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border hidden sm:inline ${
                        isSelected 
                          ? 'bg-blue-50 text-blue-700 border-blue-200 font-medium' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {isSelected ? 'Active Tier' : 'Inspect'}
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-blue-600 rotate-90' : 'text-slate-400'}`} />
                    </div>
                  </div>

                  {/* Connecting pipe arrow */}
                  {index < layers.length - 1 && (
                    <div className="flex justify-center py-1">
                      <div className="w-0.5 h-3 bg-slate-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Tier Inspector Panel */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 font-bold">
                    Tier Inspection Protocol
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 font-sans">
                    {layers[selectedLayer].title}
                  </h3>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 shadow-xs">
                  {React.createElement(layers[selectedLayer].icon, { className: "w-5 h-5" })}
                </div>
              </div>

              {/* Subtitle & Description */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-500 font-semibold block">
                  Role: {layers[selectedLayer].subtitle}
                </span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {layers[selectedLayer].description}
                </p>
              </div>

              {/* Performance / Architectural metric */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Architectural Metric:</span>
                <span className="mt-1 block font-semibold text-slate-900" dangerouslySetInnerHTML={{ __html: layers[selectedLayer].stats }} />
              </div>

              {/* Key capabilities */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Key Guarantees:
                </span>
                <div className="space-y-1.5">
                  {layers[selectedLayer].bullets.map((bullet) => (
                    <div key={bullet} className="flex items-center space-x-2 text-xs text-slate-700 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Link */}
              <div className="pt-2">
                <a
                  href="#architecture"
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <span>Explore Architecture &rarr;</span>
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
