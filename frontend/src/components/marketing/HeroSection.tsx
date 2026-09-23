'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Download, 
  ArrowRight, 
  Terminal, 
  Layers, 
  Cpu, 
  Cloud, 
  Activity, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Server,
  Code2,
  Box,
  Compass,
  Sparkles,
  Zap,
  HardDrive
} from 'lucide-react';
import { 
  CaleumLogo, 
  CaelumOsLogo, 
  AwsLogo, 
  AzureLogo, 
  DockerLogo, 
  TerraformLogo, 
  KubernetesLogo, 
  GithubLogo,
  GrafanaLogo,
  GitLogo,
  VsCodeLogo,
  LinuxLogo
} from './Logos';

export default function HeroSection() {
  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 bg-white overflow-hidden border-b border-slate-200">
      {/* Subtle technical background grid */}
      <div className="absolute inset-0 bg-corporate-grid opacity-60 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] bg-gradient-to-b from-blue-50/50 via-slate-50/30 to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Eyebrow, Main Heading, Supporting Heading, Description, Buttons, GitHub Link */}
          <div className="lg:col-span-6 space-y-6 text-left">
            

            {/* Main Heading & Supporting Heading */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08] font-sans">
                Caelum
              </h1>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 leading-snug">
                A powerful operating environment for cloud-native developers.
              </h2>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-xl">
              Caelum brings cloud platforms, containers, infrastructure, development tools, and observability into one cohesive developer environment — designed to help engineers build, deploy, operate, and manage modern systems.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/os"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs group"
              >
                <Terminal className="w-4 h-4 text-blue-200" />
                <span>Launch CaelumOS</span>
                <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/download"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Get Caelum</span>
              </Link>

              <a
                href="#capabilities"
                className="inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <span>Explore</span>
              </a>
            </div>

            {/* Secondary Link: View on GitHub */}
            <div className="pt-1">
              <a
                href="https://github.com/TheCaelumOS/caelum-os-frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-xs font-mono text-slate-600 hover:text-blue-600 transition-colors group"
              >
                <GithubLogo className="w-4 h-4 text-slate-700 group-hover:text-blue-600 transition-colors" />
                <span>View on GitHub &rarr;</span>
                <span className="text-[10px] text-slate-400 font-sans">(Apache 2.0 Open Source)</span>
              </a>
            </div>

            {/* Engineering Highlights Pill Strip */}
            <div className="pt-4 border-t border-slate-200/80 grid grid-cols-3 gap-3 text-left">
              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-400 font-semibold">Architecture</span>
                <span className="text-xs font-bold text-slate-900 font-mono">Cloud-Native</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-400 font-semibold">Execution</span>
                <span className="text-xs font-bold text-slate-900 font-mono">Host Daemons</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-400 font-semibold">Distribution</span>
                <span className="text-xs font-bold text-slate-900 font-mono">Standalone ISO</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Premium Caelum Workstation / Laptop Visual */}
          <div className="lg:col-span-6 relative">
            
            {/* Laptop chassis container */}
            <div className="relative mx-auto max-w-[580px] select-none">
              
              {/* Laptop Screen Bezel */}
              <div className="rounded-2xl bg-[#090D16] p-3 sm:p-3.5 shadow-2xl border border-slate-700/60 ring-1 ring-black/40 relative">
                
                {/* Webcam Notch */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-800 ring-1 ring-slate-600/50" />
                  <div className="w-1 h-1 rounded-full bg-emerald-500/80 animate-pulse" />
                </div>

                {/* Display Area (Caelum Desktop Visual) */}
                <div className="rounded-lg overflow-hidden bg-[#050B14] border border-slate-800/80 relative text-white font-sans aspect-[16/10] flex flex-col">
                  
                  {/* Desktop Wallpaper with geometric blue accents and subtle watermark */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#061024] via-[#050C1A] to-[#040812] pointer-events-none" />
                  <div className="absolute right-0 top-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Top Bar of Desktop */}
                  <div className="relative z-20 h-6 bg-[#030710]/90 border-b border-slate-800/60 px-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1.5 text-white font-bold">
                        <CaleumLogo className="w-3.5 h-3.5" />
                        <span className="tracking-tight text-slate-200">Caelum</span>
                      </div>
                      <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
                        <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white font-semibold">1</span>
                        <span className="px-1.5 py-0.2 rounded hover:bg-slate-800 text-slate-400">2</span>
                        <span className="px-1.5 py-0.2 rounded hover:bg-slate-800 text-slate-400">3</span>
                        <span className="px-1.5 py-0.2 rounded hover:bg-slate-800 text-slate-400">4</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-[9px]">
                      <span>CPU 14%</span>
                      <span className="text-slate-600">&bull;</span>
                      <span>RAM 4.6 GB</span>
                      <span className="text-slate-600">&bull;</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        NET 1.8 Gb/s
                      </span>
                      <span className="text-slate-600">&bull;</span>
                      <span className="text-slate-200 font-semibold">20:45 UTC</span>
                    </div>
                  </div>

                  {/* Desktop Workspace Body (Tiled Windows) */}
                  <div className="relative z-10 flex-1 p-2.5 grid grid-cols-12 gap-2 overflow-hidden">
                    
                    {/* Left Tiled Window: Terminal Emulator */}
                    <div className="col-span-7 rounded-lg bg-[#070E1A]/95 border border-slate-800 shadow-md flex flex-col overflow-hidden">
                      {/* Window title bar */}
                      <div className="h-5 bg-[#0A1322] border-b border-slate-800 px-2 flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                          <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                          <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">terminal &bull; caelum status</span>
                        <div className="w-6" />
                      </div>

                      {/* Terminal Content */}
                      <div className="p-2 text-[8.5px] sm:text-[9.5px] font-mono leading-relaxed text-slate-300 space-y-0.5 overflow-hidden">
                        <p className="text-slate-400 font-semibold">caelum@workstation:~$ caelum status</p>
                        <p className="text-blue-400 font-bold">● Caelum Operating Layer v2026.2 (Active)</p>
                        <p className="text-emerald-400 flex items-center gap-1">
                          <span>✓ Docker Daemon:</span>
                          <span className="text-slate-400">//./pipe/docker_engine (connected)</span>
                        </p>
                        <p className="text-emerald-400 flex items-center gap-1">
                          <span>✓ Kubernetes:</span>
                          <span className="text-slate-400">~/.kube/config (cluster-prod-01)</span>
                        </p>
                        <p className="text-emerald-400 flex items-center gap-1">
                          <span>✓ Terraform CLI:</span>
                          <span className="text-slate-400">v1.14 runner initialized</span>
                        </p>
                        <p className="text-emerald-400 flex items-center gap-1">
                          <span>✓ Azure ARM SDK:</span>
                          <span className="text-slate-400">11 resource groups synced</span>
                        </p>
                        <p className="text-emerald-400 flex items-center gap-1">
                          <span>✓ AWS STS:</span>
                          <span className="text-slate-400">Identity: arn:aws:iam::prod</span>
                        </p>
                        <p className="text-slate-400 pt-0.5">caelum@workstation:~$ <span className="inline-block w-1.5 h-3 bg-blue-500 animate-pulse align-middle" /></p>
                      </div>
                    </div>

                    {/* Right Tiled Windows Column */}
                    <div className="col-span-5 flex flex-col gap-2">
                      
                      {/* Subwindow 1: Observability / Grafana Metrics */}
                      <div className="flex-1 rounded-lg bg-[#070E1A]/95 border border-slate-800 shadow-md p-2 flex flex-col justify-between">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                          <span className="text-[9px] font-mono font-bold text-slate-200 flex items-center gap-1">
                            <GrafanaLogo className="w-3 h-3 text-orange-400" />
                            <span>Observability</span>
                          </span>
                          <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-800/60">
                            Healthy
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 my-1 text-[8px] font-mono">
                          <div className="p-1 rounded bg-[#0A1322] border border-slate-800/80">
                            <span className="text-slate-500 block">Pods</span>
                            <span className="text-slate-200 font-bold text-[10px]">24 / 24</span>
                          </div>
                          <div className="p-1 rounded bg-[#0A1322] border border-slate-800/80">
                            <span className="text-slate-500 block">Containers</span>
                            <span className="text-slate-200 font-bold text-[10px]">12 Active</span>
                          </div>
                        </div>

                        {/* Mini visual bar */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[7.5px] font-mono text-slate-400">
                            <span>Ingress Throughput</span>
                            <span>98.4 MB/s</span>
                          </div>
                          <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 w-3/4 rounded-full" />
                          </div>
                        </div>
                      </div>

                      {/* Subwindow 2: Terraform HCL Preview */}
                      <div className="flex-1 rounded-lg bg-[#070E1A]/95 border border-slate-800 shadow-md p-2 flex flex-col justify-between">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                          <span className="text-[9px] font-mono font-bold text-slate-200 flex items-center gap-1">
                            <TerraformLogo className="w-3 h-3 text-purple-400" />
                            <span>infra/cluster.tf</span>
                          </span>
                          <span className="text-[8px] font-mono text-slate-400">HCL</span>
                        </div>

                        <div className="text-[8px] font-mono leading-tight text-slate-400 space-y-0.5 py-1">
                          <p><span className="text-purple-400">resource</span> <span className="text-sky-300">"kubernetes_cluster"</span> &#123;</p>
                          <p className="pl-2">name = <span className="text-emerald-300">"caelum-prod"</span></p>
                          <p className="pl-2">nodes = <span className="text-amber-300">8</span></p>
                          <p>&#125;</p>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Bottom Application Dock */}
                  <div className="relative z-20 h-8 bg-[#03060E]/95 border-t border-slate-800/80 px-3 flex items-center justify-center space-x-2">
                    <div className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-white transition-colors cursor-default" title="Terminal">
                      <Terminal className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-sky-400 transition-colors cursor-default" title="Docker">
                      <DockerLogo className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-blue-400 transition-colors cursor-default" title="Kubernetes">
                      <KubernetesLogo className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-purple-400 transition-colors cursor-default" title="Terraform">
                      <TerraformLogo className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-amber-400 transition-colors cursor-default" title="AWS">
                      <AwsLogo className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-blue-500 transition-colors cursor-default" title="Azure">
                      <AzureLogo className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-sky-400 transition-colors cursor-default" title="VS Code">
                      <VsCodeLogo className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-rose-400 transition-colors cursor-default" title="Git">
                      <GitLogo className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-orange-400 transition-colors cursor-default" title="Grafana">
                      <GrafanaLogo className="w-3.5 h-3.5" />
                    </div>
                  </div>

                </div>

              </div>

              {/* Laptop Bottom Base (Keyboard deck / hinge) */}
              <div className="relative mx-auto w-[94%] h-3.5 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-800 rounded-b-xl shadow-lg flex items-center justify-center">
                <div className="w-16 h-1 bg-slate-500 rounded-full" />
              </div>

              {/* Desk shadow reflection */}
              <div className="mx-auto w-[85%] h-3 bg-slate-900/10 blur-md rounded-full mt-0.5" />

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}