"use client";

import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  MessageSquare, 
  FileCode, 
  Cloud, 
  ShieldCheck, 
  ArrowRight,
  Terminal 
} from 'lucide-react';

export default function AiVisionSection() {
  const [selectedPrompt, setSelectedPrompt] = useState<number>(0);

  const prompts = [
    {
      title: "Kubernetes Microservice",
      prompt: "Deploy my application with 3 replicas and expose it publicly over TLS.",
      plan: "Generate Kubernetes Deployment (3 pods) + Ingress TLS Controller + Cloud Load Balancer",
      infra: "AWS EKS Cluster / VPC Subnet A & B + Route53 DNS record mapping",
      deploy: "Docker image pull -> Rolling rollout -> Healthcheck verified HTTP 200 OK",
      snippet: `# Generated Declarative Specification:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-service
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0`
    },
    {
      title: "Encrypted PostgreSQL Database",
      prompt: "Provision a secure PostgreSQL database with automatic daily backups.",
      plan: "Terraform HCL module for AWS RDS Postgres 15 + AWS KMS encryption key",
      infra: "Private DB Subnet Group + Security Group restricting port 5432 to app VPC",
      deploy: "Terraform plan -> KMS encryption enabled -> 7-day retention backup policy applied",
      snippet: `# Generated Infrastructure HCL:
resource "aws_db_instance" "primary" {
  engine                  = "postgres"
  engine_version          = "15.4"
  instance_class          = "db.t4g.medium"
  storage_encrypted       = true
  kms_key_id              = aws_kms_key.db.arn
  backup_retention_period = 7
}`
    },
    {
      title: "Redis In-Memory Cluster",
      prompt: "Scale the Redis cache cluster to handle high-throughput session workloads.",
      plan: "Redis Cluster sharding configuration + vertical memory tier bump to 8GB",
      infra: "Host Docker cluster resource allocation + kernel sysctl overcommit adjustments",
      deploy: "Hot reconfiguration -> Cluster cluster-meet -> Benchmark latency < 1.2ms",
      snippet: `# Cluster Reconfiguration:
cluster-enabled yes
cluster-node-timeout 5000
maxmemory 8gb
maxmemory-policy volatile-lru`
    }
  ];

  return (
    <section id="ai-vision" className="py-24 bg-white border-b border-slate-200 scroll-mt-16" aria-labelledby="ai-vision-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with clear Future Vision badge */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Research & Vision &bull; Intelligent Infrastructure</span>
          </div>

          <h2 id="ai-vision-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Declarative Intent Architecture
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Exploring how natural language intents translate into verified, auditable Terraform HCL and Kubernetes manifests with policy validation.
          </p>
          <p className="text-xs font-mono text-slate-400">
            *This capability is part of our future Phase 4 research agenda and is not claimed as released software.
          </p>
        </div>

        {/* Interactive Intent Console */}
        <div className="mt-16 max-w-4xl mx-auto rounded-xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Natural Language Prompt Selector */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
              Example Infrastructure Intent:
            </span>
            <div className="flex flex-wrap gap-2">
              {prompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPrompt(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono text-left transition-all cursor-pointer ${
                    selectedPrompt === idx
                      ? 'bg-white text-blue-700 border border-blue-600 font-semibold shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* User Chat Mockup */}
          <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center space-x-3 text-xs font-mono">
            <div className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[11px] flex-shrink-0">
              User Intent
            </div>
            <div className="flex-1 text-slate-900 font-semibold truncate">
              &ldquo;{prompts[selectedPrompt].prompt}&rdquo;
            </div>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Natural Language</span>
          </div>

          {/* 4-Step Intent Pipeline Visual */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
            
            {/* Step 1: Intent */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-blue-700 font-bold">
                <span>01. INTENT</span>
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <p className="text-[11px] text-slate-600 font-mono leading-relaxed">
                Parsed developer constraints & SLOs.
              </p>
            </div>

            {/* Step 2: Plan */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-800 font-bold">
                <span>02. PLAN</span>
                <FileCode className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <p className="text-[11px] text-slate-600 font-mono leading-relaxed truncate" title={prompts[selectedPrompt].plan}>
                {prompts[selectedPrompt].plan}
              </p>
            </div>

            {/* Step 3: Infrastructure */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-800 font-bold">
                <span>03. INFRA</span>
                <Cloud className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <p className="text-[11px] text-slate-600 font-mono leading-relaxed truncate" title={prompts[selectedPrompt].infra}>
                {prompts[selectedPrompt].infra}
              </p>
            </div>

            {/* Step 4: Verification */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-emerald-700 font-bold">
                <span>04. VERIFY</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-[11px] text-slate-600 font-mono leading-relaxed truncate" title={prompts[selectedPrompt].deploy}>
                {prompts[selectedPrompt].deploy}
              </p>
            </div>

          </div>

          {/* Terminal / Snippet Preview */}
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 font-mono text-xs text-cyan-300 shadow-inner overflow-x-auto">
            <pre className="whitespace-pre">{prompts[selectedPrompt].snippet}</pre>
          </div>

          {/* Full Pipeline Flow Summary */}
          <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Pipeline: Natural Language Intent &rarr; Manifest Compilation &rarr; Policy Audit &rarr; Execution</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 self-start sm:self-auto">
              Research Roadmap
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
