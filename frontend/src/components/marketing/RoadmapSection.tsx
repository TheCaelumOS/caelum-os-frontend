'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  Compass, 
  ArrowRight,
  Sparkles,
  Disc
} from 'lucide-react';

export default function RoadmapSection() {
  const roadmapTiers = [
    {
      stage: "CURRENT",
      title: "Available & Functional",
      badge: "Shipped v0.1",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      items: [
        "Developer workspace prototypes and architectural specifications",
        "Real Docker daemon integration (list, start, stop, restart, logs)",
        "Real Azure ARM SDK client (11 resource types: VMs, Storage, VNets)",
        "Real AWS SDK v3 client (EC2, S3, RDS, STS caller identity)",
        "Terraform sandbox CLI runner (init, validate, plan, apply)",
        "Interactive WebSocket terminal PTY (Xterm.js)",
        "NestJS backend API gateway with JWT Bearer authentication",
        "PostgreSQL database persistence with Prisma ORM 6.3",
        "Next.js 14 static export deployed on Cloudflare Pages (caleum.me)"
      ]
    },
    {
      stage: "BUILDING",
      title: "Active Engineering",
      badge: "In Progress",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-600 animate-pulse",
      items: [
        "Caleum Intelligence infrastructure & log diagnostic copilot",
        "PostgreSQL-backed CloudConnection credential vaulting (AES-256-GCM)",
        "Unified Web Cloud Control Center UI (/dashboard, /azure)",
        "Kubernetes Helm chart deployment & multi-cluster management",
        "Real-time Prometheus & Grafana metric ingestion collectors",
        "Role-based multi-user workspace sharing and access policies"
      ]
    },
    {
      stage: "FUTURE",
      title: "Strategic Vision",
      badge: "Roadmap Vision",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      dot: "bg-purple-500",
      items: [
        "Bootable hybrid ISO image for bare-metal & hypervisors",
        "Minimal immutable Linux kernel with container supervisor",
        "Hardware-accelerated native Wayland display compositor",
        "Kernel-level eBPF network telemetry & security monitoring",
        "Air-gapped enterprise installer & signed binary updates"
      ]
    }
  ];

  return (
    <section id="roadmap" className="py-24 bg-slate-50/50 border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Engineering Roadmap</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Current, Building &amp; Future
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Transparent milestones. We distinguish clearly between what is currently working in production, what is in active development, and what is part of our long-term operating system vision.
          </p>
        </div>

        {/* 3-Column Roadmap Grid */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roadmapTiers.map((tier) => (
            <div 
              key={tier.stage} 
              className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-2 h-2 rounded-full ${tier.dot}`} />
                    <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {tier.stage}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${tier.badgeColor}`}>
                    {tier.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 font-sans">
                  {tier.title}
                </h3>

                {/* Milestone Checklist */}
                <ul className="space-y-2.5 text-xs font-mono text-slate-700 pt-2">
                  {tier.items.map((item) => (
                    <li key={item} className="flex items-start space-x-2.5">
                      <span className="text-blue-600 font-bold">&bull;</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>

              </div>

              {/* Bottom Note */}
              {tier.stage === "FUTURE" && (
                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href="/download"
                    className="inline-flex items-center space-x-1.5 text-xs font-mono text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    <Disc className="w-3.5 h-3.5" />
                    <span>View ISO Distribution Architecture &rarr;</span>
                  </Link>
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}