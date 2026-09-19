'use client';

import React from 'react';
import { 
  Box, 
  Terminal, 
  Layers, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  Cpu, 
  Network,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { DockerLogo, KubernetesLogo, TerraformLogo } from './Logos';

export default function ContainersIacSection() {
  const tools = [
    {
      name: "Docker Workspace",
      category: "Container Engine Daemon",
      icon: DockerLogo,
      badge: "Direct Host Daemon",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      description: "Interacts directly with the local Docker daemon via named pipes on Windows or unix sockets on Linux/macOS. No simulation or wrapper layers.",
      features: [
        "Real container list with CPU/memory status",
        "Live container logs streaming from stdout/stderr",
        "Container lifecycle controls (start, stop, restart, remove)",
        "Image discovery, tags, and container inspect metadata"
      ],
      techNote: "Socket: //./pipe/docker_engine &bull; CLI: docker ps -a"
    },
    {
      name: "Terraform IaC Runner",
      category: "Declarative Infrastructure",
      icon: TerraformLogo,
      badge: "Sandboxed CLI Execution",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      description: "An embedded HCL workspace backed by a sandboxed CLI runner executing authentic HashiCorp Terraform commands with live streamed terminal output.",
      features: [
        "Embedded HCL syntax editor with template loading",
        "Automated CLI execution: init, validate, fmt, plan",
        "Interactive apply and destroy safety controls",
        "WebSocket terminal streaming directly to the client"
      ],
      techNote: "CLI: terraform v1.14 &bull; Sandbox state isolation"
    },
    {
      name: "Kubernetes Orchestrator",
      category: "Container Orchestration",
      icon: KubernetesLogo,
      badge: "Kubeconfig Discovery",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      description: "Connects to your local or remote Kubernetes clusters using the official @kubernetes/client-node library and your local kubeconfig profile.",
      features: [
        "Automatic ~/.kube/config credential auto-discovery",
        "Inspect namespaces, running Pods, and node topologies",
        "Deployment tracking, replica counts, and pod IP mappings",
        "Fallback development mode for offline cluster testing"
      ],
      techNote: "Client: @kubernetes/client-node CoreV1Api / AppsV1Api"
    }
  ];

  return (
    <section id="containers-iac" className="py-24 bg-slate-50/50 border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider">
            <Box className="w-3.5 h-3.5 text-blue-600" />
            <span>Runtimes &amp; Infrastructure as Code</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Docker + Kubernetes + Terraform
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Local container runtimes and declarative infrastructure orchestration integrated directly into your operating workspace.
          </p>
        </div>

        {/* Tools 3-Card Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div key={tool.name} className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-mono">{tool.name}</h3>
                    <span className="text-xs text-slate-500 font-mono">{tool.category}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {tool.description}
                  </p>

                  {/* Features List */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">Capabilities</span>
                    <ul className="space-y-2 text-xs font-mono text-slate-700">
                      {tool.features.map((feat) => (
                        <li key={feat} className="flex items-start space-x-2">
                          <span className="text-blue-600 font-bold">&bull;</span>
                          <span className="text-[11px] leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Bottom Tech Note */}
                <div className="pt-4 border-t border-slate-100 text-[10.5px] font-mono text-slate-500 bg-slate-50 -mx-8 -mb-8 p-4 rounded-b-2xl">
                  <span dangerouslySetInnerHTML={{ __html: tool.techNote }} />
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}