import React from 'react';
import { 
  Code2, 
  GitMerge, 
  CloudRain, 
  Users, 
  ArrowRight,
  Sparkles,
  Terminal,
  Workflow
} from 'lucide-react';

export default function WhoIsItForSection() {
  const personas = [
    {
      title: "Developers",
      tagline: "Build and deploy without constantly switching environments.",
      description: "Write application code, launch local Docker dependencies, inspect container logs, and trigger builds without ever opening a cluttered web console.",
      icon: Code2,
      color: "text-cyan-400",
      border: "border-cyan-500/20",
      accent: "bg-cyan-500/10"
    },
    {
      title: "DevOps Engineers",
      tagline: "Manage infrastructure and deployment workflows from one place.",
      description: "Provision staging and production resources with Terraform HCL, monitor real-time container states, stream stdout/stderr, and execute shell automation.",
      icon: GitMerge,
      color: "text-purple-400",
      border: "border-purple-500/20",
      accent: "bg-purple-500/10"
    },
    {
      title: "Cloud Engineers",
      tagline: "Work across cloud, containers, and infrastructure-as-code.",
      description: "Bridge the gap between AWS compute, Azure resources, and local Docker workloads. Keep tabs on multi-region resources and VPC topologies in real time.",
      icon: CloudRain,
      color: "text-amber-400",
      border: "border-amber-500/20",
      accent: "bg-amber-500/10"
    },
    {
      title: "Startups & Teams",
      tagline: "Create standardized development and infrastructure workflows.",
      description: "Ensure all engineers on the team run identical, reproducible infrastructure stacks without lengthy onboarding manuals or machine-specific quirks.",
      icon: Users,
      color: "text-emerald-400",
      border: "border-emerald-500/20",
      accent: "bg-emerald-500/10"
    }
  ];

  return (
    <section className="py-24 bg-[#0c0c10] relative border-t border-white/[0.06]" aria-labelledby="who-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-4">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Audience</span>
          </div>

          <h2 id="who-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Built for modern <br />
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              engineering teams.
            </span>
          </h2>

          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Whether you are writing frontend apps, configuring multi-cloud clusters, or shipping startup MVPs, CaelumOS cuts out the noise.
          </p>
        </div>

        {/* 4 Personas Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {personas.map((item) => (
            <div
              key={item.title}
              className={`p-6 sm:p-7 rounded-2xl bg-neutral-900/40 border ${item.border} backdrop-blur-xl flex flex-col justify-between hover:scale-[1.01] transition-all`}
            >
              <div className="space-y-3">
                <div className={`p-3 rounded-xl ${item.accent} border border-white/[0.06] w-fit ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className={`text-xs font-mono ${item.color}`}>&ldquo;{item.tagline}&rdquo;</p>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal pt-1">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Optimized Flow</span>
                <span className={item.color}>Verified Benefit</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
