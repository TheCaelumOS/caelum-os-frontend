"use client";

import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Layers
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
      name: "Docker Engine Daemon",
      category: "Containers & Daemons",
      tagline: "Direct host daemon control.",
      description: "Direct host Docker Engine integration via local named pipes and sockets. Inspect containers, stream live stdout/stderr logs, inspect images and volumes, and trigger lifecycle actions.",
      status: "Implemented",
      statusType: "live",
      icon: DockerLogo,
      details: ["Real Docker Engine v29", "Container Logs Streaming", "Lifecycle Start/Stop/Restart", "Volumes & Local Networks"]
    },
    {
      name: "Terraform Provisioner",
      category: "Infrastructure as Code",
      tagline: "Declarative infrastructure management.",
      description: "Embedded HCL configuration workspace with live CLI execution. Run automated init, validate, format, and plan with isolated workspace state files and streamed terminal feedback.",
      status: "Implemented",
      statusType: "live",
      icon: TerraformLogo,
      details: ["Terraform CLI v1.14", "HCL Syntax Workspace", "Live Init, Validate, Plan", "State File Isolation"]
    },
    {
      name: "AWS Cloud Console",
      category: "Public Cloud Platforms",
      tagline: "Amazon Web Services integration.",
      description: "Connect to Amazon Web Services to inspect compute, storage, and networking layers. View EC2 instances, S3 buckets, RDS databases, and verify AWS STS caller identity in real time.",
      status: "Implemented",
      statusType: "live",
      icon: AwsLogo,
      details: ["EC2 Instance Monitoring", "S3 Storage Buckets", "AWS STS Identity", "RDS Database Visibility"]
    },
    {
      name: "Azure Cloud Console",
      category: "Public Cloud Platforms",
      tagline: "Microsoft Azure infrastructure.",
      description: "Native Azure subscription monitoring. Visualize resource groups, Virtual Machines, Blob Storage accounts, virtual networks, and manage multi-region cloud services.",
      status: "Implemented",
      statusType: "live",
      icon: AzureLogo,
      details: ["Virtual Machines (VMs)", "Resource Group Hierarchy", "Azure Blob Storage", "Subscription Resolution"]
    },
    {
      name: "Kubernetes Orchestrator",
      category: "Container Orchestration",
      tagline: "Cluster and workload management.",
      description: "Cluster context switching, pod status inspection, namespace isolation, and deployment status observation. Designed to coordinate multi-cluster workflows.",
      status: "Active Development",
      statusType: "upcoming",
      icon: KubernetesLogo,
      details: ["Namespace & Pod Explorer", "Deployment Rollouts", "Ingress & Service Map", "Cluster Contexts"]
    },
    {
      name: "Git & Linux Terminal",
      category: "Developer Tooling",
      tagline: "Source control and system workflows.",
      description: "Integrated developer terminal with WebSocket bidirectional streaming, paired with Git repository management, local file explorer, and development tooling.",
      status: "Implemented",
      statusType: "live",
      icon: GithubLogo,
      details: ["WebSocket PTY Terminal", "Git Branch & History", "Nautilus File Manager", "System Diagnostics"]
    },
  ];

  return (
    <section id="platform" className="py-24 bg-slate-50/60 border-b border-slate-200 scroll-mt-16" aria-labelledby="platform-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Platform Capabilities</span>
          </div>

          <h2 id="platform-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Unified Platform Capabilities
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Direct host engine bindings, real CLI processes, and live cloud connectors. No simulated sandboxes or fake metrics.
          </p>
        </div>

        {/* Integration Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((item) => (
            <div
              key={item.name}
              className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div>
                {/* Header with icon and status pill */}
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 shadow-xs">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-mono font-medium px-2.5 py-1 rounded-full border uppercase tracking-wider flex items-center gap-1.5 ${
                    item.statusType === 'live'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {item.statusType === 'live' ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    ) : (
                      <Clock className="w-3 h-3 text-amber-600" />
                    )}
                    <span>{item.status}</span>
                  </span>
                </div>

                {/* Titles */}
                <div className="mt-5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold block">
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 font-sans mt-0.5">{item.name}</h3>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">{item.tagline}</p>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs text-slate-600 leading-relaxed font-normal">
                  {item.description}
                </p>

                {/* Feature Bullet points */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5">
                  {item.details.map((detail) => (
                    <div key={detail} className="flex items-center space-x-2 text-[11px] text-slate-700 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="truncate">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architecture Link */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href="#experience"
                  className="w-full inline-flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 transition-colors"
                >
                  <span className="font-mono text-[11px]">View Architecture Specs</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
