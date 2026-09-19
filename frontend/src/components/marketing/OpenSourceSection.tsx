'use client';

import React from 'react';
import { 
  Users, 
  BookOpen, 
  GitPullRequest, 
  AlertCircle, 
  MessageSquare, 
  ArrowRight, 
  ArrowUpRight,
  Code2
} from 'lucide-react';
import { GithubLogo } from './Logos';

export default function OpenSourceSection() {
  const resources = [
    {
      title: "GitHub Repository",
      desc: "Explore public source code, inspect recent commits, and follow development branches.",
      icon: GithubLogo,
      href: "https://github.com/TheCaelumOS/caelum-os-frontend",
      action: "Browse Code",
      external: true
    },
    {
      title: "Documentation",
      desc: "Step-by-step guides for connecting local Docker daemons, cloud SDKs, and Terraform provisioners.",
      icon: BookOpen,
      href: "#docs",
      action: "Read Docs",
      external: false
    },
    {
      title: "Issues & Bug Reports",
      desc: "Report issues, track active bug fixes, and monitor infrastructure integration status.",
      icon: AlertCircle,
      href: "https://github.com/TheCaelumOS/caelum-os-frontend/issues",
      action: "Open Issues",
      external: true
    },
    {
      title: "Contributions",
      desc: "Submit pull requests, propose architecture improvements, and collaborate with core engineers.",
      icon: GitPullRequest,
      href: "https://github.com/TheCaelumOS/caelum-os-frontend/pulls",
      action: "Contribute",
      external: true
    },
    {
      title: "Community Discussions",
      desc: "Engage in technical discussions around cloud orchestration, container runtimes, and developer tooling.",
      icon: MessageSquare,
      href: "https://github.com/TheCaelumOS/caelum-os-frontend/discussions",
      action: "Join Discussion",
      external: true
    },
  ];

  return (
    <section id="developers" className="py-24 bg-white border-b border-slate-200 scroll-mt-16" aria-labelledby="devs-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Open Ecosystem</span>
          </div>

          <h2 id="devs-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Built with developers, for developers.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Caleum is built in public. We believe developer tools must be auditable, extensible, and anchored in strong open-source collaboration.
          </p>

          <div className="pt-2">
            <a
              href="https://github.com/TheCaelumOS/caelum-os-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
            >
              <GithubLogo className="w-4 h-4" />
              <span>View on GitHub</span>
              <ArrowUpRight className="w-4 h-4 opacity-70" />
            </a>
          </div>
        </div>

        {/* Developer Resources Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {resources.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.title}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 flex flex-col justify-between hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all group"
              >
                <div className="space-y-3">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 w-fit text-slate-800 group-hover:text-blue-600 transition-colors shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-1">
                      <span>{item.title}</span>
                      {item.external && <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono text-blue-600 font-semibold group-hover:text-blue-800">
                  <span>{item.action}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
}
