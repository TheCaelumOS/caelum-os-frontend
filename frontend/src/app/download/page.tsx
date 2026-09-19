'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Download, 
  Disc, 
  HardDrive, 
  Cpu, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  BookOpen
} from 'lucide-react';
import { CaleumLogo, GithubLogo } from '../../components/marketing/Logos';

export default function DownloadPage() {
  const [copiedCmd, setCopiedCmd] = useState(false);

  const releaseSteps = [
    { name: "CaelumOS Repository", desc: "Core OS definitions, Linux kernel build config, and supervisor runtime", icon: GithubLogo },
    { name: "Build Bootable OS", desc: "Automated CI/CD compiling minimal immutable kernel, compositor, and tooling", icon: Cpu },
    { name: "GitHub Release", desc: "Cryptographically signed release asset published with SHA-256 checksums", icon: Disc },
    { name: "CaelumOS ISO", desc: "Universal hybrid bootable ISO image generated for bare-metal and VMs", icon: HardDrive },
    { name: "caleum.me/download", desc: "Official verified distribution hub serving direct binary downloads", icon: CaleumLogo },
    { name: "User Boots ISO", desc: "Engineer flashes USB or boots VM directly into infrastructure environment", icon: Download },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <CaleumLogo className="w-8 h-8 flex-shrink-0 group-hover:scale-105 transition-transform" />
            <span className="font-sans text-[22px] font-extrabold tracking-tight text-[#040C1C]">
              Caleum
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </Link>

            <a
              href="https://github.com/TheCaelumOS/caelum-os-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-xs"
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
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700 uppercase tracking-wider">
            <Disc className="w-3.5 h-3.5" />
            <span>Distribution Channel</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            CaelumOS Releases
          </h1>

          <p className="text-slate-600 text-base leading-relaxed">
            Download the official bootable developer operating system image for bare-metal hardware and virtualized infrastructure environments.
          </p>
        </div>

        {/* Release Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="space-y-8">
            
            {/* Version & Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">Distribution Package</span>
                <h2 className="text-2xl font-bold text-slate-900 font-mono mt-1 flex items-center gap-3">
                  <span>CaelumOS Standalone ISO</span>
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-mono text-blue-600 font-semibold">Target Version: v0.1.0-alpha</span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-xs font-mono text-slate-500">Roadmap Phase 4</span>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-mono font-semibold text-amber-800 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>IN DEVELOPMENT</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">Target: Minimal Linux LTS</span>
              </div>
            </div>

            {/* Specifications Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Architectures</span>
                <p className="text-sm font-bold text-slate-900 font-mono">x86_64 & ARM64</p>
                <span className="text-[10px] text-slate-500 font-mono">Intel, AMD, Apple Silicon</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Image Format</span>
                <p className="text-sm font-bold text-slate-900 font-mono">Hybrid ISO / USB</p>
                <span className="text-[10px] text-slate-500 font-mono">UEFI 64-bit bootable</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Pre-Linked Engines</span>
                <p className="text-sm font-bold text-slate-900 font-mono">Docker & Terraform</p>
                <span className="text-[10px] text-slate-500 font-mono">Host daemon supervisor</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Release Channel</span>
                <p className="text-sm font-bold text-slate-900 font-mono">GitHub Releases</p>
                <span className="text-[10px] text-slate-500 font-mono">Automated CI/CD build</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <button
                disabled
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-3 rounded-lg text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed"
                title="Direct ISO download will be published upon Phase 4 build completion."
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>Download ISO (Planned — Phase 4)</span>
              </button>

              <a
                href="#install-guide"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
              >
                <BookOpen className="w-4 h-4" />
                <span>Installation Specifications</span>
              </a>

              <a
                href="https://github.com/TheCaelumOS/caelum-os-frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-xs"
              >
                <GithubLogo className="w-4 h-4 text-slate-600" />
                <span>View on GitHub</span>
              </a>
            </div>

            {/* Checksums & Integrity Info */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>SHA-256 Checksums will be generated and signed with every official release.</span>
              </div>
              <span className="text-slate-400">Authentic CI/CD Pipeline</span>
            </div>

          </div>
        </div>

        {/* The Official Release Pipeline Diagram */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-blue-700 uppercase tracking-wider font-semibold">
              Distribution Pipeline Architecture
            </span>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              How CaelumOS Releases Are Built & Distributed
            </h3>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              From source repository commit to your bootable media, every release follows an automated, auditable build and verification pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {releaseSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.name} 
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 relative group hover:border-slate-300 hover:bg-white transition-all shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">0{idx + 1}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 font-mono">{step.name}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-400 flex justify-end">
                    {idx < releaseSteps.length - 1 ? (
                      <span className="hidden md:inline text-blue-600 font-bold">&rarr;</span>
                    ) : (
                      <span className="text-emerald-600 font-bold">&check; Verified</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Installation Guide & Requirements Section */}
        <div id="install-guide" className="rounded-2xl border border-slate-200 bg-slate-50/60 p-8 sm:p-10 space-y-8 scroll-mt-20">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Deployment Specifications</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 font-mono">
              Hardware & Virtualization Specifications
            </h3>
            <p className="text-sm text-slate-500">
              Prerequisites for booting CaelumOS on physical workstations or hypervisors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* System Requirements */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Minimum Hardware Requirements</span>
              </h4>
              <ul className="space-y-2.5 text-xs font-mono text-slate-600">
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>CPU: 64-bit x86_64 or ARM64 processor (2+ cores)</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>RAM: 4 GB minimum (8 GB recommended for containers)</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Disk: 20 GB free storage (NVMe / SSD recommended)</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Firmware: UEFI 64-bit firmware with Secure Boot support</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Virtualization: Intel VT-x or AMD-V enabled in BIOS</span>
                </li>
              </ul>
            </div>

            {/* Flashing / VM Instructions */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-600" />
                <span>Boot Media Preparation (Preview)</span>
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                When the ISO is published, engineers can flash it to boot media using standard utilities:
              </p>
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 font-mono text-xs text-cyan-300/95 relative shadow-inner">
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
      <footer className="bg-slate-50 border-t border-slate-200 py-8 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} Caleum &bull; Flagship: CaelumOS &bull; https://caleum.me</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-900 transition">Home</Link>
            <span>&bull;</span>
            <a href="https://github.com/TheCaelumOS/caelum-os-frontend" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition">GitHub</a>
            <span>&bull;</span>
            <span className="text-slate-400">Local-First Native Engine</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
