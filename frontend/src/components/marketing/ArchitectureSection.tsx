'use client';

import React from 'react';
import { 
  Cloud, 
  Box, 
  Layers, 
  Terminal, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  GitBranch,
  Lock,
  Workflow
} from 'lucide-react';
import { 
  AwsLogo, 
  AzureLogo, 
  DockerLogo, 
  KubernetesLogo, 
  TerraformLogo, 
  GrafanaLogo 
} from './Logos';

export default function ArchitectureSection() {
  const components = [
    {
      title: "Cloud Integration",
      subtitle: "Multi-Cloud SDK Engine",
      desc: "Authenticated client adapters interacting directly with Azure Resource Manager (ARM) and AWS SDK v3. Inspects and manages VMs, S3 buckets, RDS databases, and resource groups with zero emulation.",
      icon: Cloud,
      tags: ["Azure ARM SDK", "AWS SDK v3", "STS Identity", "Multi-Subscription"]
    },
    {
      title: "Container Runtime",
      subtitle: "Daemon Socket Controller",
      desc: "Direct socket binding to the host Docker daemon via Unix domain sockets (/var/run/docker.sock) or Windows named pipes. Provides live container lifecycle controls and bidirectional log streaming.",
      icon: Box,
      tags: ["Docker Engine API", "Named Pipes", "Socket.io Streams", "OCI Specs"]
    },
    {
      title: "Kubernetes",
      subtitle: "Cluster Orchestration Layer",
      desc: "Multi-cluster kubeconfig parser and watcher interfacing with local Minikube/Kind or remote managed clusters (AKS, EKS). Visualizes pod states, deployment rollouts, and node topologies.",
      icon: Cpu,
      tags: ["Kubeconfig", "@kubernetes/client-node", "Pods & Nodes", "Namespace Scopes"]
    },
    {
      title: "Infrastructure as Code",
      subtitle: "Deterministic IaC Runner",
      desc: "Isolated CLI execution sandbox driving official Terraform binaries. Executes syntax validation, dependency graphing, plan previews, and targeted state inspection.",
      icon: Layers,
      tags: ["Terraform CLI", "HCL Parser", "Execution Sandbox", "State Inspection"]
    },
    {
      title: "Observability",
      subtitle: "Telemetry & Metrics Pipeline",
      desc: "Lightweight metric aggregation pipeline collecting host daemon health, container CPU/memory utilization, network ingress throughput, and structured application logs.",
      icon: Activity,
      tags: ["Live Telemetry", "Container Stats", "Log Aggregation", "Grafana Integration"]
    },
    {
      title: "Developer Tooling",
      subtitle: "Interactive Workspace Primitives",
      desc: "Integrated developer utilities including full PTY terminal emulation over WebSockets (Xterm.js), Monaco-powered code editing, Git stage/commit/diff tracking, and file explorer.",
      icon: Terminal,
      tags: ["Xterm.js PTY", "Monaco Editor", "Git Adapter", "Nautilus FS"]
    },
    {
      title: "Automation",
      subtitle: "Pipeline & Task Coordination",
      desc: "Structured task orchestrator enabling automated dev environment spin-up, container dependency sequencing, and scripted infrastructure provisioning workflows.",
      icon: Workflow,
      tags: ["Task Runner", "Dependency Graph", "Environment Scripts", "CI/CD Hooks"]
    },
    {
      title: "Security",
      subtitle: "Zero-Trust Credential Isolation",
      desc: "Strict credential isolation where cloud access keys and tokens are encrypted at rest with AES-256 cryptography. Secrets are never exposed to client-side bundles or unauthenticated requests.",
      icon: ShieldCheck,
      tags: ["AES-256 Vaulting", "Token Masking", "Role Policies", "Encrypted State"]
    }
  ];

  return (
    <section id="architecture" className="py-24 bg-slate-50/60 border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700 uppercase tracking-wider">
            <span>System Engineering</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Built as an integrated developer environment
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Explore how Caelum organizes cloud integrations, container runtimes, infrastructure automation, and security into a cohesive architectural framework.
          </p>
        </div>

        {/* 8 Modular Architecture Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {components.map((comp) => {
            const Icon = comp.icon;
            return (
              <div 
                key={comp.title}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                      Subsystem
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-sans">
                      {comp.title}
                    </h3>
                    <span className="text-[11px] font-mono text-blue-600 font-medium block mt-0.5">
                      {comp.subtitle}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {comp.desc}
                  </p>
                </div>

                {/* Tech Badges */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {comp.tags.map((tag) => (
                    <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}