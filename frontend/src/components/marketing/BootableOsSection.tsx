'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Power, 
  Terminal, 
  Hammer, 
  Rocket, 
  Sliders, 
  ArrowRight,
  ShieldCheck,
  Disc,
  Cpu,
  Download,
  Cloud,
  Layers,
  Sparkles,
  GitBranch,
  ArrowDown
} from 'lucide-react';
import { CaelumLogo } from './Logos';

export default function BootableOsSection() {
  const osStages = [
    { 
      name: "BOOT", 
      desc: "Lightweight, immutable Linux kernel initialized with native hypervisor and hardware abstraction.", 
      icon: Power, 
      color: "text-red-400 border-red-500/30",
      accent: "bg-red-500/10"
    },
    { 
      name: "CAELUMOS", 
      desc: "Native desktop compositor and local process supervisor with pre-linked container and cloud daemons.", 
      icon: CaelumLogo, 
      color: "text-cyan-400 border-cyan-500/30",
      accent: "bg-cyan-500/10"
    },
    { 
      name: "BUILD", 
      desc: "Compile container images, edit HCL syntax, test local microservices without third-party web portals.", 
      icon: Hammer, 
      color: "text-amber-400 border-amber-500/30",
      accent: "bg-amber-500/10"
    },
    { 
      name: "DEPLOY", 
      desc: "Direct multi-cloud rollout to AWS, Azure, and Kubernetes with verified local security credentials.", 
      icon: Rocket, 
      color: "text-purple-400 border-purple-500/30",
      accent: "bg-purple-500/10"
    },
    { 
      name: "MANAGE", 
      desc: "Continuous live observation, bidirectional log streaming, pod metrics, and drift remediation.", 
      icon: Sliders, 
      color: "text-emerald-400 border-emerald-500/30",
      accent: "bg-emerald-500/10"
    },
  ];

  const focusAreas = [
    { title: "Cloud Infrastructure", desc: "Native IAM credential management, VPC topologies, and resource tracking." },
    { title: "Containers & Runtimes", desc: "Local Docker daemon integration, registry sync, and OCI lifecycle execution." },
    { title: "DevOps & Automation", desc: "Automated pipelines, declarative workflows, and state drift notifications." },
    { title: "Infrastructure as Code", desc: "Integrated Terraform & OpenTofu execution with isolated state files." },
    { title: "Developer Workflows", desc: "Ultra-low latency PTY terminal, Git workspaces, and distraction-free tooling." },
  ];

  return (
    <section id="bootable" className="py-24 bg-[#09090c] relative border-y border-white/[0.06] scroll-mt-16 overflow-hidden" aria-labelledby="bootable-heading">
      {/* Background glow accents */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-cyan-600/10 via-indigo-600/10 to-purple-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            <Disc className="w-3.5 h-3.5" />
            <span>Dedicated Bootable OS Horizon</span>
          </div>

          <h2 id="bootable-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            More than an <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">application</span>.
          </h2>

          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            CaelumOS is being engineered toward a standalone, bootable operating environment designed specifically for modern cloud infrastructure, systems engineering, and developer workflows.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>STATUS: IN DEVELOPMENT</span>
          </div>
        </div>

        {/* 6 Core Focus Areas */}
        <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {focusAreas.map((area) => (
            <div 
              key={area.title}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-cyan-500/30 transition-all"
            >
              <h3 className="text-xs font-bold text-white font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>{area.title}</span>
              </h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed font-normal">
                {area.desc}
              </p>
            </div>
          ))}
          <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex flex-col justify-center text-center sm:text-left">
            <span className="text-[11px] font-mono text-cyan-300 font-bold uppercase tracking-wider">Architecture Stance</span>
            <span className="text-xs text-slate-300 mt-1 font-mono">Bare-metal ISO & VM targets &bull; Zero web emulation</span>
          </div>
        </div>

        {/* 5-Step Bootable OS Pipeline: BOOT ↓ CAELUMOS ↓ BUILD ↓ DEPLOY ↓ MANAGE */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold">
              Execution Lifecycle Pipeline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {osStages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div 
                  key={stage.name}
                  className="p-5 rounded-2xl bg-neutral-900/60 border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between hover:border-cyan-500/40 transition-all text-center sm:text-left relative group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-xl bg-black/60 border ${stage.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">STAGE 0{idx + 1}</span>
                    </div>

                    <h4 className="text-base font-extrabold text-white tracking-wider font-mono">
                      {stage.name}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed font-normal">
                      {stage.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/[0.06] text-[10px] font-mono text-slate-500 flex items-center justify-between">
                    <span>Phase 03–05</span>
                    {idx < 4 && (
                      <span className="hidden md:inline text-cyan-400 font-bold">&rarr;</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Callout & Action to /download */}
          <div className="mt-10 p-6 rounded-2xl bg-neutral-900/80 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-xl">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2 justify-center sm:justify-start">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Future Bootable ISO & Live USB Release</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                Boot directly into a dedicated Linux workspace preconfigured with Docker, Terraform, Kubernetes, and unified cloud access. No browser sandbox.
              </p>
            </div>

            <Link
              href="/download"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md transition-all whitespace-nowrap active:scale-95"
            >
              <span>View Download & Specs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
