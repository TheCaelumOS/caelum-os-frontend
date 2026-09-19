'use client';

import React from 'react';
import { 
  Compass, 
  ArrowDown, 
  Cloud, 
  Server, 
  ShieldCheck, 
  Cpu, 
  Users, 
  Radio,
  Lock,
  Globe,
  Terminal,
  Layers,
  Sparkles
} from 'lucide-react';
import { CaelumLogo, DockerLogo, TerraformLogo, AwsLogo, AzureLogo, KubernetesLogo } from './Logos';

export default function VisionSection() {
  const futureArchitecture = [
    {
      level: "01",
      name: "Developer",
      subtitle: "Interactive Workstation",
      desc: "Engineers interface with low-latency terminal, HCL definitions, and application code.",
      tag: "Local Workstation",
      tagColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
      icon: Users
    },
    {
      level: "02",
      name: "CaelumOS",
      subtitle: "Unified Operating Environment",
      desc: "Bootable environment and native system coordinator orchestrating container runtimes and cloud credentials.",
      tag: "Operating Layer",
      tagColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
      icon: CaelumLogo
    },
    {
      level: "03",
      name: "Caelum Cloud Control Plane",
      subtitle: "Centralized Orchestration Plane",
      desc: "Distributed coordination plane for multi-tenant fleet state synchronization, cross-cloud policies, audit trails, and team collaboration.",
      tag: "Future Vision (SaaS Horizon)",
      tagColor: "bg-purple-500/20 text-purple-300 border-purple-500/30 font-bold",
      icon: Cloud,
      highlight: true
    },
    {
      level: "04",
      name: "AWS / Azure / Kubernetes / Docker",
      subtitle: "Multi-Cloud & Engine Fabric",
      desc: "Real production compute fabrics, managed cloud services, container clusters, and distributed infrastructure nodes.",
      tag: "Production Infrastructure",
      tagColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      icon: Server
    }
  ];

  return (
    <section id="vision" className="py-24 bg-[#09090c] relative scroll-mt-16 border-y border-white/[0.06] overflow-hidden" aria-labelledby="vision-heading">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Future SaaS Vision</span>
          </div>

          <h2 id="vision-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            From local environment to <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-400 bg-clip-text text-transparent">
              cloud control plane.
            </span>
          </h2>

          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            In the future, CaelumOS may expand beyond a single bootable developer environment into a broader multi-cloud infrastructure control plane.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold uppercase tracking-wider">
            <span>LABEL: FUTURE VISION</span>
          </div>
        </div>

        {/* Vision Architecture: Developer -> CaelumOS -> Caelum Cloud Control Plane -> AWS/Azure/Kubernetes/Docker */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-white/[0.1] bg-neutral-900/70 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-3">
            
            <div className="text-center pb-4 border-b border-white/[0.08]">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
                Conceptual Control Plane Architecture
              </span>
            </div>

            <div className="space-y-2.5">
              {futureArchitecture.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={item.name} className="relative">
                    <div className={`p-4 sm:p-5 rounded-xl border transition-all ${
                      item.highlight 
                        ? 'bg-purple-950/30 border-purple-500/40 shadow-lg shadow-purple-500/10' 
                        : 'bg-black/40 border-white/[0.06]'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3.5">
                          <div className={`p-2.5 rounded-lg border ${
                            item.highlight ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' : 'bg-neutral-800/80 border-white/[0.08] text-slate-300'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-500 font-bold">TIER {item.level}</span>
                              <h4 className="text-sm sm:text-base font-bold text-white font-mono">{item.name}</h4>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border uppercase tracking-wider w-fit whitespace-nowrap self-start sm:self-center ${item.tagColor}`}>
                          {item.tag}
                        </span>
                      </div>
                    </div>

                    {idx < futureArchitecture.length - 1 && (
                      <div className="flex justify-center py-1">
                        <ArrowDown className="w-4 h-4 text-slate-600" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Note alert */}
            <div className="mt-6 p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs font-mono text-purple-300 flex items-start space-x-3">
              <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block uppercase tracking-wider">Transparent Roadmap Notice</span>
                <p className="text-slate-400 font-sans leading-relaxed">
                  The SaaS control plane is an architectural vision for future expansion. CaelumOS is currently focused on the local-first developer environment and bootable operating system foundation.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
