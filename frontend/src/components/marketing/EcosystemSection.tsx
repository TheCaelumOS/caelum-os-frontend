'use client';

import React from 'react';
import { 
  Layers, 
  Cloud, 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  ArrowRight, 
  Info,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { CaleumLogo, CaelumOsLogo } from './Logos';

export default function EcosystemSection() {
  const products = [
    {
      name: "CaelumOS",
      category: "Operating Layer",
      role: "Flagship Developer Operating Environment",
      desc: "Unifies multi-cloud infrastructure, local container runtimes, and developer tooling into a cohesive desktop workspace.",
      status: "Available",
      statusType: "live",
      icon: CaelumOsLogo,
      badge: "Flagship &bull; Current Focus",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200 font-bold",
      href: "#caelum-os"
    },
    {
      name: "Developer Platform",
      category: "Workspace & Team",
      role: "Unified Team Environments & Persistence",
      desc: "Persistent development state, multi-engineer workspace sharing, and collaborative infrastructure debugging sessions.",
      status: "Coming later",
      statusType: "later",
      icon: Layers,
      badge: "Coming later",
      badgeColor: "bg-slate-100 text-slate-600 border-slate-200 font-medium",
      href: "#roadmap"
    },
    {
      name: "Cloud Infrastructure",
      category: "Control Plane",
      role: "Distributed Fleet & Multi-Cloud Fabric",
      desc: "Centralized management plane coordinating remote nodes, cross-cloud policy enforcement, and audit event streams.",
      status: "Roadmap",
      statusType: "roadmap",
      icon: Cloud,
      badge: "Roadmap",
      badgeColor: "bg-slate-100 text-slate-600 border-slate-200 font-medium",
      href: "#roadmap"
    },
    {
      name: "Security",
      category: "Governance & Secrets",
      role: "Zero-Trust Credentials & Compliance",
      desc: "Air-gapped secret keyrings, automated infrastructure drift scanning, and continuous compliance verification.",
      status: "Roadmap",
      statusType: "roadmap",
      icon: ShieldCheck,
      badge: "Roadmap",
      badgeColor: "bg-slate-100 text-slate-600 border-slate-200 font-medium",
      href: "#roadmap"
    },
    {
      name: "Developer Tools",
      category: "Ecosystem & CLI",
      role: "Command-Line Suite & Plugin Marketplace",
      desc: "Modular CLI toolchain and community plugin architecture to extend Caelum across custom cloud environments.",
      status: "Roadmap",
      statusType: "roadmap",
      icon: Terminal,
      badge: "Roadmap",
      badgeColor: "bg-slate-100 text-slate-600 border-slate-200 font-medium",
      href: "#roadmap"
    }
  ];

  return (
    <section id="ecosystem" className="py-24 bg-slate-50/60 border-b border-slate-200 scroll-mt-16" aria-labelledby="ecosystem-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Product Architecture</span>
          </div>

          <h2 id="ecosystem-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            The Caleum Ecosystem
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            CaelumOS is our first major flagship product. The broader Caleum platform is being engineered progressively to provide an end-to-end foundation for modern software infrastructure.
          </p>
        </div>

        {/* Tree Architecture Visualization */}
        <div className="mt-16 max-w-4xl mx-auto">
          
          {/* Top Parent Node: CALEUM */}
          <div className="flex flex-col items-center">
            <div className="p-4 px-6 rounded-2xl bg-white border-2 border-slate-900 shadow-sm flex items-center space-x-3">
              <CaleumLogo className="w-6 h-6" />
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Organization</span>
                <span className="text-base font-extrabold text-slate-900 font-sans">CALEUM</span>
              </div>
            </div>

            {/* Vertical Connector Stem */}
            <div className="w-0.5 h-8 bg-slate-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <div className="w-0.5 h-8 bg-slate-300" />
          </div>

          {/* Children Products List */}
          <div className="space-y-4">
            {products.map((product) => {
              const Icon = product.icon;
              const isLive = product.statusType === 'live';
              return (
                <div 
                  key={product.name}
                  className={`rounded-2xl border transition-all p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isLive 
                      ? 'bg-white border-blue-600/30 shadow-sm ring-1 ring-blue-600/10' 
                      : 'bg-white/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${
                      isLive ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h4 className="text-base font-bold text-slate-900 font-mono">
                          {product.name}
                        </h4>
                        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${product.badgeColor}`}>
                          {product.badge}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700">
                        {product.role}
                      </p>
                      <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                        {product.desc}
                      </p>
                    </div>
                  </div>

                  <div className="self-start sm:self-center flex-shrink-0">
                    {isLive ? (
                      <a
                        href={product.href}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-2xs"
                      >
                        <span>Explore Product</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-400 px-3 py-1 rounded-md bg-slate-50 border border-slate-200/80">
                        In Roadmap
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transparency Statement */}
          <div className="mt-8 p-4 rounded-xl bg-white border border-slate-200 flex items-start space-x-3 text-xs text-slate-600 font-mono">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Progressive Ecosystem Strategy:</strong> CaelumOS is under active development as our first foundational environment. Peripheral platform capabilities (cloud control, team persistence, security vaults) represent planned roadmap phases and are not claimed as released software.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
