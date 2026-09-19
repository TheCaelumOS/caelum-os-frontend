import React from 'react';
import { 
  Terminal, 
  Layers, 
  Workflow, 
  Cpu, 
  Compass, 
  ShieldCheck, 
  SlidersHorizontal 
} from 'lucide-react';
import { CaelumLogo } from './Logos';

export default function MeetCaelumSection() {
  const pillars = [
    {
      title: "Context-Unified Workspace",
      desc: "Run container daemons, write HCL provisioning scripts, and monitor AWS/Azure resources side by side in one coordinated environment.",
      icon: Layers,
      color: "text-cyan-400",
      border: "border-cyan-500/20",
      bg: "bg-cyan-500/5",
    },
    {
      title: "Real Host Engine Execution",
      desc: "Direct integration with real system runtimes: host Docker sockets, local Terraform CLI binaries, and live cloud SDK connections. No fake mocks.",
      icon: Terminal,
      color: "text-emerald-400",
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/5",
    },
    {
      title: "Engineered for Velocity",
      desc: "Eliminates browser tab chaos, context fatigue, and fragmented credential management through a unified desktop interface purpose-built for engineers.",
      icon: Workflow,
      color: "text-indigo-400",
      border: "border-indigo-500/20",
      bg: "bg-indigo-500/5",
    },
  ];

  return (
    <section id="what-is-caelum" className="py-24 bg-[#0c0c10] relative border-y border-white/[0.06] scroll-mt-16" aria-labelledby="meet-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>What is CaelumOS? &bull; Overview</span>
          </div>

          <h2 id="meet-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            What is <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">CaelumOS</span>?
          </h2>

          <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-normal">
            CaelumOS is a purpose-built operating environment engineered to unify cloud platforms, local container daemons, infrastructure-as-code, and system telemetry into a single coherent workspace.
          </p>

          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto">
            Instead of constantly switching between disconnected browser tabs, fragmented cloud dashboards, and disparate CLI tools, CaelumOS provides a centralized, local-first operating layer to build, configure, deploy, and manage your infrastructure.
          </p>
        </div>

        {/* 3 Core Architecture Pillars */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((item) => (
            <div
              key={item.title}
              className={`p-6 sm:p-7 rounded-2xl border ${item.border} ${item.bg} backdrop-blur-xl transition-all hover:scale-[1.02] flex flex-col justify-between`}
            >
              <div className="space-y-4">
                <div className={`p-3 rounded-xl bg-black/50 border border-white/[0.08] w-fit ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-normal">{item.desc}</p>
              </div>
              <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Core Pillar</span>
                <span className={item.color}>Integrated</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
