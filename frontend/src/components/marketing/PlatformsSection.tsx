'use client';

import React from 'react';
import { 
  Monitor, 
  Laptop, 
  Disc, 
  Cloud, 
  Server, 
  Box, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  Compass 
} from 'lucide-react';

export default function PlatformsSection() {
  const platforms = [
    {
      title: "Desktop",
      status: "IN DEVELOPMENT",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
      desc: "Native workstation operating layer for multi-display setups, hardware acceleration, and seamless local daemon bridging.",
      icon: Monitor,
      iconGradient: "from-blue-600 to-indigo-700 text-white"
    },
    {
      title: "Laptop",
      status: "IN DEVELOPMENT",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
      desc: "Optimized for mobile developer workflows, battery efficiency, and local offline development environments.",
      icon: Laptop,
      iconGradient: "from-sky-500 to-blue-600 text-white"
    },
    {
      title: "Bootable OS",
      status: "ROADMAP",
      statusColor: "bg-purple-50 text-purple-700 border-purple-200",
      desc: "Dedicated bare-metal ISO distribution eliminating desktop OS bloat, booting directly into a container & cloud workspace.",
      icon: Disc,
      iconGradient: "from-purple-600 to-indigo-800 text-white"
    },
    {
      title: "Cloud",
      status: "AVAILABLE",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      desc: "Multi-cloud telemetry and orchestration via verified ARM and AWS SDK clients across hyperscalers.",
      icon: Cloud,
      iconGradient: "from-cyan-500 to-blue-600 text-white"
    },
    {
      title: "Virtual Machines",
      status: "ROADMAP",
      statusColor: "bg-purple-50 text-purple-700 border-purple-200",
      desc: "Pre-built appliance images for Proxmox, VMware, VirtualBox, and QEMU/KVM hypervisors.",
      icon: Server,
      iconGradient: "from-teal-500 to-emerald-700 text-white"
    },
    {
      title: "Containers",
      status: "AVAILABLE",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      desc: "Lightweight OCI container execution binding directly to host Docker sockets and Kubernetes contexts.",
      icon: Box,
      iconGradient: "from-blue-500 to-cyan-600 text-white"
    },
    {
      title: "Future ARM support",
      status: "ROADMAP",
      statusColor: "bg-purple-50 text-purple-700 border-purple-200",
      desc: "Native AArch64 builds tailored for modern Apple Silicon, ARM-based cloud instances, and single-board computers.",
      icon: Cpu,
      iconGradient: "from-rose-500 to-amber-600 text-white"
    },
  ];

  return (
    <section id="platforms" className="py-24 bg-white border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700 uppercase tracking-wider">
            <span>Runtime Environments</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Supported Platforms
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Where Caelum is engineered to operate across local hardware, virtualized machines, and modern cloud infrastructure.
          </p>
        </div>

        {/* Platforms Dimensional Grid (Inspired by Kali benchmark) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {platforms.map((plat) => {
            const Icon = plat.icon;
            return (
              <div 
                key={plat.title}
                className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/90 shadow-2xs hover:bg-white hover:border-blue-400 hover:shadow-xs transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plat.iconGradient} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${plat.statusColor}`}>
                      {plat.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 font-sans">
                    {plat.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {plat.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Architecture</span>
                  <span className="font-semibold text-slate-700">x86_64 / ARM64</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
