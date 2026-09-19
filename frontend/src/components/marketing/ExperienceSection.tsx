"use client";

import React, { useState } from 'react';
import { 
  User, 
  Monitor, 
  Layers, 
  Cpu, 
  Server, 
  ArrowDown, 
  Check, 
  Zap, 
  ChevronRight,
  ShieldCheck,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { 
  DockerLogo, 
  TerraformLogo, 
  AwsLogo, 
  AzureLogo, 
  KubernetesLogo,
  CaelumLogo 
} from './Logos';

export default function ExperienceSection() {
  const [selectedLayer, setSelectedLayer] = useState<number>(1);

  const layers = [
    {
      id: 0,
      title: "Developer Workstation",
      subtitle: "The Engineer's Entry Point",
      description: "Developers work via web browser, terminal shells, or direct desktop clients with zero local environment contamination.",
      icon: User,
      color: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
      stats: "Single Entrypoint • Zero Context-Switching",
      bullets: ["Unified Auth & RBAC", "Web-based Accessible Client", "Zero Client Dependencies"]
    },
    {
      id: 1,
      title: "CaelumOS Unified Workspace",
      subtitle: "The Operating Environment",
      description: "An orchestration desktop that synthesizes daemons, HCL editors, terminals, and cloud SDKs into one responsive frame.",
      icon: CaelumLogo,
      color: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10",
      stats: "Real Host Daemons • WebSocket Streaming",
      bullets: ["Real-time PTY Terminals", "Multi-window Coordination", "State File Isolation"]
    },
    {
      id: 2,
      title: "Cloud + Infrastructure Layer",
      subtitle: "The Bridge Engine",
      description: "Low-latency background services connecting directly to local Docker pipes, host Terraform binaries, and cloud REST APIs.",
      icon: Layers,
      color: "border-purple-500/40 text-purple-400 bg-purple-500/10",
      stats: "Sub-second Querying • Async Cancellation",
      bullets: ["Direct Host Sockets", "Docker CLI Engine v29", "Terraform Binary Streams"]
    },
    {
      id: 3,
      title: "Multi-Cloud & Engine Matrix",
      subtitle: "The Infrastructure Runtimes",
      description: "Simultaneous execution across Docker Engine, Terraform CLI, AWS SDK, Azure Resource Manager, and Kubernetes clusters.",
      icon: Cpu,
      color: "border-amber-500/40 text-amber-400 bg-amber-500/10",
      stats: "Heterogeneous Multi-Cloud Provisioning",
      bullets: ["AWS us-east-1 & S3", "Azure EastUS & VMs", "Containerized Workloads"]
    },
    {
      id: 4,
      title: "Applications & Live Infrastructure",
      subtitle: "Production Systems",
      description: "The deployed result: production microservices, SQL databases, serverless functions, and high-availability clusters.",
      icon: Server,
      color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
      stats: "100% Verified Real Infrastructure Output",
      bullets: ["High Availability", "Active Healthchecks", "Zero Simulation"]
    },
  ];

  return (
    <section id="architecture" className="py-24 bg-[#0c0c10] relative scroll-mt-16 border-b border-white/[0.06]" aria-labelledby="experience-heading">
      <div id="experience" className="scroll-mt-20" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Architecture Flow</span>
          </div>
          <h2 id="experience-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            One workspace. <br />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Multiple technologies.
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Trace the execution pipeline from developer input to real infrastructure deployment. Click any tier below to inspect its data flow.
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
                        ? 'bg-neutral-850 border-cyan-500/60 shadow-lg shadow-cyan-500/10 scale-[1.01]' 
                        : 'bg-neutral-900/50 border-white/[0.06] hover:border-white/[0.15] hover:bg-neutral-900/80'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2.5 rounded-lg border ${layer.color} flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                            Level 0{index + 1}
                          </span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          )}
                        </div>
                        <h4 className={`text-sm font-bold tracking-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {layer.title}
                        </h4>
                        <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                          {layer.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border hidden sm:inline ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/[0.03] text-slate-500 border-white/[0.06]'
                      }`}>
                        {isSelected ? 'Active Tier' : 'Inspect'}
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-cyan-400 rotate-90' : 'text-slate-600'}`} />
                    </div>
                  </div>

                  {/* Connecting pipe arrow */}
                  {index < layers.length - 1 && (
                    <div className="flex justify-center py-1">
                      <div className="w-0.5 h-3 bg-gradient-to-b from-white/20 to-transparent" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Tier Inspector Panel */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="rounded-2xl border border-white/[0.12] bg-neutral-900/70 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                    Tier Inspection Protocol
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {layers[selectedLayer].title}
                  </h3>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08]">
                  {React.createElement(layers[selectedLayer].icon, { className: "w-6 h-6 text-cyan-400" })}
                </div>
              </div>

              {/* Subtitle & Description */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 font-semibold block">
                  Role: {layers[selectedLayer].subtitle}
                </span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {layers[selectedLayer].description}
                </p>
              </div>

              {/* Performance / Architectural metric */}
              <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06] text-xs font-mono text-cyan-300">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Performance Metric:</span>
                <span className="mt-1 block font-semibold">{layers[selectedLayer].stats}</span>
              </div>

              {/* Key capabilities */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Architectural Highlights:
                </span>
                <div className="space-y-2">
                  {layers[selectedLayer].bullets.map((bullet) => (
                    <div key={bullet} className="flex items-center space-x-2.5 text-xs text-slate-300 font-mono">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Link */}
              <div className="pt-3">
                <a
                  href="#platform"
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-md"
                >
                  <span>Explore Platform Engines</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
