'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, Sparkles, Tag, GitCommit } from 'lucide-react';
import { CaleumLogo } from './Logos';

export default function BlogNewsSection() {
  const newsCards = [
    {
      milestone: "2026.2",
      badge: "MILESTONE 2026.2",
      title: "Caelum 2026.2: Cloud, Containers & Infrastructure",
      subtitle: "Cloud, Containers & Infrastructure",
      desc: "A development milestone focused on expanding cloud integrations, container workflows, infrastructure tooling and developer experience. Features direct Docker socket streaming, authenticated Azure ARM resource querying, and sandboxed Terraform CLI runs.",
      status: "Development milestone",
      statusColor: "text-blue-700 bg-blue-50 border-blue-200",
      gradient: "from-[#081736] via-[#051026] to-[#040C1C]"
    },
    {
      milestone: "2026.1",
      badge: "MILESTONE 2026.1",
      title: "Caelum 2026.1: Developer Workspace Foundation",
      subtitle: "Developer Workspace Foundation",
      desc: "Core workspace architecture, tooling integrations and platform foundations. Establishing the modular NestJS API backend gateway, PostgreSQL/Prisma relational schema, and WebSocket-driven terminal PTY sessions.",
      status: "Coming soon",
      statusColor: "text-slate-700 bg-slate-100 border-slate-200",
      gradient: "from-[#0A1329] via-[#080E20] to-[#040714]"
    }
  ];

  return (
    <section id="blog" className="py-24 bg-slate-50/50 border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Latest news from <a href="https://github.com/TheCaelumOS/caelum-os-frontend/releases" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"><span>our blog</span><ArrowRight className="w-6 h-6 inline group-hover:translate-x-1 transition-transform" /></a>
          </h2>
          <p className="text-base text-slate-600 font-normal">
            Official milestone announcements, architecture changelogs, and development updates.
          </p>
        </div>

        {/* 2-Card Release News Grid (Matching Kali Benchmark) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {newsCards.map((card) => (
            <div 
              key={card.milestone}
              className="rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col overflow-hidden group"
            >
              {/* Card Banner Graphic with Release Badge */}
              <div className={`h-48 bg-gradient-to-br ${card.gradient} p-6 relative flex flex-col justify-between overflow-hidden border-b border-slate-200`}>
                <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
                  <CaleumLogo className="w-48 h-48" />
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-white text-slate-900 shadow-xs uppercase tracking-wider">
                    {card.badge}
                  </span>
                  <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-xs text-white">
                    <CaleumLogo className="w-5 h-5" />
                  </div>
                </div>

                <div className="relative z-10">
                  <span className="text-xs font-mono text-blue-300 font-semibold block">
                    Engineering Milestone
                  </span>
                  <h4 className="text-xl font-bold text-white font-sans mt-0.5">
                    Caelum {card.milestone}
                  </h4>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-sans group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {card.desc}
                  </p>
                </div>

                {/* Footer with Clock Icon and Milestone Status */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{card.status}</span>
                  </div>
                  <span className="text-blue-600 font-semibold hover:underline flex items-center gap-0.5">
                    Read milestone &rarr;
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
