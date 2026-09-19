"use client";

import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Sparkles,
  Cpu,
  Layers,
  Container,
  Terminal,
  Server
} from 'lucide-react';
import { 
  DockerLogo, 
  TerraformLogo, 
  AwsLogo, 
  AzureLogo, 
  KubernetesLogo,
  GithubLogo
} from './Logos';

export default function PlatformSection() {
  const integrations = [
    {
      name: "Docker Engine",
      category: "Containers & Daemons",
      tagline: "Container management and workflows.",
      description: "Direct host Docker Engine daemon integration. Inspect running/stopped containers, stream real stdout/stderr logs, inspect images, storage volumes, and trigger lifecycle controls.",
      status: "Implemented",
      statusType: "live",
      icon: DockerLogo,
      href: "/docker",
      accent: "from-cyan-500/20 to-blue-500/10",
      border: "border-cyan-500/30",
      pill: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      details: ["Real Docker CLI v29.6.2", "Container Logs Streaming", "Lifecycle Start/Stop/Restart", "Volumes & Networks"]
    },
    {
      name: "Terraform Provisioner",
      category: "Infrastructure as Code",
      tagline: "Infrastructure as code and provisioning.",
      description: "Embedded HCL configuration editor with live CLI execution. Run automated terraform init, validate, fmt, and plan with isolated workspace state files and streamed terminal feedback.",
      status: "Implemented",
      statusType: "live",
      icon: TerraformLogo,
      href: "/terraform",
      accent: "from-purple-500/20 to-indigo-500/10",
      border: "border-purple-500/30",
      pill: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      details: ["Terraform CLI v1.14.5", "HCL Syntax Workspace", "Live Init, Validate, Plan", "State File Isolation"]
    },
    {
      name: "AWS Cloud Console",
      category: "Cloud Platforms",
      tagline: "Cloud infrastructure and services.",
      description: "Connect to Amazon Web Services to monitor compute, storage, and networking layers. Inspect EC2 virtual servers, S3 buckets, RDS databases, and VPC networks in real time.",
      status: "Implemented",
      statusType: "live",
      icon: AwsLogo,
      href: "/aws",
      accent: "from-amber-500/20 to-orange-500/10",
      border: "border-amber-500/30",
      pill: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      details: ["EC2 Instance Monitoring", "S3 Storage Buckets", "VPC & Subnets Explorer", "CloudWatch Metrics"]
    },
    {
      name: "Azure Cloud Console",
      category: "Cloud Platforms",
      tagline: "Microsoft cloud infrastructure and services.",
      description: "Native Azure subscription monitoring. Visualize resource groups, Virtual Machines, Blob Storage accounts, virtual networks, and manage multi-region cloud services.",
      status: "Implemented",
      statusType: "live",
      icon: AzureLogo,
      href: "/azure",
      accent: "from-blue-500/20 to-sky-500/10",
      border: "border-blue-500/30",
      pill: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      details: ["Virtual Machines (VMs)", "Resource Group Hierarchy", "Azure Blob Storage", "Network Security Groups"]
    },
    {
      name: "Kubernetes Orchestrator",
      category: "Container Orchestration",
      tagline: "Container orchestration and cluster management.",
      description: "Cluster context switching, pod status inspection, namespace isolation, and deployment scaling. Under active development as part of Phase 02 infrastructure.",
      status: "Building",
      statusType: "upcoming",
      icon: KubernetesLogo,
      href: "/kubernetes",
      accent: "from-blue-600/10 to-indigo-600/5",
      border: "border-blue-500/20",
      pill: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      details: ["Namespace & Pod Explorer", "Deployment Rollouts", "Ingress & Service Map", "Cluster Contexts"]
    },
    {
      name: "Git & Linux Terminal",
      category: "Developer Tooling",
      tagline: "Source control and development workflows.",
      description: "Integrated developer terminal with WebSocket bidirectional streaming, paired with Git repository management, local file system manager (Nautilus), and editor tooling.",
      status: "Implemented",
      statusType: "live",
      icon: GithubLogo,
      href: "/terminal",
      accent: "from-emerald-500/20 to-teal-500/10",
      border: "border-emerald-500/30",
      pill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      details: ["WebSocket PTY Terminal", "Git Branch & History", "Nautilus File Manager", "System Diagnostics"]
    },
  ];

  return (
    <section id="platform" className="py-24 bg-[#09090b] relative scroll-mt-16" aria-labelledby="platform-heading">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>Integrations Matrix</span>
          </div>
          <h2 id="platform-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Everything closer to the <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">developer</span>.
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Direct host engine bindings, real CLI processes, and live cloud connectors. No simulated sandboxes or fake metrics.
          </p>
        </div>

        {/* Integration Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((item) => (
            <div
              key={item.name}
              className={`p-6 rounded-2xl bg-gradient-to-b ${item.accent} bg-neutral-900/40 border ${item.border} backdrop-blur-xl flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl`}
            >
              <div>
                {/* Header with icon and status pill */}
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08] shadow-inner">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider flex items-center gap-1.5 ${item.pill}`}>
                    {item.statusType === 'live' ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ) : (
                      <Clock className="w-3 h-3 text-amber-400" />
                    )}
                    <span>{item.status}</span>
                  </span>
                </div>

                {/* Titles */}
                <div className="mt-5">
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold block">
                    {item.category}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{item.name}</h3>
                  <p className="text-xs font-mono text-cyan-300/80 mt-0.5">&ldquo;{item.tagline}&rdquo;</p>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs text-slate-400 leading-relaxed font-normal">
                  {item.description}
                </p>

                {/* Feature Bullet points */}
                <div className="mt-5 pt-4 border-t border-white/[0.06] space-y-2">
                  {item.details.map((detail) => (
                    <div key={detail} className="flex items-center space-x-2 text-[11px] text-slate-300 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                      <span className="truncate">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architecture & Engine Status */}
              <div className="mt-6 pt-4 border-t border-white/[0.06]">
                <a
                  href="#experience"
                  className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-cyan-500/30 transition-all group"
                >
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>View Architecture Specs</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
