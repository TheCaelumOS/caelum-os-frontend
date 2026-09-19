'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Download, 
  Disc, 
  HardDrive, 
  Cpu, 
  ShieldCheck, 
  Terminal, 
  ArrowRight, 
  ArrowDown, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { CaelumLogo, GithubLogo } from '../../components/marketing/Logos';

export default function DownloadPage() {
  const [copiedCmd, setCopiedCmd] = useState(false);

  const releaseSteps = [
    { name: "CaelumOS Repository", desc: "Core OS definitions, Linux kernel build config, and supervisor runtime", icon: GithubLogo },
    { name: "Build Bootable OS", desc: "Automated CI/CD compiling minimal immutable kernel, compositor, and tooling", icon: Cpu },
    { name: "GitHub Release", desc: "Cryptographically signed release asset published with SHA-256 checksums", icon: Disc },
    { name: "CaelumOS ISO", desc: "Universal hybrid bootable ISO image generated for bare-metal and VMs", icon: HardDrive },
    { name: "caleum.me/download", desc: "Official verified distribution hub serving direct binary downloads", icon: CaelumLogo },
    { name: "User Downloads ISO", desc: "Engineer flashes USB or boots VM directly into infrastructure environment", icon: Download },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/[0.08] py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <CaelumLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="font-mono text-base font-extrabold tracking-wider text-white flex items-center gap-1.5">
                CAELUM<span className="text-cyan-400">OS</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase -mt-1">
                caleum.me
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </Link>

            <a
              href="https://github.com/TheCaelumOS/caelum-os-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
            >
              <GithubLogo className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full space-y-16">
        
        {/* Page Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            <Disc className="w-3.5 h-3.5" />
            <span>Official Release Portal</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
            CaelumOS <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Latest Release
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Download the official bootable developer operating system image for bare-metal hardware and virtualized infrastructure environments.
          </p>
        </div>

        {/* Release Card */}
        <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-neutral-900/90 to-black/90 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8">
            
            {/* Version & Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div>
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">Release Package</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1 flex items-center gap-3">
                  <span>CaelumOS Standalone ISO</span>
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-mono text-cyan-400 font-semibold">Version: Coming Soon</span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-xs font-mono text-slate-400">Target: v0.1.0-alpha (Phase 05)</span>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>IN DEVELOPMENT</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">Build Target: Minimal Linux LTS</span>
              </div>
            </div>

            {/* Specifications Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Architectures</span>
                <p className="text-sm font-bold text-white font-mono">x86_64 & ARM64</p>
                <span className="text-[10px] text-slate-400 font-mono">Intel, AMD, Apple Silicon</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Image Format</span>
                <p className="text-sm font-bold text-white font-mono">Hybrid ISO / USB</p>
                <span className="text-[10px] text-slate-400 font-mono">UEFI 64-bit bootable</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Pre-Linked Engines</span>
                <p className="text-sm font-bold text-white font-mono">Docker & Terraform</p>
                <span className="text-[10px] text-slate-400 font-mono">Local daemon supervisor</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Release Channel</span>
                <p className="text-sm font-bold text-white font-mono">GitHub Releases</p>
                <span className="text-[10px] text-slate-400 font-mono">Automated CI/CD build</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <button
                disabled
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-xl text-sm font-bold text-slate-400 bg-white/[0.05] border border-white/[0.1] cursor-not-allowed opacity-80"
                title="Direct ISO download will be published upon Phase 05 build completion."
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download ISO (Coming Soon)</span>
              </button>

              <a
                href="#install-guide"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-xl text-sm font-semibold text-slate-200 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all hover:text-white"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Installation Guide</span>
              </a>

              <a
                href="https://github.com/TheCaelumOS/caelum-os-frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-xl text-sm font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] transition-all hover:text-white"
              >
                <GithubLogo className="w-4 h-4 text-slate-300" />
                <span>Star on GitHub</span>
              </a>
            </div>

            {/* Checksums & Integrity Info */}
            <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>SHA-256 Checksums will be generated and published with every official release.</span>
              </div>
              <span className="text-slate-500">Zero mock ISOs &bull; Authentic pipeline</span>
            </div>

          </div>
        </div>

        {/* The Official Release Pipeline Diagram */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
              Release Pipeline Architecture
            </span>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              How CaelumOS Releases Are Built & Distributed
            </h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              From source code commit to your bootable USB, every release follows an automated, transparent build and verification pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {releaseSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.name} 
                  className="p-4 rounded-xl bg-neutral-900/60 border border-white/[0.08] flex flex-col justify-between space-y-3 relative group hover:border-cyan-500/40 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-black/60 border border-cyan-500/30 text-cyan-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-600 font-bold">0{idx + 1}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white font-mono">{step.name}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04] text-[10px] font-mono text-slate-600 flex justify-end">
                    {idx < releaseSteps.length - 1 ? (
                      <span className="hidden md:inline text-cyan-500 font-bold">&rarr;</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">&check; Done</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Installation Guide & Requirements Section */}
        <div id="install-guide" className="rounded-2xl border border-white/[0.08] bg-neutral-900/40 p-8 sm:p-10 space-y-8 scroll-mt-20">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Deployment Specifications</span>
            </div>
            <h3 className="text-2xl font-bold text-white font-mono">
              Hardware & Virtualization Guide
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Prerequisites for booting CaelumOS on physical hardware or hypervisors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* System Requirements */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Minimum Hardware Requirements</span>
              </h4>
              <ul className="space-y-2.5 text-xs font-mono text-slate-300">
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>CPU: 64-bit x86_64 or ARM64 processor (2+ cores)</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>RAM: 4 GB minimum (8 GB recommended for heavy containers)</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Disk: 20 GB free storage (NVMe / SSD recommended)</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Firmware: UEFI 64-bit firmware with Secure Boot support</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Virtualization: Intel VT-x or AMD-V enabled in BIOS</span>
                </li>
              </ul>
            </div>

            {/* Flashing / VM Instructions */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <span>Boot Media Preparation (Preview)</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                When the ISO is published, you will be able to flash it to a USB drive using standard tools such as `dd`, BalenaEtcher, or Rufus:
              </p>
              <div className="rounded-xl bg-black/60 border border-white/[0.08] p-3 font-mono text-xs text-cyan-300/90 relative">
                <code># Flash image to USB drive (Linux/macOS)<br />sudo dd if=caelum-os-v0.1.0.iso of=/dev/sdX bs=4M status=progress</code>
              </div>
              <p className="text-[11px] font-mono text-slate-500">
                Compatible with VMware Workstation, VirtualBox, Proxmox VE, and QEMU/KVM.
              </p>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-[#060608] border-t border-slate-800/80 py-8 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} CaelumOS &bull; https://caleum.me</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-cyan-400 transition">Home</Link>
            <span>&bull;</span>
            <a href="https://github.com/TheCaelumOS/caelum-os-frontend" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition">GitHub</a>
            <span>&bull;</span>
            <span className="text-slate-600">Local-First Native Engine</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
