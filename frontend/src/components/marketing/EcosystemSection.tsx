'use client';

import React from 'react';
import { 
  Cloud, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Terminal, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { 
  AwsLogo, 
  AzureLogo, 
  DockerLogo, 
  TerraformLogo, 
  KubernetesLogo, 
  GithubLogo, 
  LinuxLogo, 
  CloudflareLogo,
  CaelumOsLogo
} from './Logos';

export default function EcosystemSection() {
  const ecosystemLayers = [
    {
      title: "Multi-Cloud Infrastructure",
      category: "Compute & Storage Fabric",
      desc: "Connects directly to hyperscale cloud providers with zero intermediary proxy servers.",
      logos: [
        { name: "Amazon Web Services", icon: AwsLogo, desc: "EC2, S3, RDS, STS Identity" },
        { name: "Microsoft Azure", icon: AzureLogo, desc: "VMs, Blob, Resource Groups" },
        { name: "Cloudflare Edge", icon: CloudflareLogo, desc: "Global Edge & Pages CDN" },
      ],
      capabilities: [
        "Live STS caller identity and role assumption",
        "Subscription & Resource Group auto-discovery",
        "Encrypted local credential store in system keyring"
      ]
    },
    {
      title: "Container & Cluster Orchestration",
      category: "Runtimes & Supervision",
      desc: "Communicates natively with host daemons over loopback named pipes and Unix sockets.",
      logos: [
        { name: "Docker Engine", icon: DockerLogo, desc: "Engine v29, Containers, Volumes" },
        { name: "Kubernetes", icon: KubernetesLogo, desc: "Pods, Contexts, Namespaces" },
        { name: "Linux LTS", icon: LinuxLogo, desc: "Kernel 6.x PTY Drivers" },
      ],
      capabilities: [
        "Zero mock sandboxes — connects directly to active daemon",
        "Bidirectional stdout/stderr WebSocket streaming",
        "Real container lifecycle controls (start, stop, inspect)"
      ]
    },
    {
      title: "Infrastructure as Code & Tooling",
      category: "Automation & Workspaces",
      desc: "Declarative orchestration engines integrated directly into developer workspaces.",
      logos: [
        { name: "HashiCorp Terraform", icon: TerraformLogo, desc: "HCL Engine, Init, Plan, Validate" },
        { name: "Git Version Control", icon: GithubLogo, desc: "Branching, Commits, History" },
        { name: "Caelum Supervisor", icon: CaelumOsLogo, desc: "Workspace State Isolation" },
      ],
      capabilities: [
        "Isolated workspace directories prevent statefile collisions",
        "Streamed terminal output with syntax validation",
        "Complete local execution with zero cloud telemetry"
      ]
    }
  ];

  return (
    <section id="ecosystem" className="py-24 bg-white border-b border-slate-200 scroll-mt-16" aria-labelledby="ecosystem-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700 uppercase tracking-wider">
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud & Runtimes Ecosystem</span>
          </div>

          <h2 id="ecosystem-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            The Caelum Cloud Ecosystem
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            A unified operating layer coordinating public clouds, container runtimes, and declarative infrastructure-as-code engines.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {ecosystemLayers.map((layer) => (
            <div
              key={layer.title}
              className="p-6 rounded-xl bg-slate-50/50 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:bg-white transition-all"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    {layer.category}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 font-sans mt-4">
                  {layer.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {layer.desc}
                </p>

                {/* Technology Logos Mini-List */}
                <div className="mt-6 space-y-2.5">
                  {layer.logos.map((tech) => {
                    const Icon = tech.icon;
                    return (
                      <div
                        key={tech.name}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center space-x-3"
                      >
                        <div className="p-1.5 rounded-md bg-slate-50 text-slate-800">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 font-mono leading-tight truncate">
                            {tech.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">
                            {tech.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Technical Capabilities */}
                <div className="mt-6 pt-4 border-t border-slate-200/80 space-y-2">
                  {layer.capabilities.map((cap) => (
                    <div key={cap} className="flex items-start space-x-2 text-[11px] text-slate-700 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom tag */}
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Native Runtime Binding</span>
                <span className="text-emerald-700 font-semibold">&bull; Zero Proxy</span>
              </div>
            </div>
          ))}
        </div>

        {/* Global Architecture Statement */}
        <div className="mt-12 p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-600">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <span>Standardized integrations: AWS STS &bull; Azure ARM &bull; Docker Engine v29 &bull; Terraform 1.14 &bull; Cloudflare Edge</span>
          </div>
          <a
            href="https://github.com/TheCaelumOS/caelum-os-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1 flex-shrink-0"
          >
            <span>View Architecture Specifications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
}
