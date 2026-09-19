"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Terminal as TerminalIcon, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  Play, 
  RotateCw, 
  Sparkles,
  ExternalLink,
  Github
} from 'lucide-react';
import { 
  DockerLogo, 
  TerraformLogo, 
  AwsLogo, 
  AzureLogo, 
  KubernetesLogo 
} from './Logos';

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState<'docker' | 'terraform' | 'cloud' | 'terminal'>('docker');

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-tech-grid" aria-labelledby="hero-heading">
      
      {/* Background ambient lighting glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[450px] bg-gradient-to-tr from-cyan-600/15 via-indigo-600/15 to-purple-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Top Announcement Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-inner mb-6">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <span className="text-[10px] sm:text-xs font-mono font-semibold tracking-wider uppercase text-cyan-300">
            THE INFRASTRUCTURE ENVIRONMENT FOR MODERN DEVELOPERS
          </span>
        </div>

        {/* Main Hero Headline */}
        <h1 
          id="hero-heading" 
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.08]"
        >
          Your Infrastructure. <br />
          <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-400 bg-clip-text text-transparent">
            One Unified Environment.
          </span>
        </h1>

        {/* Supporting Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Unify multi-cloud control, local container runtimes, and infrastructure-as-code into a single coherent environment. Moving toward a dedicated bootable operating system for developers and infrastructure teams.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <a
            href="#what-is-caelum"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Explore CaelumOS</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </a>

          <Link
            href="/download"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all hover:text-white"
          >
            <span>Download CaelumOS</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">ISO</span>
          </Link>

          <a
            href="https://github.com/TheCaelumOS/caelum-os-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] transition-all hover:text-white"
          >
            <Github className="w-4 h-4 text-slate-300" />
            <span>View GitHub</span>
          </a>
        </div>

        {/* Trust / Technology Line */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-mono text-slate-400">
          <span className="text-[11px] uppercase tracking-widest text-slate-500">Connected With:</span>
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <AwsLogo className="w-4 h-4" />
            <span>AWS</span>
          </div>
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <AzureLogo className="w-4 h-4" />
            <span>Azure</span>
          </div>
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <DockerLogo className="w-4 h-4" />
            <span>Docker</span>
          </div>
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <TerraformLogo className="w-4 h-4" />
            <span>Terraform</span>
          </div>
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <KubernetesLogo className="w-4 h-4" />
            <span>Kubernetes</span>
          </div>
        </div>

        {/* Interactive CaelumOS UI Showcase Mockup */}
        <div className="mt-14 relative max-w-5xl mx-auto">
          {/* Glass frame */}
          <div className="rounded-2xl border border-white/[0.12] bg-[#0c0c10]/90 backdrop-blur-2xl shadow-2xl overflow-hidden text-left">
            
            {/* Window titlebar */}
            <div className="h-10 bg-[#121218] border-b border-white/[0.08] px-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-xs font-mono text-slate-400 font-bold hidden sm:inline">
                  caelum-os://environment/unified-workspace
                </span>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center space-x-1 bg-black/40 p-0.5 rounded-lg border border-white/[0.06]">
                <button
                  onClick={() => setActiveTab('docker')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-colors ${
                    activeTab === 'docker' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Docker
                </button>
                <button
                  onClick={() => setActiveTab('terraform')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-colors ${
                    activeTab === 'terraform' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Terraform
                </button>
                <button
                  onClick={() => setActiveTab('cloud')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-colors ${
                    activeTab === 'cloud' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Multi-Cloud
                </button>
                <button
                  onClick={() => setActiveTab('terminal')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-colors ${
                    activeTab === 'terminal' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Terminal
                </button>
              </div>
            </div>

            {/* Tab 1: Real Docker Engine Preview */}
            {activeTab === 'docker' && (
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 border-r border-neutral-800/80 pr-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">Containers (3 Active)</span>
                    <span className="text-[10px] font-mono text-cyan-400">Docker v29.6.2</span>
                  </div>
                  
                  <div className="p-2.5 rounded-xl bg-blue-600/15 border border-blue-500/40 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">caelum-postgres</span>
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded uppercase bg-green-500/20 text-green-400 border border-green-500/30">running</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">postgres:15-alpine</span>
                    <span className="text-[9px] text-cyan-400/80 font-mono">ID: 1bfd4562e859 &bull; Port: 5432</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">caelum-redis</span>
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded uppercase bg-green-500/20 text-green-400 border border-green-500/30">running</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">redis:7-alpine</span>
                    <span className="text-[9px] text-slate-500 font-mono">ID: b57fb8bdc152 &bull; Port: 6379</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">keen_pascal</span>
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded uppercase bg-red-500/20 text-red-400 border border-red-500/30">exited</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">hello-world</span>
                    <span className="text-[9px] text-slate-500 font-mono">ID: c9c396a8eb98</span>
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col min-h-[260px] bg-black/60 rounded-xl border border-neutral-800/80 p-3.5 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-[11px] text-slate-400">
                    <span>Logs: <strong className="text-white">caelum-postgres (1bfd4562e859)</strong></span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Stream: stdout/stderr
                    </span>
                  </div>
                  <pre className="mt-2.5 text-[10px] leading-relaxed text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono">
{`2026-08-19 06:31:26.225 UTC [1] LOG: starting PostgreSQL 15.18 on x86_64-pc-linux-musl
2026-08-19 06:31:26.225 UTC [1] LOG: listening on IPv4 address "0.0.0.0", port 5432
2026-08-19 06:31:26.225 UTC [1] LOG: listening on IPv6 address "::", port 5432
2026-08-19 06:31:26.230 UTC [1] LOG: listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
2026-08-19 06:31:28.010 UTC [27] LOG: checkpoint starting: end-of-recovery immediate wait
2026-08-19 06:31:28.030 UTC [27] LOG: checkpoint complete: wrote 3 buffers (0.0%); 0 WAL file(s) added
2026-08-19 06:31:28.044 UTC [1] LOG: database system is ready to accept connections`}
                  </pre>
                </div>
              </div>
            )}

            {/* Tab 2: Terraform Provisioner Preview */}
            {activeTab === 'terraform' && (
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div className="bg-black/60 rounded-xl border border-neutral-800 p-3.5 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-[11px] text-purple-300 font-bold">
                    <span>main.tf (HCL Config)</span>
                    <span className="text-slate-500 font-normal">Workspace: default</span>
                  </div>
                  <pre className="text-[10px] leading-relaxed text-slate-300 overflow-x-auto">
{`terraform {
  required_version = ">= 1.5.0"
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
}

resource "local_file" "caelum_infra" {
  filename = "caelum_state.json"
  content  = jsonencode({
    cluster = "caelum-primary"
    status  = "provisioned"
  })
}`}
                  </pre>
                </div>

                <div className="bg-black/80 rounded-xl border border-neutral-800 p-3.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-[11px] text-slate-400">
                      <span>Terraform Execution Output</span>
                      <span className="text-emerald-400">Exit: 0</span>
                    </div>
                    <pre className="text-[10px] leading-relaxed text-emerald-400/90 whitespace-pre-wrap">
{`$ terraform plan
Terraform used the selected providers to generate the following execution plan:

  # local_file.caelum_infra will be created
  + resource "local_file" "caelum_infra" {
      + content  = (known after apply)
      + filename = "caelum_state.json"
    }

Plan: 1 to add, 0 to change, 0 to destroy.`}
                    </pre>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-neutral-800">
                    <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-bold">terraform init</span>
                    <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-bold">terraform validate</span>
                    <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold">terraform plan</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Cloud Consoles Preview */}
            {activeTab === 'cloud' && (
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                  <div className="flex items-center space-x-2.5 pb-2 border-b border-neutral-800">
                    <AwsLogo className="w-5 h-5" />
                    <div>
                      <h4 className="text-xs font-bold text-white">AWS Integration</h4>
                      <span className="text-[10px] font-mono text-emerald-400">Active Connector &bull; us-east-1</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-neutral-800/50">
                      <span className="text-slate-400">EC2 Instances</span>
                      <span className="font-mono font-bold text-white">2 Running</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/50">
                      <span className="text-slate-400">S3 Storage Buckets</span>
                      <span className="font-mono font-bold text-white">4 Buckets</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">VPC Networks</span>
                      <span className="font-mono font-bold text-white">1 Default VPC</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                  <div className="flex items-center space-x-2.5 pb-2 border-b border-neutral-800">
                    <AzureLogo className="w-5 h-5" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Azure Cloud Console</h4>
                      <span className="text-[10px] font-mono text-cyan-400">Active Connector &bull; eastus</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-neutral-800/50">
                      <span className="text-slate-400">Virtual Machines</span>
                      <span className="font-mono font-bold text-white">1 Active VM</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/50">
                      <span className="text-slate-400">Storage Accounts</span>
                      <span className="font-mono font-bold text-white">2 Accounts</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Resource Groups</span>
                      <span className="font-mono font-bold text-white">rg-caelum-prod</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Interactive Linux Terminal Preview */}
            {activeTab === 'terminal' && (
              <div className="p-4 sm:p-6 bg-black/80 font-mono text-xs space-y-3 min-h-[260px]">
                <div className="text-slate-400 text-[11px] pb-2 border-b border-neutral-800 flex justify-between">
                  <span>linux@caelum-os:~ (WebSocket Session 1)</span>
                  <span className="text-emerald-400">Connected</span>
                </div>
                <div className="space-y-1 text-slate-300 text-[11px]">
                  <p><span className="text-emerald-400">linux@caelum-os:~$</span> uname -a</p>
                  <p className="text-slate-400">Linux caelum-workspace 6.5.0-x86_64 #1 SMP PREEMPT_DYNAMIC CaelumOS Unified</p>
                  <p className="mt-2"><span className="text-emerald-400">linux@caelum-os:~$</span> docker --version && terraform --version</p>
                  <p className="text-slate-400">Docker version 29.6.2, build 92954c3</p>
                  <p className="text-slate-400">Terraform v1.14.5 on windows_amd64</p>
                  <p className="mt-2"><span className="text-emerald-400">linux@caelum-os:~$</span> <span className="animate-pulse">_</span></p>
                </div>
              </div>
            )}

            {/* Bottom bar of preview */}
            <div className="h-9 bg-[#0d0d12] border-t border-white/[0.06] px-4 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Caelum Engine Online &bull; Port 4000</span>
              </div>
              <a
                href="#experience"
                className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-semibold"
              >
                <span>View Architecture</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
