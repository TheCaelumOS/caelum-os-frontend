'use client';

import React from 'react';
import { 
  Terminal, 
  Code2, 
  GitBranch, 
  FolderTree, 
  Globe, 
  Activity, 
  Monitor, 
  SlidersHorizontal 
} from 'lucide-react';
import { GithubLogo } from './Logos';

export default function DevEnvironmentSection() {
  const tools = [
    {
      title: "Interactive Terminal",
      desc: "Full PTY terminal emulator powered by Xterm.js streaming bidirectional raw I/O over WebSockets to your local shell (bash/powershell).",
      icon: Terminal,
      tag: "Xterm.js + PTY"
    },
    {
      title: "VS Code Editor",
      desc: "Embedded code editor within the workspace layout for instant script editing, Dockerfile customization, and configuration management.",
      icon: Code2,
      tag: "Code Editor"
    },
    {
      title: "GitHub Repository Explorer",
      desc: "Track local Git repository status, branch hierarchies, commit history, and staged changes directly inside the operating environment.",
      icon: GithubLogo,
      tag: "Git Adapter"
    },
    {
      title: "Nautilus File Manager",
      desc: "Explore project directories, inspect configuration files, manage sandbox assets, and browse workspace filesystems with ease.",
      icon: FolderTree,
      tag: "File Browser"
    },
    {
      title: "Embedded Browser",
      desc: "In-workspace web browser for previewing local development servers (localhost:3000, 8080) alongside running backend containers.",
      icon: Globe,
      tag: "Local Preview"
    },
    {
      title: "System Telemetry & Monitoring",
      desc: "Live visibility into host CPU load averages, RAM allocations, disk usage, active network interfaces, and container resource consumption.",
      icon: Activity,
      tag: "Host Telemetry"
    }
  ];

  return (
    <section id="dev-environment" className="py-24 bg-white border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider">
            <Monitor className="w-3.5 h-3.5 text-blue-600" />
            <span>Developer Toolchain</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Built-in Developer Environment
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Essential developer utilities integrated into one responsive window manager. No third-party plugins or complex configuration required.
          </p>
        </div>

        {/* Tools 6-Card Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10.5px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 font-sans pt-1">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{item.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}