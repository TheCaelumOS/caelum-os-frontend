'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Compass, 
  ArrowRight,
  Shield,
  Layers,
  Box,
  Cloud,
  Cpu,
  Activity,
  Workflow,
  Disc,
  Users
} from 'lucide-react';

export default function RoadmapSection() {
  const stages = [
    {
      title: "Foundation",
      desc: "Core workspace architecture, Next.js static export on Cloudflare Pages, NestJS 11 gateway, and PostgreSQL/Prisma relational schema.",
      status: "Completed",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      icon: Layers
    },
    {
      title: "Cloud Integrations",
      desc: "Direct authenticated SDK integration for AWS (EC2, S3, RDS, STS identity) and Azure ARM (11 resource types, VMs, storage accounts).",
      status: "In Progress",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-600 animate-pulse",
      icon: Cloud
    },
    {
      title: "Container Integration",
      desc: "Host Docker daemon socket binding via Unix domain sockets and Windows named pipes, container lifecycle management, and log streaming.",
      status: "In Progress",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-600 animate-pulse",
      icon: Box
    },
    {
      title: "Kubernetes Integration",
      desc: "Multi-cluster kubeconfig parser, real-time pod/namespace topology watcher, and Helm deployment release tracking.",
      status: "Planned",
      statusColor: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
      icon: Cpu
    },
    {
      title: "Observability",
      desc: "Unified metrics pipeline collecting container stats, network throughput, and host system health with Grafana visualization adapters.",
      status: "Planned",
      statusColor: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
      icon: Activity
    },
    {
      title: "Automation",
      desc: "Declarative environment provisioning, automated toolchain bootstrapping, and multi-service dependency execution graphs.",
      status: "Planned",
      statusColor: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
      icon: Workflow
    },
    {
      title: "Bootable CaelumOS",
      desc: "Minimal immutable Linux distribution with container supervisor and native display compositor, distributed as a bootable hybrid ISO.",
      status: "Planned",
      statusColor: "bg-purple-50 text-purple-700 border-purple-200",
      dot: "bg-purple-500",
      icon: Disc
    },
    {
      title: "Community Ecosystem",
      desc: "Public RFC specification process, plugin authoring SDK, package distribution registry, and open contributor governance.",
      status: "In Progress",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-600 animate-pulse",
      icon: Users
    }
  ];

  return (
    <section id="roadmap" className="py-24 bg-slate-50/50 border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700 uppercase tracking-wider">
            <span>Engineering Timeline</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Project Roadmap
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Transparent engineering milestones. Progress is updated based strictly on verified implementation in the public repository.
          </p>
        </div>

        {/* 8 Stages Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div 
                key={stage.title}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      STAGE 0{idx + 1}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${stage.statusColor} flex items-center gap-1.5`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${stage.dot}`} />
                      {stage.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-md bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 font-sans">
                      {stage.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {stage.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Target: Open Source</span>
                  <span className="text-slate-600 font-semibold">Track on GitHub &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}