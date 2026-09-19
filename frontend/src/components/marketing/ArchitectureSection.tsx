'use client';

import React from 'react';
import { 
  Layers, 
  Server, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Network, 
  Lock, 
  Terminal,
  Globe
} from 'lucide-react';

export default function ArchitectureSection() {
  const tiers = [
    {
      tier: "01. Presentation & Edge Tier",
      name: "Next.js 14 Static Export on Cloudflare Pages",
      desc: "Built with React 19, TypeScript, and Tailwind CSS. Compiled into a pure static export (out/ directory) distributed globally via Cloudflare Pages edge CDN with sub-millisecond initial asset delivery.",
      technologies: ["Next.js 14", "React 19", "TypeScript", "Tailwind CSS", "Cloudflare Pages", "Xterm.js"]
    },
    {
      tier: "02. API Gateway & Micro-Monolith",
      name: "NestJS 11 Application Gateway",
      desc: "Modular NestJS backend orchestrating REST API endpoints, JWT Bearer authentication, request validation DTOs, and Socket.io WebSocket gateways for real-time terminal PTY streaming and container logs.",
      technologies: ["NestJS 11", "Node.js 22", "Passport JWT", "Socket.io", "Class Validator", "Swagger OpenAPI"]
    },
    {
      tier: "03. Data & State Persistence Tier",
      name: "PostgreSQL & Prisma ORM with Redis",
      desc: "Relational persistence schema managed via Prisma 6.3. Stores user accounts, isolated workspaces, terminal sessions, activity audits, and AI conversation history, with Redis handling queueing via BullMQ.",
      technologies: ["PostgreSQL", "Prisma ORM 6.3", "Redis", "BullMQ", "Bcrypt Hashing"]
    },
    {
      tier: "04. Cloud & Local Daemon Connectors",
      name: "Official Enterprise SDK Integration Layer",
      desc: "Direct communication with real infrastructure without mock emulation. Interacts with Azure ARM REST APIs, AWS SDK v3 endpoints, local Docker named pipes/sockets, and HashiCorp Terraform CLI.",
      technologies: ["@azure/arm-*", "@aws-sdk/*", "Docker Daemon", "@kubernetes/client-node", "Terraform CLI"]
    },
    {
      tier: "05. Security & Credential Vaulting",
      name: "AES-256 Symmetric Encryption",
      desc: "Cloud credentials and access keys are encrypted at rest using AES-256 cryptography with strict environment secret management. Sensitive API keys are never leaked to client responses.",
      technologies: ["AES-256-CBC/GCM", "Node.js Crypto", "Zero-Trust Masking", "Role-Based Access Control"]
    }
  ];

  return (
    <section id="architecture" className="py-24 bg-white border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider">
            <Server className="w-3.5 h-3.5 text-blue-600" />
            <span>Full-Stack Engineering</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Technical Architecture
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            The authentic stack powering CaleumOS: Next.js on Cloudflare Pages, NestJS micro-monolith API, PostgreSQL, and official cloud provider SDKs.
          </p>
        </div>

        {/* 5 Architecture Tiers */}
        <div className="mt-16 space-y-6 max-w-5xl mx-auto">
          {tiers.map((t) => (
            <div 
              key={t.tier}
              className="p-6 sm:p-8 rounded-2xl bg-slate-50/70 border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                <div>
                  <span className="text-[11px] font-mono text-blue-600 font-bold uppercase tracking-wider block">
                    {t.tier}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                    {t.name}
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {t.desc}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-2">
                {t.technologies.map((tech) => (
                  <span 
                    key={tech} 
                    className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}