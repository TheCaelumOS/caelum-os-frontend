'use client';

import React from 'react';
import { 
  Sparkles, 
  Terminal, 
  Cpu, 
  FileText, 
  AlertCircle, 
  ShieldCheck, 
  Layers,
  Clock
} from 'lucide-react';

export default function IntelligenceSection() {
  const capabilities = [
    {
      title: "Contextual Log & Crash Diagnosis",
      desc: "Analyzes live stdout/stderr streams from Docker containers and Kubernetes pods to identify stack traces, exit code errors, and resource starvation.",
      stage: "Active Development"
    },
    {
      title: "Terraform HCL Synthesis",
      desc: "Translates high-level cloud architecture requirements into syntactically valid Terraform configurations matching HashiCorp provider standards.",
      stage: "Prototype Testing"
    },
    {
      title: "Multi-Cloud Security & Sizing Advice",
      desc: "Reviews AWS and Azure resource parameters to recommend proper instance sizing, public IP exposure warnings, and subnet security configurations.",
      stage: "Research & Modeling"
    },
    {
      title: "PostgreSQL Conversation Persistence",
      desc: "Backend AIConversation schema in Prisma stores session state and message history, enabling persistent context across workspace restarts.",
      stage: "Database Integrated"
    }
  ];

  return (
    <section id="intelligence" className="py-24 bg-slate-50/50 border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Development Warning */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-mono font-semibold text-amber-800 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>In Active Development &bull; Preview Stage</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Caleum Intelligence
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            A purpose-built AI assistant layer engineered specifically for DevOps, container diagnostics, and cloud infrastructure workflows.
          </p>
        </div>

        {/* Core Architecture Explanation */}
        <div className="mt-16 max-w-4xl mx-auto rounded-2xl bg-white border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Engineering Philosophy
              </span>
              <h3 className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                Assistive Telemetry, Not Autonomous Speculation
              </h3>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200 w-fit">
              Prisma: AIConversation Model
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Most generic AI assistants lack real infrastructure context. <strong className="text-slate-900 font-semibold">Caleum Intelligence</strong> is designed to operate directly against your local workspace telemetry — inspecting real container exit codes, parsing Terraform plan diffs, and diagnosing AWS/Azure permission errors without sending sensitive credentials to public model endpoints.
          </p>

          {/* 4 Targeted Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {capabilities.map((cap) => (
              <div key={cap.title} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 font-mono">{cap.title}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                    {cap.stage}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>

          {/* Transparency Disclaimer */}
          <div className="pt-4 border-t border-slate-200 flex items-start space-x-3 text-xs text-slate-500 font-mono">
            <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              Caleum Intelligence will never execute mutating commands (such as <code className="text-slate-800 font-bold">terraform apply</code> or <code className="text-slate-800 font-bold">docker rm</code>) without explicit engineer confirmation in the terminal.
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}