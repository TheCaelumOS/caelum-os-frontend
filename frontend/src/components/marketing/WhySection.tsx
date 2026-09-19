import React from 'react';
import { 
  Layers, 
  Terminal, 
  Cloud, 
  Workflow, 
  Puzzle, 
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function WhySection() {
  const principles = [
    {
      title: "Unified",
      tagline: "Bring infrastructure workflows closer together.",
      description: "Eliminate the cognitive tax of running across 10 disconnected portals. One synchronized workstation frame links local Docker containers, cloud subscriptions, and remote clusters.",
      icon: Layers,
      color: "from-cyan-500/20 to-blue-500/5",
      border: "border-cyan-500/30",
      accent: "text-cyan-400"
    },
    {
      title: "Developer-First",
      tagline: "Designed around the developer experience.",
      description: "Built for engineers who value fast feedback loops, keyboard ergonomics, native shells, and clear error diagnostics over bloated enterprise click-through wizards.",
      icon: Terminal,
      color: "from-emerald-500/20 to-teal-500/5",
      border: "border-emerald-500/30",
      accent: "text-emerald-400"
    },
    {
      title: "Cloud-Ready",
      tagline: "Work across modern cloud environments.",
      description: "Native connectors for AWS and Azure with extensible adapters. Switch regions, subscriptions, and credential scopes without re-authenticating across multiple browser windows.",
      icon: Cloud,
      color: "from-blue-500/20 to-indigo-500/5",
      border: "border-blue-500/30",
      accent: "text-blue-400"
    },
    {
      title: "Automation-Ready",
      tagline: "Built toward streamlined infrastructure workflows.",
      description: "Seamlessly integrate Terraform plan/apply cycles, automated Docker composition, and deployment pipelines directly into your everyday development routine.",
      icon: Workflow,
      color: "from-purple-500/20 to-pink-500/5",
      border: "border-purple-500/30",
      accent: "text-purple-400"
    },
    {
      title: "Extensible",
      tagline: "Designed to evolve as the platform grows.",
      description: "Modular application architecture designed to incorporate Kubernetes helm charts, Prometheus metrics, and future AI orchestration plugins as the ecosystem expands.",
      icon: Puzzle,
      color: "from-amber-500/20 to-orange-500/5",
      border: "border-amber-500/30",
      accent: "text-amber-400"
    },
  ];

  return (
    <section className="py-24 bg-[#09090b] relative" aria-labelledby="why-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Core Principles</span>
          </div>
          <h2 id="why-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Less switching. <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">More building.</span>
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Engineered from the ground up to restore flow state to cloud engineers and DevOps professionals.
          </p>
        </div>

        {/* 5 Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {principles.map((item, idx) => (
            <div
              key={item.title}
              className={`p-6 sm:p-7 rounded-2xl bg-gradient-to-b ${item.color} bg-neutral-900/40 border ${item.border} backdrop-blur-xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-200 ${
                idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div className="space-y-4">
                <div className={`p-3 rounded-xl bg-black/60 border border-white/[0.08] w-fit ${item.accent}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                    Principle 0{idx + 1}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">{item.title}</h3>
                  <p className={`text-xs font-mono mt-1 ${item.accent}`}>&ldquo;{item.tagline}&rdquo;</p>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Architecture Guarantee</span>
                <span className={item.accent}>Active Standard</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
