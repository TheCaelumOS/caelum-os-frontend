'use client';

import React from 'react';
import { 
  Cloud, 
  Layers, 
  Terminal, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  Cpu, 
  ShieldCheck, 
  FileCode, 
  HardDrive 
} from 'lucide-react';
import { 
  AwsLogo, 
  AzureLogo, 
  DockerLogo, 
  TerraformLogo, 
  KubernetesLogo, 
  GithubLogo, 
  CaelumOsLogo 
} from './Logos';

export default function CaelumOsSection() {
  const capabilities = [
    {
      domain: "Cloud",
      title: "Multi-Cloud Integration",
      description: "Direct connection to enterprise cloud providers for unified resource inspection and identity management.",
      tools: ["AWS", "Azure"],
      features: [
        "AWS EC2, S3, RDS, and CloudWatch metrics",
        "Azure Virtual Machines, Resource Groups & Blob Storage",
        "Local IAM STS & DefaultAzureCredential resolution",
        "Multi-region cloud infrastructure visibility"
      ],
      icon: Cloud,
      accent: "text-blue-600 bg-blue-50 border-blue-100"
    },
    {
      domain: "Infrastructure",
      title: "Runtimes & Provisioning",
      description: "Native coordination with host container daemons and declarative infrastructure-as-code engines.",
      tools: ["Terraform", "Kubernetes", "Docker"],
      features: [
        "Docker Engine v29 runtime & container lifecycle",
        "Terraform & OpenTofu HCL syntax execution & plan diffs",
        "Kubernetes cluster contexts, namespaces & pod status",
        "Isolated workspace state file persistence"
      ],
      icon: Layers,
      accent: "text-purple-600 bg-purple-50 border-purple-100"
    },
    {
      domain: "Development",
      title: "Unified Workspaces",
      description: "Consolidates developer workflows, editing environments, and terminal sessions into a single pane of glass.",
      tools: ["Git", "VS Code", "PTY Terminal", "Workspaces"],
      features: [
        "Low-latency WebSocket PTY Linux shell with root access",
        "Git repository branch management & commit workflows",
        "VS Code editor integration for local code manipulation",
        "Distraction-free environment with isolated process spaces"
      ],
      icon: Terminal,
      accent: "text-emerald-600 bg-emerald-50 border-emerald-100"
    },
    {
      domain: "Operations",
      title: "Live Observability",
      description: "Continuous observation and diagnostics across local containers and remote cloud services.",
      tools: ["Monitoring", "Logs", "Containers", "Lifecycle"],
      features: [
        "Real-time bidirectional stdout/stderr container log streaming",
        "Host daemon socket health checks and status indicators",
        "System telemetry (CPU, memory, storage utilization)",
        "Automated error detection and execution feedback"
      ],
      icon: Activity,
      accent: "text-amber-600 bg-amber-50 border-amber-100"
    }
  ];

  return (
    <section id="caelum-os" className="py-24 bg-slate-50/60 border-b border-slate-200 scroll-mt-16" aria-labelledby="caelum-os-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-bold text-blue-700 uppercase tracking-wider">
            <CaelumOsLogo className="w-3.5 h-3.5" />
            <span>Flagship Operating Environment</span>
          </div>

          <h2 id="caelum-os-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            CaelumOS
          </h2>

          <p className="text-lg sm:text-xl font-medium text-slate-700 leading-snug">
            A developer operating environment built for modern infrastructure.
          </p>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            CaelumOS brings development, container runtimes, infrastructure-as-code, and cloud platforms into one coherent operating layer — eliminating context switching across fragmented browser portals.
          </p>
        </div>

        {/* 4 Capabilities Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div 
                key={cap.domain}
                className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  
                  {/* Domain & Icon */}
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl border ${cap.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {cap.tools.map((tool) => (
                        <span key={tool} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Titles */}
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                      {cap.domain} Domain
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 font-sans mt-0.5">
                      {cap.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {cap.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    {cap.features.map((feat) => (
                      <div key={feat} className="flex items-start space-x-2.5 text-xs text-slate-700 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Sub Card Footer */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Engine: Direct Host Execution</span>
                  <span className="text-emerald-600 font-semibold">&check; Verified</span>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom CTA Block */}
        <div className="mt-14 p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900 font-sans">
              Experience the CaelumOS architecture
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              Inspect how CaelumOS coordinates developer workflows, container runtimes, and multi-cloud infrastructure.
            </p>
          </div>

          <a
            href="#ecosystem"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm"
          >
            <span>Explore CaelumOS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
}
