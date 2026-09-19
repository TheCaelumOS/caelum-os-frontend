'use client';

import React from 'react';
import { 
  Code2, 
  Layers, 
  ExternalLink 
} from 'lucide-react';
import { 
  AwsLogo, 
  AzureLogo, 
  DockerLogo, 
  TerraformLogo, 
  KubernetesLogo, 
  GithubLogo, 
  LinuxLogo, 
  CloudflareLogo 
} from './Logos';

export default function TechSection() {
  const technologies = [
    {
      name: "AWS",
      category: "Public Cloud",
      desc: "Native integration with EC2 compute, S3 object storage, RDS databases, and IAM STS identity resolution.",
      icon: AwsLogo,
    },
    {
      name: "Azure",
      category: "Public Cloud",
      desc: "Direct support for Azure Virtual Machines, Resource Groups, Blob storage, and dynamic subscription discovery.",
      icon: AzureLogo,
    },
    {
      name: "Docker",
      category: "Container Runtime",
      desc: "Direct host socket integration with Docker Engine v29 for container lifecycle, volume, and stream controls.",
      icon: DockerLogo,
    },
    {
      name: "Kubernetes",
      category: "Orchestration",
      desc: "Cluster context switching, pod inspection, namespace isolation, and deployment status observation.",
      icon: KubernetesLogo,
    },
    {
      name: "Terraform",
      category: "Infrastructure as Code",
      desc: "Embedded HCL syntax editor and provisioner executing real plan, init, and validation commands.",
      icon: TerraformLogo,
    },
    {
      name: "Git",
      category: "Version Control",
      desc: "Source control integration with repository branch history, commit inspection, and remote staging.",
      icon: GithubLogo,
    },
    {
      name: "Linux",
      category: "System Foundation",
      desc: "Low-latency WebSocket PTY emulator with standard POSIX system utilities and root filesystem navigation.",
      icon: LinuxLogo,
    },
    {
      name: "Cloudflare",
      category: "Edge & Delivery",
      desc: "Edge DNS routing and automated static deployment through Cloudflare Pages continuous delivery.",
      icon: CloudflareLogo,
    },
  ];

  return (
    <section id="technologies" className="py-24 bg-white border-b border-slate-200 scroll-mt-16" aria-labelledby="tech-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
            <Code2 className="w-3.5 h-3.5" />
            <span>Infrastructure Standards</span>
          </div>

          <h2 id="tech-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Built around the technologies developers already use.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            CaelumOS integrates directly with standard, industry-proven cloud, container, and infrastructure runtimes — requiring no proprietary rewrites or vendor lock-in.
          </p>
        </div>

        {/* Technologies Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {technologies.map((tech) => {
            const Icon = tech.icon;
            return (
              <div
                key={tech.name}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 flex flex-col justify-between hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 group-hover:text-slate-900 transition-colors shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      {tech.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-mono">
                      {tech.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
                      {tech.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Standard Protocol</span>
                  <span className="text-slate-600 font-medium">&bull; Native API</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
