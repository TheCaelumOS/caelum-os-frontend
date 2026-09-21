'use client';

import React from 'react';
import { 
  Cloud, 
  Box, 
  Layers, 
  Terminal, 
  Activity, 
  ShieldCheck 
} from 'lucide-react';

export default function CapabilityStrip() {
  const capabilities = [
    {
      title: "Cloud",
      desc: "AWS, Azure and more.",
      icon: Cloud,
      color: "text-sky-600 bg-sky-50 border-sky-200"
    },
    {
      title: "Containers",
      desc: "Docker and Kubernetes.",
      icon: Box,
      color: "text-blue-600 bg-blue-50 border-blue-200"
    },
    {
      title: "Infrastructure",
      desc: "Terraform and automation.",
      icon: Layers,
      color: "text-purple-600 bg-purple-50 border-purple-200"
    },
    {
      title: "Development",
      desc: "Git, VS Code, terminals.",
      icon: Terminal,
      color: "text-slate-700 bg-slate-100 border-slate-200"
    },
    {
      title: "Monitoring",
      desc: "Grafana and observability.",
      icon: Activity,
      color: "text-amber-600 bg-amber-50 border-amber-200"
    },
    {
      title: "Security",
      desc: "Secure-by-design foundations.",
      icon: ShieldCheck,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200"
    },
  ];

  return (
    <section id="capabilities" className="py-8 bg-slate-50/80 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div 
                key={cap.title}
                className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between space-y-2 group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className={`p-1.5 rounded-lg border ${cap.color} transition-colors group-hover:scale-105`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 font-sans tracking-tight">
                    {cap.title}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 font-sans leading-snug">
                  {cap.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
