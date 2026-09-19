'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, 
  Menu, 
  X, 
  ArrowRight, 
  ArrowUpRight, 
  Layers, 
  Terminal, 
  Cloud, 
  ShieldCheck, 
  Cpu, 
  BookOpen, 
  Code2, 
  Github, 
  Users, 
  Compass, 
  FileText, 
  Activity,
  Sparkles,
  ExternalLink
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
      name: "CaelumOS",
      desc: "Modern developer operating environment for cloud & infrastructure.",
      tag: "Flagship &bull; Available",
      tagColor: "bg-blue-50 text-blue-700 border-blue-200 font-semibold",
      href: "#caelum-os",
      icon: CaelumOsLogo,
    },
    {
      name: "Cloud",
      desc: "Distributed fleet orchestration & multi-cloud control plane.",
      tag: "Roadmap",
      tagColor: "bg-slate-100 text-slate-600 border-slate-200",
      href: "#ecosystem",
      icon: Cloud,
    },
    {
      name: "Developer Platform",
      desc: "Persistent team workspaces and collaborative execution.",
      tag: "Roadmap",
      tagColor: "bg-slate-100 text-slate-600 border-slate-200",
      href: "#ecosystem",
      icon: Layers,
    },
    {
      name: "Security",
      desc: "Zero-trust credential vaults and automated compliance verification.",
      tag: "Roadmap",
      tagColor: "bg-slate-100 text-slate-600 border-slate-200",
      href: "#ecosystem",
      icon: ShieldCheck,
    },
    {
      name: "Infrastructure",
      desc: "Automated engine runtimes and multi-cloud infrastructure fabric.",
      tag: "Roadmap",
      tagColor: "bg-slate-100 text-slate-600 border-slate-200",
      href: "#ecosystem",
      icon: Cpu,
    },
  ];

  const developerItems = [
    { name: "Documentation", desc: "Technical guides, host daemon setup, and API specs.", href: "#docs", icon: BookOpen },
    { name: "Getting Started", desc: "Step-by-step local configuration instructions.", href: "#docs", icon: Terminal },
    { name: "GitHub", desc: "Official source code repository and public issues.", href: "https://github.com/TheCaelumOS/caelum-os-frontend", icon: Github, external: true },
    { name: "Community", desc: "Join contributors and infrastructure engineers.", href: "https://github.com/TheCaelumOS/caelum-os-frontend", icon: Users, external: true },
    { name: "Releases", desc: "Future bootable OS builds and hardware specs.", href: "/download", icon: Code2 },
  ];

  const companyItems = [
    { name: "About Caleum", desc: "Our mission to simplify modern developer infrastructure.", href: "#about", icon: Compass },
    { name: "Vision", desc: "The transition from local environments to cloud control.", href: "#vision", icon: Sparkles },
    { name: "Roadmap", desc: "Phased engineering trajectory and milestones.", href: "#roadmap", icon: Activity },
    { name: "Careers", desc: "Building the core infrastructure foundation.", href: "#about", icon: Users },
    { name: "Contact", desc: "Reach our engineering and architecture team.", href: "#footer", icon: FileText },
  ];

  const resourceItems = [
    { name: "Blog", desc: "Engineering notes, architecture insights, and updates.", href: "#resources", icon: FileText, tag: "Coming soon" },
    { name: "Changelog", desc: "Release notes and development log.", href: "#roadmap", icon: Activity },
    { name: "Tutorials", desc: "Terraform, Docker, and AWS integration walkthroughs.", href: "#docs", icon: BookOpen },
    { name: "System Status", desc: "Host runtime and daemon connection status.", href: "#docs", icon: Activity, tag: "Operational" },
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
                  {productItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setActiveDropdown(null)}
                      className="p-2.5 rounded-lg hover:bg-slate-50 flex items-start space-x-3 transition-colors group"
                    >
                      <item.icon className="w-5 h-5 text-slate-700 group-hover:text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 font-mono">{item.name}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${item.tagColor}`}>
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </a>
                  ))}
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
                <div className="absolute top-full left-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50 space-y-1">
                  {developerItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      onClick={() => setActiveDropdown(null)}
                      className="p-2.5 rounded-lg hover:bg-slate-50 flex items-start space-x-3 transition-colors group"
                    >
                      <item.icon className="w-4 h-4 text-slate-600 group-hover:text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-900">{item.name}</span>
                          {item.external && <ArrowUpRight className="w-3 h-3 text-slate-400" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

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
                  {companyItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setActiveDropdown(null)}
                      className="p-2.5 rounded-lg hover:bg-slate-50 flex items-start space-x-3 transition-colors group"
                    >
                      <item.icon className="w-4 h-4 text-slate-600 group-hover:text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-slate-900">{item.name}</span>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'resources' ? null : 'resources')}
                className={`px-3 py-1.5 rounded-md hover:text-slate-900 hover:bg-slate-100/70 inline-flex items-center gap-1 transition-colors ${
                  activeDropdown === 'resources' ? 'text-slate-900 bg-slate-100/70 font-semibold' : ''
                }`}
              >
                <span>Resources</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
              </button>

              {activeDropdown === 'resources' && (
                <div className="absolute top-full left-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50 space-y-1">
                  {resourceItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setActiveDropdown(null)}
                      className="p-2.5 rounded-lg hover:bg-slate-50 flex items-start space-x-3 transition-colors group"
                    >
                      <item.icon className="w-4 h-4 text-slate-600 group-hover:text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{item.name}</span>
                          {item.tag && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center space-x-3">
          <a
            href="https://github.com/TheCaelumOS/caelum-os-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <GithubLogo className="w-3.5 h-3.5 text-slate-700" />
            <span>GitHub</span>
          </a>

          <a
            href="#platform"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs"
          >
            <span>Explore CaelumOS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center space-x-2">
          <a
            href="#platform"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600"
          >
            CaelumOS
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-slate-800" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[85vh] overflow-y-auto">
          
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
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Company & Resources</div>
            <div className="space-y-1 pl-2">
              {companyItems.slice(0, 3).map((item) => (
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
              href="#caelum-os"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold text-white bg-slate-900 shadow-sm"
            >
              <span>Explore CaelumOS</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
