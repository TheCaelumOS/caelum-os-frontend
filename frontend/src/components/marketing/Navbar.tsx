'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  X, 
  ChevronDown, 
  Terminal, 
  Cloud, 
  Cpu, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Github, 
  ExternalLink,
  BookOpen,
  Layers,
  Compass,
  FileText,
  Activity,
  Users,
  Code2,
  ArrowUpRight,
  Disc,
  AppWindow,
  Box
} from 'lucide-react';
import { CaleumLogo, CaelumOsLogo, GithubLogo } from './Logos';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const productItems = [
    {
      name: "CaelumOS Architecture",
      desc: "Unified operating environment coordinating multi-cloud and local runtimes.",
      tag: "Architecture",
      tagColor: "bg-blue-50 text-blue-700 border-blue-200 font-semibold",
      href: "#architecture",
      icon: AppWindow,
    },
    {
      name: "What is CaleumOS?",
      desc: "DevOps tool fragmentation solved with a unified operating layer.",
      tag: "Overview",
      tagColor: "bg-slate-100 text-slate-700 border-slate-200",
      href: "#what-is-caleumos",
      icon: Layers,
    },
    {
      name: "AWS + Azure",
      desc: "Live SDK integration for EC2, S3, RDS, Azure VMs, and Blob storage.",
      tag: "Live SDKs",
      tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
      href: "#cloud-providers",
      icon: Cloud,
    },
    {
      name: "Docker + K8s + Terraform",
      desc: "Host Docker daemon, Kubernetes contexts, and sandboxed Terraform HCL execution.",
      tag: "IaC & Daemons",
      tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
      href: "#containers-iac",
      icon: Box,
    },
    {
      name: "Caleum Intelligence",
      desc: "AI layer for infrastructure diagnostics, HCL generation, and log analysis.",
      tag: "In Development",
      tagColor: "bg-amber-50 text-amber-800 border-amber-200 font-semibold",
      href: "#intelligence",
      icon: Sparkles,
    },
  ];

  const developerItems = [
    { name: "Developer Environment", desc: "Interactive Xterm PTY, VS Code, Git adapter, and monitoring.", href: "#dev-environment", icon: Terminal },
    { name: "Technical Architecture", desc: "Next.js on Cloudflare Pages, NestJS micro-monolith, and PostgreSQL.", href: "#architecture", icon: Cpu },
    { name: "GitHub Repository", desc: "Public source code, issues, commits, and pull requests.", href: "https://github.com/TheCaelumOS/caelum-os-frontend", icon: Github, external: true },
    { name: "Open Source Community", desc: "Join our open-source collaboration and architectural discussions.", href: "#open-source", icon: Users },
    { name: "Future Native OS", desc: "Vision toward a bootable hybrid Linux distribution.", href: "#future-os", icon: Disc },
  ];

  const companyItems = [
    { name: "About Caleum", desc: "The technology ecosystem simplifying developer infrastructure.", href: "#what-is-caleumos", icon: Compass },
    { name: "Roadmap", desc: "Current, building, and future engineering milestones.", href: "#roadmap", icon: Activity },
    { name: "Future OS Vision", desc: "Long-term transition to a bare-metal cloud OS.", href: "#future-os", icon: Sparkles },
    { name: "ISO Downloads", desc: "Binary distribution hub and release verification.", href: "/download", icon: Disc },
  ];

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-3' 
          : 'bg-white border-b border-slate-200/80 py-4'
      }`}
      aria-label="Global Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Company Brand Logo & Name */}
        <div className="flex items-center space-x-8">
          <Link 
            href="/" 
            className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-lg p-0.5"
            aria-label="Caleum Home"
          >
            <CaleumLogo className="w-8 h-8 flex-shrink-0" />
            <span className="font-sans text-[22px] font-extrabold tracking-tight text-[#040C1C]">
              Caleum
            </span>
          </Link>

          {/* Desktop Navigation Links with Dropdowns */}
          <div className="hidden lg:flex items-center space-x-1 text-sm font-medium text-slate-700">
            
            {/* Products Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'products' ? null : 'products')}
                className={`px-3 py-1.5 rounded-md hover:text-slate-900 hover:bg-slate-100/70 inline-flex items-center gap-1 transition-colors ${
                  activeDropdown === 'products' ? 'text-slate-900 bg-slate-100/70 font-semibold' : ''
                }`}
              >
                <span>Products</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${activeDropdown === 'products' ? 'rotate-180' : ''}`} />
              </button>

              {activeDropdown === 'products' && (
                <div className="absolute top-full left-0 mt-2 w-96 rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50 space-y-1">
                  {productItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <div className="p-2 rounded-md bg-slate-100 text-slate-700 group-hover:text-blue-600 transition-colors mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">{item.name}</span>
                            <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded border ${item.tagColor}`}>
                              {item.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{item.desc}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Developers Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'developers' ? null : 'developers')}
                className={`px-3 py-1.5 rounded-md hover:text-slate-900 hover:bg-slate-100/70 inline-flex items-center gap-1 transition-colors ${
                  activeDropdown === 'developers' ? 'text-slate-900 bg-slate-100/70 font-semibold' : ''
                }`}
              >
                <span>Developers</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${activeDropdown === 'developers' ? 'rotate-180' : ''}`} />
              </button>

              {activeDropdown === 'developers' && (
                <div className="absolute top-full left-0 mt-2 w-96 rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50 space-y-1">
                  {developerItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <div className="p-2 rounded-md bg-slate-100 text-slate-700 group-hover:text-blue-600 transition-colors mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 flex items-center gap-1">
                              {item.name}
                              {item.external && <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{item.desc}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Architecture Link */}
            <a
              href="#architecture"
              className="px-3 py-1.5 rounded-md hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
            >
              Architecture
            </a>

            {/* Roadmap Link */}
            <a
              href="#roadmap"
              className="px-3 py-1.5 rounded-md hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
            >
              Roadmap
            </a>

            {/* Company Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'company' ? null : 'company')}
                className={`px-3 py-1.5 rounded-md hover:text-slate-900 hover:bg-slate-100/70 inline-flex items-center gap-1 transition-colors ${
                  activeDropdown === 'company' ? 'text-slate-900 bg-slate-100/70 font-semibold' : ''
                }`}
              >
                <span>Company</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${activeDropdown === 'company' ? 'rotate-180' : ''}`} />
              </button>

              {activeDropdown === 'company' && (
                <div className="absolute top-full left-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50 space-y-1">
                  {companyItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <div className="p-2 rounded-md bg-slate-100 text-slate-700 group-hover:text-blue-600 transition-colors mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 block">{item.name}</span>
                          <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{item.desc}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-3">
          
          {/* GitHub Repo Button */}
          <a
            href="https://github.com/TheCaelumOS/caelum-os-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
            aria-label="GitHub Repository"
          >
            <GithubLogo className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>

          {/* Explore Architecture CTA */}
          <a
            href="#architecture"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs group"
          >
            <span>Explore Architecture</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-slate-700" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl">
          
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Products</div>
            <div className="space-y-1 pl-2">
              {productItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-1.5 text-xs font-medium text-slate-800 hover:text-blue-600"
                >
                  <span className="font-mono">{item.name}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${item.tagColor}`}>{item.tag}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Developers</div>
            <div className="space-y-1 pl-2">
              {developerItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-1.5 text-xs font-medium text-slate-800 hover:text-blue-600"
                >
                  <span>{item.name}</span>
                  {item.external && <ArrowUpRight className="w-3 h-3 text-slate-400" />}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Company &amp; Resources</div>
            <div className="space-y-1 pl-2">
              {companyItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-xs font-medium text-slate-800 hover:text-blue-600"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col space-y-2">
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 shadow-xs"
            >
              <span>Explore Architecture &rarr;</span>
            </a>
            <a
              href="https://github.com/TheCaelumOS/caelum-os-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200"
            >
              <GithubLogo className="w-3.5 h-3.5" />
              <span>GitHub Repository</span>
            </a>
          </div>

        </div>
      )}
    </nav>
  );
}