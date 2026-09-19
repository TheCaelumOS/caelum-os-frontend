'use client';

import React from 'react';
import { 
  ArrowRight, 
  Terminal, 
  Layers, 
  Cpu, 
  Cloud, 
  Activity, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Server
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
  const liveNodes = [
    { label: "Docker Engine", value: "Host daemon control & streaming logs", icon: DockerLogo, status: "Live Socket" },
    { label: "Azure ARM SDK", value: "VMs, storage, VNets, and resource groups", icon: AzureLogo, status: "Live SDK" },
    { label: "AWS SDK v3", value: "EC2 instances, S3 buckets, RDS databases", icon: AwsLogo, status: "Live SDK" },
    { label: "Terraform IaC", value: "Isolated sandbox execution & HCL runner", icon: TerraformLogo, status: "CLI Runner" },
    { label: "Kubernetes Context", value: "Pods, namespaces, and node topology", icon: KubernetesLogo, status: "Kubeconfig" },
    { label: "Interactive Terminal", value: "Real PTY session over WebSockets", icon: Terminal, status: "Xterm.js" },
  ];

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-white overflow-hidden border-b border-slate-200">
      {/* Background technical grid */}
      <div className="absolute inset-0 bg-corporate-grid opacity-70 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-blue-50/60 to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Release Status Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-bold text-slate-900">Caleum</span>
            <span className="text-slate-300">&bull;</span>
            <span>Official Engineering Showcase &bull; Bootable OS Under Development</span>
          </div>
        </div>

        {/* Hero Title & Supporting Engineering Text */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            The Unified Cloud &amp; <br className="hidden sm:inline" />
            <span className="text-blue-600">Infrastructure Operating System.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
            Explore the engineering behind CaelumOS — from cloud integrations and container tooling to infrastructure automation and the architecture being built toward a dedicated bootable operating system.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
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
        </div>

        {/* Technical Architecture Topology Diagram */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 shadow-sm">
            
            {/* Header bar of visualization */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  System Topology &bull; Active Connectors
                </span>
                <h3 className="text-base font-bold text-slate-900 font-mono flex items-center gap-2 mt-0.5">
                  <span>CaelumOS Unified Coordination Topology</span>
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-white px-3 py-1 rounded-md border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Backend API Gateway Connected</span>
              </div>
            </div>

            {/* Central Schematic Grid */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left Column Nodes */}
              <div className="lg:col-span-4 space-y-3">
                {liveNodes.slice(0, 3).map((node) => {
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
                          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {node.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-normal mt-0.5">{node.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Center Core: CaelumOS Supervisor Layer */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-white border-2 border-blue-600/20 shadow-sm text-center relative">
                <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-mono font-bold tracking-wider uppercase">
                  Flagship Architecture
                </div>

                <div className="p-3.5 rounded-2xl bg-[#040C1C] text-white shadow-md mt-2">
                  <CaleumLogo className="w-9 h-9" />
                </div>

                <h4 className="text-lg font-bold text-slate-900 font-mono mt-3">
                  CaelumOS
                </h4>
                <p className="text-xs text-slate-500 font-sans mt-1 max-w-[220px]">
                  Unified operating system coordinating multi-cloud infrastructure and local developer runtimes.
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Showcase</span>
                  <span>&bull;</span>
                  <span>Verified SDKs</span>
                  <span>&bull;</span>
                  <span className="text-blue-600 font-semibold">Under Dev</span>
                </div>
              </div>

              {/* Right Column Nodes */}
              <div className="lg:col-span-4 space-y-3">
                {liveNodes.slice(3, 6).map((node) => {
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
                          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {node.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-normal mt-0.5">{node.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Bottom Real Architecture Strip */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Stack:</span>
                <span className="font-semibold text-slate-700">Next.js 14</span>
                <span className="text-slate-300">&bull;</span>
                <span className="font-semibold text-slate-700">NestJS 11</span>
                <span className="text-slate-300">&bull;</span>
                <span className="font-semibold text-slate-700">PostgreSQL</span>
                <span className="text-slate-300">&bull;</span>
                <span className="font-semibold text-slate-700">Redis</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Deployment:</span>
                <span className="font-semibold text-blue-600">Cloudflare Pages (caleum.me)</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}