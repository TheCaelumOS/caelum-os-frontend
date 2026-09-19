'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  CircleDot, 
  MapPin, 
  Compass, 
  Layers, 
  Cpu, 
  Cloud, 
  Sparkles, 
  ShieldCheck,
  Download,
  Disc,
  HardDrive,
  Github,
  ArrowRight,
  Flame
} from 'lucide-react';

export default function RoadmapSection() {
  const phases = [
    {
      phase: "01",
      title: "FOUNDATION",
      subtitle: "Current development",
      status: "COMPLETED",
      statusBadge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      border: "border-emerald-500/30",
      dot: "bg-emerald-400",
      items: [
        "Core CaelumOS architecture and unified interface layout",
        "Local process manager & background daemon coordination",
        "Initial AWS & Azure SDK connectors with live host credentials",
        "Real Docker Engine v29 runtime integration (containers, streaming logs)",
        "Terraform CLI execution engine with isolated state validation",
        "WebSocket PTY Linux shell terminal with full command stream"
      ]
    },
    {
      phase: "02",
      title: "INFRASTRUCTURE",
      subtitle: "Docker / Terraform / Kubernetes / cloud integrations",
      status: "IN DEVELOPMENT",
      statusBadge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      border: "border-cyan-500/30",
      dot: "bg-cyan-400 animate-pulse",
      items: [
        "Kubernetes cluster contexts, namespace management & pod inspection",
        "Multi-cloud telemetry synchronization (AWS CloudWatch & Azure Monitor)",
        "Advanced container network bridge visualization and volume inspector",
        "Automated Terraform plan diff previews and execution graph rendering",
        "Multi-region cloud asset explorer with instant resource discovery"
      ]
    },
    {
      phase: "03",
      title: "BOOTABLE OS",
      subtitle: "CaelumOS bootable environment",
      status: "IN DEVELOPMENT",
      statusBadge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      border: "border-amber-500/30",
      dot: "bg-amber-400 animate-pulse",
      items: [
        "Minimal immutable Linux kernel image with native hardware support",
        "Bootable ISO installation installer for x86_64 & ARM64 platforms",
        "Embedded hypervisor and container daemon bootstrap on power-on",
        "Hardware-level GPU and virtualization pass-through for local AI/containers",
        "Zero-configuration developer workstation ready to provision upon boot"
      ]
    },
    {
      phase: "04",
      title: "CAELUM CLOUD",
      subtitle: "Future cloud control plane",
      status: "PLANNED",
      statusBadge: "bg-purple-500/10 text-purple-300 border-purple-500/20",
      border: "border-purple-500/20",
      dot: "bg-purple-400",
      items: [
        "Distributed SaaS control plane for multi-node team infrastructure",
        "Remote infrastructure node orchestration and drift alerting",
        "Multi-tenant team workspaces with fine-grained RBAC permissioning",
        "Centralized audit logging, secret vault integration, and key rotation",
        "Cross-cloud compliance reporting and budget threshold triggers"
      ]
    },
    {
      phase: "05",
      title: "AI INFRASTRUCTURE",
      subtitle: "Future intelligent infrastructure workflows",
      status: "FUTURE VISION",
      statusBadge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
      border: "border-indigo-500/20",
      dot: "bg-indigo-400",
      items: [
        "Natural language intent translation into validated HCL & Kubernetes YAML",
        "Autonomous log anomaly detection and real-time failure remediation",
        "Intelligent cloud cost recommendations and resource rightsizing",
        "Automated security vulnerability scanning with zero-touch patch suggestions"
      ]
    }
  ];

  return (
    <section id="roadmap" className="py-24 bg-[#09090b] relative scroll-mt-16" aria-labelledby="roadmap-heading">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Milestones & Trajectory</span>
          </div>

          <h2 id="roadmap-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Engineering <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Roadmap</span>.
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Transparent progress tracking. We strictly differentiate between what is implemented today, what is actively under development, and what is scheduled for future vision phases.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 font-mono text-[11px]">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">COMPLETED</span>
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">IN DEVELOPMENT</span>
            <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">PLANNED</span>
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">FUTURE VISION</span>
          </div>
        </div>

        {/* Timeline Stack */}
        <div className="mt-16 space-y-6 max-w-4xl mx-auto">
          {phases.map((phase) => (
            <div
              key={phase.title}
              className={`p-6 sm:p-7 rounded-2xl bg-neutral-900/40 border ${phase.border} backdrop-blur-xl transition-all hover:bg-neutral-900/60`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center space-x-3">
                  <span className={`w-3 h-3 rounded-full ${phase.dot}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500 font-bold tracking-widest uppercase">
                        STAGE {phase.phase}
                      </span>
                      <span className="text-slate-600">&bull;</span>
                      <span className="text-xs font-mono text-cyan-400/90">{phase.subtitle}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight font-mono mt-0.5">
                      {phase.title}
                    </h3>
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border uppercase tracking-wider w-fit ${phase.statusBadge}`}>
                  {phase.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {phase.items.map((item) => (
                  <div key={item} className="flex items-start space-x-2 text-xs text-slate-300 font-mono">
                    {phase.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : phase.status === 'IN DEVELOPMENT' ? (
                      <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CircleDot className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Future Download CaelumOS CTA */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-cyan-950/40 via-neutral-900/90 to-indigo-950/40 border border-cyan-500/30 p-8 sm:p-10 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-widest">
                <Disc className="w-3.5 h-3.5" />
                <span>Bootable OS &bull; Target Distribution</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Download CaelumOS
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                The standalone bootable operating system is currently in active development. When ready, bootable ISO and live USB images for x86_64 and ARM64 will be available for direct download.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Bare-Metal & VM Image</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>x86_64 / ARM64</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zero Web Emulation</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto flex-shrink-0">
              <Link
                href="/download"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-500/20"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Go to Download Page</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
              </Link>

              <a
                href="https://github.com/TheCaelumOS/caelum-os-frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-xs font-semibold text-slate-200 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all hover:text-white"
              >
                <Github className="w-4 h-4 text-cyan-300" />
                <span>Follow on GitHub</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
