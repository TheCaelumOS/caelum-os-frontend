'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { 
  DockerLogo, 
  KubernetesLogo, 
  TerraformLogo, 
  AwsLogo, 
  AzureLogo, 
  GrafanaLogo, 
  JenkinsLogo, 
  GitLogo, 
  GithubLogo, 
  VsCodeLogo, 
  LinuxLogo, 
  PostgreSqlLogo, 
  RedisLogo, 
  NginxLogo, 
  NodeJsLogo, 
  PythonLogo 
} from './Logos';

export default function ToolsGridSection() {
  const tools = [
    { name: "Docker", category: "Containers", icon: DockerLogo, color: "text-sky-500" },
    { name: "Kubernetes", category: "Orchestration", icon: KubernetesLogo, color: "text-blue-600" },
    { name: "Terraform", category: "IaC", icon: TerraformLogo, color: "text-purple-600" },
    { name: "AWS", category: "Cloud", icon: AwsLogo, color: "text-amber-500" },
    { name: "Azure", category: "Cloud", icon: AzureLogo, color: "text-blue-500" },
    { name: "Grafana", category: "Observability", icon: GrafanaLogo, color: "text-orange-500" },
    { name: "Jenkins", category: "CI/CD", icon: JenkinsLogo, color: "text-red-600" },
    { name: "Git", category: "VCS", icon: GitLogo, color: "text-rose-500" },
    { name: "GitHub", category: "Collaboration", icon: GithubLogo, color: "text-slate-800" },
    { name: "VS Code", category: "Editor", icon: VsCodeLogo, color: "text-sky-600" },
    { name: "Linux", category: "Kernel", icon: LinuxLogo, color: "text-slate-800" },
    { name: "PostgreSQL", category: "Database", icon: PostgreSqlLogo, color: "text-blue-700" },
    { name: "Redis", category: "Cache", icon: RedisLogo, color: "text-red-500" },
    { name: "Nginx", category: "Gateway", icon: NginxLogo, color: "text-emerald-600" },
    { name: "Node.js", category: "Runtime", icon: NodeJsLogo, color: "text-emerald-500" },
    { name: "Python", category: "Language", icon: PythonLogo, color: "text-yellow-500" },
  ];

  return (
    <section id="tools" className="py-24 bg-slate-50/50 border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            All the tools you need
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Caelum brings together the tools developers and infrastructure engineers use to build, deploy, observe, and operate modern systems.
          </p>

          <div className="pt-2">
            <a 
              href="#architecture" 
              className="inline-flex items-center space-x-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group"
            >
              <span>Explore all tools</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* 16 Tool Tiles Grid (Inspired by Kali benchmark) */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div 
                key={tool.name}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-400 hover:-translate-y-1 transition-all flex flex-col items-center text-center space-y-3 group cursor-default"
              >
                <div className={`p-3 rounded-xl bg-slate-50 border border-slate-100 ${tool.color} transition-transform group-hover:scale-110`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 font-sans group-hover:text-blue-600 transition-colors">
                    {tool.name}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 font-medium">
                    {tool.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
