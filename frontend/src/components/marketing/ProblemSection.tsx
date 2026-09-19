import React from 'react';
import { 
  Layers, 
  Terminal, 
  Activity, 
  GitBranch, 
  Cloud, 
  Container, 
  FileCode, 
  Server,
  ArrowRight,
  ShieldAlert,
  Repeat,
  Unlink
} from 'lucide-react';
import { 
  AwsLogo, 
  AzureLogo, 
  DockerLogo, 
  TerraformLogo, 
  KubernetesLogo, 
  GithubLogo 
} from './Logos';

export default function ProblemSection() {
  const fragmentedTools = [
    { name: 'AWS Console', icon: AwsLogo, desc: 'Isolated IAM & Cloud metrics' },
    { name: 'Azure Portal', icon: AzureLogo, desc: 'Separate subscription portal' },
    { name: 'Docker Engine', icon: DockerLogo, desc: 'Local daemon CLI & sockets' },
    { name: 'Terraform HCL', icon: TerraformLogo, desc: 'Terminal statefiles & lock files' },
    { name: 'Kubernetes', icon: KubernetesLogo, desc: 'kubectl configs & contexts' },
    { name: 'GitHub / Git', icon: GithubLogo, desc: 'Remote commits & branch PRs' },
    { name: 'CLI Terminals', icon: () => <Terminal className="w-5 h-5 text-emerald-400" />, desc: 'Multiple shell tabs & SSH keys' },
    { name: 'Monitoring Dashboards', icon: () => <Activity className="w-5 h-5 text-amber-400" />, desc: 'Grafana & Prometheus windows' },
    { name: 'Cloud Consoles', icon: () => <Cloud className="w-5 h-5 text-sky-400" />, desc: 'Browser tabs with distinct auth' },
  ];

  return (
    <section className="py-24 bg-[#09090b] relative overflow-hidden" aria-labelledby="problem-heading">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-red-950/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[11px] font-mono font-bold text-red-400 uppercase tracking-widest mb-4">
            <Unlink className="w-3.5 h-3.5" />
            <span>The Infrastructure Paradox</span>
          </div>
          <h2 id="problem-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Modern infrastructure is <span className="text-red-400">fragmented</span>.
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Developers lose hours every week jumping between disconnected web portals, local shells, scattered credentials, and incompatible dashboards just to ship and observe an application.
          </p>
        </div>

        {/* Fragmented Tools Grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {fragmentedTools.map((tool, idx) => (
            <div 
              key={tool.name}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-red-500/30 transition-all flex items-start space-x-3.5 group"
            >
              <div className="p-2.5 rounded-lg bg-black/50 border border-white/[0.06] flex-shrink-0 group-hover:scale-105 transition-transform">
                <tool.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-bold text-slate-200 group-hover:text-white flex items-center justify-between">
                  <span>{tool.name}</span>
                  <span className="text-[10px] font-mono text-slate-600">0{idx + 1}</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{tool.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Transition Banner to CaelumOS */}
        <div className="mt-16 relative rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-neutral-900/80 to-indigo-950/40 p-8 sm:p-10 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div className="space-y-2 max-w-xl">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                The Architectural Solution
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                CaelumOS brings the workflow together.
              </h3>
              <p className="text-sm text-slate-300">
                A single unified developer workspace where cloud environments, local runtimes, and provisioning pipelines speak the same language.
              </p>
            </div>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              <div className="p-3.5 rounded-xl bg-black/60 border border-cyan-500/20 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block font-bold">Pillar 01</span>
                <span className="text-xs font-extrabold text-white mt-1 block">ONE ENVIRONMENT</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/60 border border-cyan-500/20 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 block font-bold">Pillar 02</span>
                <span className="text-xs font-extrabold text-white mt-1 block">MULTIPLE TECHNOLOGIES</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/60 border border-cyan-500/20 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 block font-bold">Pillar 03</span>
                <span className="text-xs font-extrabold text-white mt-1 block">UNIFIED CONTROL</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
