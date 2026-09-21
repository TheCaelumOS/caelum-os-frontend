'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Disc, 
  Cpu, 
  Layers, 
  Terminal, 
  ArrowRight, 
  ShieldCheck, 
  Box, 
  Cloud, 
  HardDrive 
} from 'lucide-react';
import { LinuxLogo, CaleumLogo } from './Logos';

export default function CaelumOsBootableSection() {
  const pillars = [
    {
      title: "Bootable OS",
      desc: "Bare-metal Linux distribution optimized specifically for software engineers and systems developers without consumer OS bloat.",
      icon: Disc
    },
    {
      title: "Native Developer Environment",
      desc: "Hardware-accelerated terminal workflows, high-throughput text rendering, and direct GPU access for demanding local workloads.",
      icon: Terminal
    },
    {
      title: "Cloud-Native Tooling",
      desc: "Pre-integrated SDKs, cloud provider authenticators, and automated credential rotation baked directly into system initialization.",
      icon: Cloud
    },
    {
      title: "Container Workflows",
      desc: "Kernel-level OCI container supervisor with zero VM virtualization overhead, enabling instantaneous container spin-up.",
      icon: Box
    },
    {
      title: "Infrastructure Tooling",
      desc: "Deterministic IaC compilers, local Terraform runners, and in-kernel eBPF packet inspection tools pre-installed and tuned.",
      icon: Layers
    },
    {
      title: "Developer-Focused Workspace",
      desc: "Tiling window manager customized for multi-monitor setups, side-by-side terminal splits, and unified context retention.",
      icon: Cpu
    }
  ];

  return (
    <section id="caelumos" className="py-24 bg-white border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Card Container */}
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-8 sm:p-12 lg:p-16 shadow-xs relative overflow-hidden">
          
          {/* Header Area */}
          <div className="max-w-3xl space-y-4">
            
            {/* Honest Status Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-mono font-bold text-blue-700 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>IN DEVELOPMENT</span>
              <span className="text-slate-300">&bull;</span>
              <span className="text-slate-600 font-normal">Dedicated Operating System</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
              CaelumOS
            </h2>

            <p className="text-base sm:text-xl text-slate-600 font-normal leading-relaxed">
              A bootable developer operating environment is being developed as a separate part of the Caelum project.
            </p>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl font-mono">
              Designed to overcome browser sandbox limitations, CaelumOS will boot directly on bare metal and hypervisors, delivering line-rate network performance, native eBPF tracing, and deterministic container scheduling.
            </p>

          </div>

          {/* 6 Capabilities Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={pillar.title}
                  className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center space-x-2 text-blue-600 font-bold text-sm">
                    <Icon className="w-4 h-4" />
                    <span className="text-slate-900 font-sans">{pillar.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA Strip */}
          <div className="mt-12 pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-xs font-mono text-slate-600">
              <LinuxLogo className="w-5 h-5 text-slate-700" />
              <span>Target: x86_64 &amp; AArch64 &bull; Hybrid ISO Distribution</span>
            </div>

            <Link
              href="/download"
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs group"
            >
              <span>Learn about CaelumOS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
