'use client';

import React from 'react';
import { 
  ArrowRight, 
  Terminal, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  ShieldCheck, 
  Cloud, 
  HardDrive, 
  GitBranch, 
  Activity, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { 
  CaleumLogo, 
  CaelumOsLogo, 
  AwsLogo, 
  AzureLogo, 
  DockerLogo, 
  TerraformLogo, 
  KubernetesLogo, 
  GithubLogo 
} from './Logos';

export default function HeroSection() {
  const integrationNodes = [
    { label: "Cloud", value: "AWS & Azure", icon: Cloud, status: "Active Connectors" },
    { label: "Containers", value: "Docker Engine v29", icon: DockerLogo, status: "Host Sockets" },
    { label: "Orchestration", value: "Kubernetes", icon: KubernetesLogo, status: "Cluster Contexts" },
    { label: "IaC Engine", value: "Terraform / OpenTofu", icon: TerraformLogo, status: "HCL Execution" },
    { label: "Development", value: "Git & VS Code", icon: GithubLogo, status: "Workspace PTY" },
    { label: "Operations", value: "Telemetry & Logs", icon: Activity, status: "Live Streaming" },
  ];

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-white overflow-hidden border-b border-slate-200">
      
      {/* Subtle corporate technical grid */}
      <div className="absolute inset-0 bg-corporate-grid opacity-70 pointer-events-none" />
      
      {/* Subtle top light gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-blue-50/60 to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Announcement / Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="font-semibold text-slate-900">Caleum</span>
            <span className="text-slate-400">&bull;</span>
            <span>Flagship Release: CaelumOS v0.1</span>
          </div>
        </div>

        {/* Hero Title & Supporting Text */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Building the infrastructure for <br className="hidden sm:inline" />
            <span className="text-blue-600">modern developers.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
            Caleum builds developer infrastructure and operating environments that make cloud, DevOps and software development simpler, faster and more accessible.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#caelum-os"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm"
            >
              <span>Explore CaelumOS</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#about"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <span>Explore Caleum</span>
            </a>
          </div>
        </div>

        {/* Technical Product Visualization (CaelumOS Architectural Hub) */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 shadow-sm">
            
            {/* Header bar of visualization */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Technical Architecture
                </span>
                <h3 className="text-base font-bold text-slate-900 font-mono flex items-center gap-2">
                  <span>CaelumOS Unified Coordination Topology</span>
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Host Engines Synchronized</span>
              </div>
            </div>

            {/* Central Schematic Diagram */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left Domain Cards */}
              <div className="lg:col-span-4 space-y-3">
                {integrationNodes.slice(0, 3).map((node) => {
                  const Icon = node.icon;
                  return (
                    <div 
                      key={node.label}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-all shadow-xs flex items-start space-x-3 group"
                    >
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:text-blue-600 transition-colors mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-slate-900">{node.label}</span>
                          <span className="text-[10px] font-mono text-slate-400">{node.status}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">{node.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Center Core: CaelumOS Operating Layer */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-white border-2 border-blue-600/20 shadow-md text-center relative">
                <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-mono font-bold tracking-wider uppercase">
                  Flagship Operating Layer
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-sm mt-2">
                  <CaelumOsLogo className="w-8 h-8" />
                </div>

                <h4 className="text-lg font-bold text-slate-900 font-mono mt-3">
                  CaelumOS
                </h4>
                <p className="text-xs text-slate-500 font-sans mt-1 max-w-[220px]">
                  Unifying developer workspaces, host runtimes, and multi-cloud infrastructure.
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Local-First</span>
                  <span>&bull;</span>
                  <span>Zero Emulation</span>
                  <span>&bull;</span>
                  <span className="text-blue-600 font-semibold">v0.1.0</span>
                </div>
              </div>

              {/* Right Domain Cards */}
              <div className="lg:col-span-4 space-y-3">
                {integrationNodes.slice(3, 6).map((node) => {
                  const Icon = node.icon;
                  return (
                    <div 
                      key={node.label}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-all shadow-xs flex items-start space-x-3 group"
                    >
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:text-blue-600 transition-colors mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-slate-900">{node.label}</span>
                          <span className="text-[10px] font-mono text-slate-400">{node.status}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">{node.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Bottom summary bar */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-mono">
              <span>Direct host socket bindings: Docker Engine &bull; Terraform CLI &bull; WebSocket PTY</span>
              <a href="#caelum-os" className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                <span>View Product Breakdown</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
