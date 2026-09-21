'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Users, 
  Cpu, 
  Download, 
  Terminal, 
  GitBranch, 
  Compass, 
  Github, 
  MessageSquare, 
  Shield, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { GithubLogo } from './Logos';

export default function DocsCommunitySection() {
  const docLinks = [
    { title: "Architecture", desc: "5-tier system design, microservices, and daemon sockets.", href: "#architecture", icon: Cpu },
    { title: "Getting Started", desc: "Initial setup, environment variables, and local development.", href: "/download", icon: BookOpen },
    { title: "Installation", desc: "Deploying local connectors and configuring cloud accounts.", href: "/download", icon: Download },
    { title: "Tooling", desc: "Setting up Docker sockets, Kubernetes contexts, and Terraform CLI.", href: "#tools", icon: Terminal },
    { title: "Contributing", desc: "Contribution guidelines, PR etiquette, and code formatting.", href: "https://github.com/TheCaelumOS/caelum-os-frontend", icon: GitBranch, external: true },
    { title: "Roadmap", desc: "Development milestones, RFC status, and planned features.", href: "#roadmap", icon: Compass },
  ];

  const communityLinks = [
    { title: "GitHub", desc: "Core repository, issues, pull requests, and discussions.", href: "https://github.com/TheCaelumOS/caelum-os-frontend", icon: Github, external: true },
    { title: "Discord", desc: "Real-time chat with the core engineering team and community.", href: "https://github.com/TheCaelumOS/caelum-os-frontend/discussions", icon: MessageSquare, external: true },
    { title: "Discussions", desc: "Architectural proposals, feature ideas, and Q&A.", href: "https://github.com/TheCaelumOS/caelum-os-frontend/discussions", icon: Users, external: true },
    { title: "Contributing", desc: "Join our open-source contributors and submit enhancements.", href: "https://github.com/TheCaelumOS/caelum-os-frontend", icon: GitBranch, external: true },
    { title: "Issues", desc: "Report bugs, track defects, and request platform capabilities.", href: "https://github.com/TheCaelumOS/caelum-os-frontend/issues", icon: Shield, external: true },
  ];

  return (
    <section id="docs-community" className="py-24 bg-white border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700 uppercase tracking-wider">
            <span>Developer Ecosystem</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Documentation &amp; Community
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Everything you need to understand the architecture, contribute code, and collaborate with engineers building Caelum.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Documentation Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-200">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900 font-sans">
                Documentation Hub
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {docLinks.map((doc) => {
                const Icon = doc.icon;
                return (
                  <a
                    key={doc.title}
                    href={doc.href}
                    target={doc.external ? "_blank" : undefined}
                    rel={doc.external ? "noopener noreferrer" : undefined}
                    className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/90 shadow-2xs hover:bg-white hover:border-blue-400 hover:shadow-xs transition-all flex items-start space-x-3 group"
                  >
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 font-sans group-hover:text-blue-600 transition-colors">
                          {doc.title}
                        </span>
                        {doc.external ? (
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        ) : (
                          <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 group-hover:text-blue-600 transition-all" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 font-normal">
                        {doc.desc}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Community Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-200">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900 font-sans">
                Community &amp; Collaboration
              </h3>
            </div>

            <div className="space-y-3">
              {communityLinks.map((com) => {
                const Icon = com.icon;
                return (
                  <a
                    key={com.title}
                    href={com.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/90 shadow-2xs hover:bg-white hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 font-sans group-hover:text-blue-600 transition-colors block">
                          {com.title}
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          {com.desc}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
