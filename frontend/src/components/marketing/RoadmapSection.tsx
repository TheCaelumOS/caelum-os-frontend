'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  CircleDot, 
  Compass, 
  ArrowRight,
  ShieldCheck,
  Disc,
  Layers,
  Sparkles
} from 'lucide-react';

export default function RoadmapSection() {
  const phases = [
    {
      phase: "PHASE 1",
      title: "Foundation",
      status: "Completed / In progress",
      statusBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      border: "border-slate-200 bg-white",
      items: [
        "CaelumOS frontend core layout & window management",
        "Desktop operating environment with GNOME-inspired panel",
        "Application architecture & modular integration framework",
        "Cloud tooling interfaces (EC2, S3, RDS, Azure VMs, Blob storage)",
        "AWS integration foundations with live STS caller identity",
        "Azure integration foundations with dynamic subscription lookup",
        "Docker Engine v29 integration & live container listings",
        "Kubernetes cluster context interfaces & namespace layouts",
        "Terraform HCL syntax editor & validation engine",
        "Git integration & source repository branch management",
        "Cloudflare Pages automated deployment pipeline"
      ]
    },
    {
      phase: "PHASE 2",
      title: "Integrations",
      status: "In progress",
      statusBadge: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-600 animate-pulse",
      border: "border-blue-200 bg-white shadow-xs",
      items: [
        "NestJS backend microservices & PTY socket supervisors",
        "Real local infrastructure engine bindings (Windows pipe & Linux socket)",
        "Local authentication, session management & token security",
        "Direct container lifecycle management (Start, Stop, Restart, Remove)",
        "Bidirectional stdout/stderr container log streaming",
        "Live host telemetry & system resource monitoring",
        "End-to-end infrastructure provisioning workflows"
      ]
    },
    {
      phase: "PHASE 3",
      title: "Platform",
      status: "Planned",
      statusBadge: "bg-slate-100 text-slate-700 border-slate-200",
      dot: "bg-slate-400",
      border: "border-slate-200 bg-white/80",
      items: [
        "Unified developer environment with persistent session states",
        "Persistent user environments across local and remote instances",
        "Centralized multi-cloud resource management & tag synchronization",
        "Advanced infrastructure workflows & automated drift remediation",
        "Developer team collaboration & shared environment debugging"
      ]
    },
    {
      phase: "PHASE 4",
      title: "CaelumOS",
      status: "Future",
      statusBadge: "bg-slate-100 text-slate-500 border-slate-200",
      dot: "bg-slate-300",
      border: "border-slate-200 bg-white/60",
      items: [
        "More complete, standalone operating environment",
        "System-level compositor and hardware acceleration capabilities",
        "Bootable OS experimentation with minimal immutable Linux LTS kernel",
        "Native infrastructure tooling pre-installed at boot time",
        "Direct hardware and virtualization hypervisor integration"
      ]
    }
  ];

  return (
    <section id="roadmap" className="py-24 bg-slate-50/60 border-b border-slate-200 scroll-mt-16" aria-labelledby="roadmap-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Engineering Roadmap</span>
          </div>

          <h2 id="roadmap-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Product Roadmap
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            A transparent overview of what is completed, currently under active development, and planned for future platform iterations.
          </p>
        </div>

        {/* 4 Phases Stack */}
        <div className="mt-16 space-y-6 max-w-4xl mx-auto">
          {phases.map((phase) => (
            <div
              key={phase.phase}
              className={`rounded-2xl border ${phase.border} p-6 sm:p-8 transition-all hover:shadow-xs`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <span className={`w-3 h-3 rounded-full ${phase.dot}`} />
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                      {phase.phase}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-sans">
                      {phase.title}
                    </h3>
                  </div>
                </div>

                <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border uppercase tracking-wider w-fit ${phase.statusBadge}`}>
                  {phase.status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {phase.items.map((item) => (
                  <div key={item} className="flex items-start space-x-2.5 text-xs text-slate-700 font-mono">
                    {phase.status.includes('Completed') ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : phase.status === 'In progress' ? (
                      <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CircleDot className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Integrity Notice & Link to Releases */}
        <div className="mt-12 max-w-4xl mx-auto p-6 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 font-sans flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Development Authenticity Commitment</span>
            </h4>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              We never fabricate capabilities that do not exist. Future phases represent scheduled engineering deliverables and are not released as production software until rigorously validated.
            </p>
          </div>

          <Link
            href="/download"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors whitespace-nowrap"
          >
            <span>View Release Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
