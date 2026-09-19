"use client";

import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare, 
  FileCode, 
  Server, 
  Cloud, 
  ShieldAlert,
  Terminal,
  Send
} from 'lucide-react';

export default function AiVisionSection() {
  const [selectedPrompt, setSelectedPrompt] = useState<number>(0);

  const prompts = [
    {
      prompt: "Deploy my application with 3 replicas and expose it publicly.",
      plan: "Generate Kubernetes Deployment (3 pods) + Ingress TLS Controller + Cloud Load Balancer",
      infra: "AWS EKS Cluster / VPC Subnet A & B + Route53 DNS record mapping",
      deploy: "Docker image pull -> Rolling rollout -> Healthcheck verified HTTP 200 OK"
    },
    {
      prompt: "Provision a secure PostgreSQL database with automatic backups.",
      plan: "Terraform HCL module for AWS RDS Postgres 15 + AWS KMS encryption key",
      infra: "Private DB Subnet Group + Security Group restricting port 5432 to app VPC",
      deploy: "Terraform plan -> KMS encryption enabled -> 7-day retention backup policy applied"
    },
    {
      prompt: "Scale the Redis cache cluster to handle 10,000 requests/sec.",
      plan: "Redis Cluster sharding configuration + vertical memory tier bump to 8GB",
      infra: "Host Docker cluster resource allocation + kernel sysctl overcommit adjustments",
      deploy: "Hot reconfiguration -> Cluster cluster-meet -> Benchmark latency < 1.2ms"
    }
  ];

  return (
    <section className="py-24 bg-[#09090b] relative overflow-hidden" aria-labelledby="ai-vision-heading">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with clear Future Vision badge */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-mono font-bold text-purple-300 uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Future Vision &bull; Research & Development</span>
          </div>

          <h2 id="ai-vision-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Infrastructure that understands <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
              intent.
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Imagine describing the infrastructure you need in natural language and having CaelumOS translate that intent into verified infrastructure workflows.
          </p>
          <p className="text-slate-500 text-xs font-mono">
            *This capability is part of our Phase 04 AI Infrastructure roadmap and is not yet in production code.
          </p>
        </div>

        {/* Interactive Intent Simulation Console */}
        <div className="mt-16 max-w-4xl mx-auto rounded-2xl border border-white/[0.12] bg-[#0d0d12]/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Natural Language Prompt Selector */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
              Example Natural Language Intent:
            </span>
            <div className="flex flex-wrap gap-2">
              {prompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPrompt(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono text-left transition-all cursor-pointer ${
                    selectedPrompt === idx
                      ? 'bg-purple-600/20 text-purple-200 border border-purple-500/50 shadow-sm'
                      : 'bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:bg-white/[0.06]'
                  }`}
                >
                  Prompt 0{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* User Chat Mockup */}
          <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08] flex items-center space-x-3 text-xs font-mono">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 flex-shrink-0 font-bold">
              You
            </div>
            <div className="flex-1 text-slate-200 font-semibold truncate">
              &ldquo;{prompts[selectedPrompt].prompt}&rdquo;
            </div>
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">Natural Language Intent</span>
          </div>

          {/* 4-Step Intent Pipeline Visual */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            
            {/* Step 1: Intent */}
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-purple-300 font-bold">
                <span>01. INTENT</span>
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                Parsed developer requirements & target constraints.
              </p>
            </div>

            {/* Step 2: Plan */}
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 font-bold">
                <span>02. PLAN</span>
                <FileCode className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] text-slate-300 font-mono leading-relaxed truncate" title={prompts[selectedPrompt].plan}>
                {prompts[selectedPrompt].plan}
              </p>
            </div>

            {/* Step 3: Infrastructure */}
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-indigo-300 font-bold">
                <span>03. INFRA</span>
                <Cloud className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] text-slate-300 font-mono leading-relaxed truncate" title={prompts[selectedPrompt].infra}>
                {prompts[selectedPrompt].infra}
              </p>
            </div>

            {/* Step 4: Deployment */}
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-emerald-300 font-bold">
                <span>04. DEPLOY</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] text-slate-300 font-mono leading-relaxed truncate" title={prompts[selectedPrompt].deploy}>
                {prompts[selectedPrompt].deploy}
              </p>
            </div>

          </div>

          {/* Full Pipeline Flow Summary */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>Pipeline Flow: Intent &rarr; Plan &rarr; Infrastructure &rarr; Deployment</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
              Future Vision
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
