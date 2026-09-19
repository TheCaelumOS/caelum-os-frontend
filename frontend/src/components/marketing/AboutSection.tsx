import React from 'react';
import { 
  Terminal, 
  Sparkles, 
  Quote, 
  ShieldCheck, 
  HeartHandshake, 
  GitBranch, 
  Radio 
} from 'lucide-react';
import { CaelumLogo } from './Logos';

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-[#09090b] relative scroll-mt-16 border-t border-white/[0.06]" aria-labelledby="about-heading">
      
      {/* Background glow */}
      <div className="absolute top-1/2 right-1/3 w-[500px] h-[500px] bg-cyan-600/10 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-4xl mx-auto">
          
          {/* Header Badge */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-4">
              <Quote className="w-3.5 h-3.5" />
              <span>Founder & Project Mission</span>
            </div>

            <h2 id="about-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              We&apos;re building the infrastructure environment <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                we wanted to use.
              </span>
            </h2>
          </div>

          {/* Story Narrative Box */}
          <div className="mt-14 rounded-2xl border border-white/[0.1] bg-neutral-900/50 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            
            <p className="text-lg sm:text-xl font-medium text-white leading-relaxed">
              CaelumOS started with a simple idea: <strong className="text-cyan-400">infrastructure shouldn&apos;t feel fragmented</strong>.
            </p>

            <p>
              As cloud architectures matured, developer tooling didn&apos;t keep up. Today, building a modern application means juggling browser tabs between AWS consoles, Docker Desktop daemons, command-line Terraform states, isolated secret vaults, and SSH terminals. Every context switch introduces latency, security risks, and cognitive fatigue.
            </p>

            <p>
              We&apos;re building a unified developer environment that brings cloud platforms, containers, infrastructure-as-code, orchestration, and automation closer together.
            </p>

            <p>
              What starts as a developer environment can evolve into something much larger: a platform for building, deploying, and controlling modern infrastructure.
            </p>

            {/* Founder Values Callout */}
            <div className="pt-6 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                <span className="text-cyan-400 font-bold block">100% Real Engines</span>
                <span className="text-slate-400">Real daemons & CLI tools, zero fake mocks.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                <span className="text-indigo-400 font-bold block">Building in Public</span>
                <span className="text-slate-400">Transparent engineering roadmap & GitHub code.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                <span className="text-emerald-400 font-bold block">Independent Future</span>
                <span className="text-slate-400">Built to evolve from workstation to cloud SaaS.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
