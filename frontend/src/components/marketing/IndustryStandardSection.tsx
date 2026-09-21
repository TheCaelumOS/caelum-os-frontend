'use client';

import React from 'react';
import { 
  AppWindow, 
  Sparkles, 
  Cloud, 
  Blocks, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  GitBranch,
  Terminal
} from 'lucide-react';

export default function IndustryStandardSection() {
  const pillars = [
    {
      title: "One Workspace",
      desc: "Bring cloud, infrastructure and development tooling together into a single operating context. Instead of juggling dozens of browser portals and disjointed CLI sessions, developers operate with unified state and coordinated tooling.",
      icon: AppWindow,
      link: "#architecture",
      linkText: "unified architecture"
    },
    {
      title: "Developer First",
      desc: "Reduce environment setup and context switching friction. Pre-configured SDKs, local socket binding, and reproducible configurations mean developers can sit down and engineer immediately without configuration drift.",
      icon: Terminal,
      link: "#tools",
      linkText: "developer tooling"
    },
    {
      title: "Cloud Native",
      desc: "Designed around modern cloud and container workflows. Direct authenticated integration with AWS, Azure, Docker Engine, and Kubernetes clusters allows continuous infrastructure observability and deployment.",
      icon: Cloud,
      link: "#platforms",
      linkText: "cloud runtimes"
    },
    {
      title: "Extensible",
      desc: "Built to integrate with existing engineering tools. Caelum connects directly to your host daemons, Terraform binaries, Git repositories, and local editor environments without vendor lock-in.",
      icon: Blocks,
      link: "#tools",
      linkText: "supported tools"
    },
    {
      title: "Open Source",
      desc: "Designed for transparency, contribution, and community-driven development. With open architectural RFCs, permissive licensing, and public development milestones, Caelum is built in the open with developers worldwide.",
      icon: ShieldCheck,
      link: "https://github.com/TheCaelumOS/caelum-os-frontend",
      linkText: "open source"
    }
  ];

  return (
    <section className="py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Subtitle */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Built for the modern developer
          </h2>
          <p className="text-base sm:text-xl text-slate-600 font-normal leading-relaxed">
            Caelum is not just about isolated tools, nor a simple desktop. Caelum is a <strong className="text-slate-900 font-semibold">platform</strong>.
          </p>
        </div>

        {/* 5-Column Grid (3 Top, 2 Bottom Centered, inspired by Kali benchmark) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.slice(0, 3).map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={pillar.title} 
                className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:bg-white transition-all space-y-3"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-sans">
                    {pillar.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pillars.slice(3, 5).map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={pillar.title} 
                className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:bg-white transition-all space-y-3"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-sans">
                    {pillar.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
