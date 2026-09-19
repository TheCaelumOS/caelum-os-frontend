'use client';

import React from 'react';
import Link from 'next/link';
import { CaelumLogo, GithubLogo } from './Logos';
import { ArrowUpRight, ShieldCheck, Heart, Terminal, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-[#060608] border-t border-slate-800/80 pt-16 pb-12 overflow-hidden text-slate-400 text-sm">
      {/* Background glow accents */}
      <div className="absolute bottom-0 left-1/4 -translate-x-1/2 w-[500px] h-[250px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[200px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-slate-800/60">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <CaelumLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                  CAELUM<span className="text-cyan-400">OS</span>
                </span>
                <span className="text-[10px] tracking-widest text-slate-500 uppercase font-semibold">
                  Unified Cloud Environment
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Your Infrastructure. One Unified Environment. Unifying multi-cloud control, container runtimes, infrastructure-as-code, and system telemetry into a single coherent desktop operating system.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="https://github.com/TheCaelumOS/caelum-os-frontend"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 transition"
              >
                <GithubLogo className="w-4 h-4" />
                <span>GitHub Repository</span>
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>

              <Link
                href="/download"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-[11px] font-mono text-cyan-300 hover:text-white transition"
              >
                <span>Download ISO</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-400/20 text-cyan-300">Phase 05</span>
              </Link>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Domain: <span className="text-cyan-400 font-semibold">https://caleum.me</span>
            </div>
          </div>

          {/* Col 1: Platform & Engines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono mb-4">
              Platform & Engines
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <a href="#platform" className="hover:text-cyan-400 transition flex items-center justify-between group">
                  <span>Unified Architecture</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">CORE</span>
                </a>
              </li>
              <li>
                <a href="#platform" className="hover:text-cyan-400 transition flex items-center justify-between group">
                  <span>Docker Runtime</span>
                  <span className="text-[10px] text-slate-500">Engine v29</span>
                </a>
              </li>
              <li>
                <a href="#platform" className="hover:text-cyan-400 transition flex items-center justify-between group">
                  <span>Terraform Studio</span>
                  <span className="text-[10px] text-slate-500">HCL Execution</span>
                </a>
              </li>
              <li>
                <a href="#platform" className="hover:text-cyan-400 transition flex items-center justify-between group">
                  <span>AWS Manager</span>
                  <span className="text-[10px] text-slate-500">Multi-Region</span>
                </a>
              </li>
              <li>
                <a href="#platform" className="hover:text-cyan-400 transition flex items-center justify-between group">
                  <span>Azure Portal</span>
                  <span className="text-[10px] text-slate-500">Cloud Console</span>
                </a>
              </li>
              <li>
                <a href="#platform" className="hover:text-cyan-400 transition flex items-center justify-between group">
                  <span>System Terminal</span>
                  <span className="text-[10px] text-slate-500">WebSocket Shell</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Architecture & Roadmap */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono mb-4">
              Architecture & Vision
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#platform" className="hover:text-cyan-400 transition">Core Integrated Apps</a>
              </li>
              <li>
                <a href="#experience" className="hover:text-cyan-400 transition">5-Tier Engine Pipeline</a>
              </li>
              <li>
                <a href="#why" className="hover:text-cyan-400 transition">Design Principles</a>
              </li>
              <li>
                <a href="#vision" className="hover:text-cyan-400 transition flex items-center gap-1.5">
                  <span>Cloud Control Plane</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">VISION</span>
                </a>
              </li>
              <li>
                <a href="#ai-vision" className="hover:text-cyan-400 transition flex items-center gap-1.5">
                  <span>AI Natural Intent Engine</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">AI</span>
                </a>
              </li>
              <li>
                <a href="#bootable" className="hover:text-cyan-400 transition flex items-center gap-1.5">
                  <span>Bootable ISO Kernel</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">ISO</span>
                </a>
              </li>
              <li>
                <a href="#roadmap" className="hover:text-cyan-400 transition">Phased Roadmap (01-05)</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono mb-4">
              Community & Governance
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#about" className="hover:text-cyan-400 transition">Founder & Mission</a>
              </li>
              <li>
                <a href="#who-is-it-for" className="hover:text-cyan-400 transition">Audience Profiles</a>
              </li>
              <li>
                <a href="#docs" className="hover:text-cyan-400 transition flex items-center justify-between">
                  <span>Documentation Hub</span>
                  <span className="text-[9px] text-cyan-400 font-mono">DOCS</span>
                </a>
              </li>
              <li>
                <Link href="/download" className="hover:text-cyan-400 transition flex items-center justify-between">
                  <span>Download ISO Image</span>
                  <span className="text-[9px] text-cyan-400 font-mono">SOON</span>
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed flex items-center justify-between">
                  <span>Plugin Marketplace</span>
                  <span className="text-[9px] text-slate-600 font-mono">PLANNED</span>
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed flex items-center justify-between">
                  <span>Telemetry & Privacy</span>
                  <span className="text-[9px] text-slate-600 font-mono">LOCAL-FIRST</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} CaelumOS. Built for engineers who refuse tool fragmentation.</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span className="text-slate-600">caleum.me</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-600">Local-First Native Engine</span>
            <span className="text-slate-600">&bull;</span>
            <a href="#top" className="text-cyan-400 hover:text-cyan-300 transition">Back to Top &uarr;</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
