'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Disc, 
  Cpu, 
  HardDrive, 
  Terminal, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Flame
} from 'lucide-react';
import { LinuxLogo } from './Logos';

export default function FutureOsSection() {
  const pillars = [
    {
      title: "Immutable Kernel Architecture",
      desc: "A hardened, minimal Linux kernel containing only essential hardware drivers and container isolation primitives, eliminating traditional desktop OS bloat.",
      tag: "Kernel Architecture"
    },
    {
      title: "Native Wayland Compositor",
      desc: "Hardware-accelerated display server tailored specifically for high-density developer terminal grids, low-latency text rendering, and multi-monitor setups.",
      tag: "Compositor Layer"
    },
    {
      title: "Direct eBPF Telemetry",
      desc: "In-kernel observability programs running at line rate to inspect container socket I/O, network packet flows, and memory metrics without user-space daemon overhead.",
      tag: "Observability"
    },
    {
      title: "Universal Hybrid ISO Image",
      desc: "Cryptographically signed bootable ISO images that can be flashed directly to USB thumb drives or booted as a guest VM inside Proxmox, VMware, or KVM.",
      tag: "Distribution"
    }
  ];

  return (
    <section id="future-os" className="py-24 bg-white border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-mono font-semibold text-purple-800 uppercase tracking-wider">
            <Disc className="w-3.5 h-3.5 text-purple-600" />
            <span>Long-Term Strategic Vision &bull; Research Phase</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Future Native CaelumOS
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            The dedicated development of a purpose-built, bootable, bare-metal operating system for cloud-native computing.
          </p>
        </div>

        {/* Vision Narrative Card */}
        <div className="mt-16 max-w-5xl mx-auto rounded-2xl bg-slate-50/70 border border-slate-200 p-8 sm:p-10 shadow-xs space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Why a Native Operating System?
              </span>
              <h3 className="text-xl font-bold text-slate-900 font-mono">
                Breaking Beyond Browser Boundaries
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Traditional developer environments and web wrappers inherently restrict raw hardware access, direct socket binding, and deterministic memory scheduling.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                The long-term mission of <strong className="text-slate-900 font-semibold">Caleum</strong> is to compile CaelumOS into a bootable Linux distribution where the operating system itself is the development, containerization, and cloud orchestration platform.
              </p>
            </div>

            <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-3">
              <div className="p-3 w-fit mx-auto rounded-2xl bg-slate-100 text-slate-900">
                <LinuxLogo className="w-8 h-8" />
              </div>
              <span className="font-bold text-sm text-slate-900 block font-mono">Bare-Metal &bull; Hypervisors</span>
              <span className="text-[11px] text-slate-500 block leading-tight">
                Designed for x86_64 servers, workstations, and local VMs.
              </span>
              <div className="pt-2">
                <Link
                  href="/download"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  <span>ISO Distribution Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* 4 Pillars */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pillars.map((p) => (
              <div key={p.title} className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                <span className="text-[10px] font-mono text-purple-700 font-bold uppercase tracking-wider block">
                  {p.tag}
                </span>
                <h4 className="text-xs font-bold text-slate-900 font-sans">{p.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}