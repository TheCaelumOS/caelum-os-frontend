'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  X, 
  ChevronDown, 
  Search, 
  BookOpen, 
  Layers, 
  Users, 
  Cpu, 
  Terminal, 
  Github, 
  ArrowRight,
  ExternalLink,
  Download,
  Disc,
  MessageSquare,
  GitBranch,
  Shield,
  FileCode,
  Sparkles
} from 'lucide-react';
import { CaleumLogo, GithubLogo } from './Logos';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const docItems = [
    { title: "Getting Started", desc: "Overview of Caelum workspace and prerequisites.", href: "#architecture", icon: BookOpen },
    { title: "Architecture Specifications", desc: "Modular subsystems, daemons, and cloud adapters.", href: "#architecture", icon: Cpu },
    { title: "Developer Tooling", desc: "Terminals, Git, VS Code, and container workflows.", href: "#tools", icon: Terminal },
    { title: "CaelumOS Specifications", desc: "Native bootable operating system architecture.", href: "#caelumos", icon: Disc },
    { title: "Contributing Guide", desc: "Codebase standards, issue templates, and PR workflow.", href: "https://github.com/TheCaelumOS/caelum-os-frontend", icon: GitBranch, external: true },
  ];

  const communityItems = [
    { title: "GitHub Organization", desc: "Source code repositories, pull requests, and releases.", href: "https://github.com/TheCaelumOS/caelum-os-frontend", icon: Github, external: true },
    { title: "Discord Community", desc: "Real-time discussions with engineering contributors.", href: "https://github.com/TheCaelumOS/caelum-os-frontend/discussions", icon: MessageSquare, external: true },
    { title: "Issue Tracker", desc: "Bug reports, architectural RFCs, and feature requests.", href: "https://github.com/TheCaelumOS/caelum-os-frontend/issues", icon: Shield, external: true },
    { title: "Project Discussions", desc: "Design proposals, roadmap votes, and community feedback.", href: "https://github.com/TheCaelumOS/caelum-os-frontend/discussions", icon: Users, external: true },
  ];

  return (
    <header 
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-white border-b border-slate-200 ${
        scrolled ? 'shadow-xs py-2.5' : 'py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="flex items-center space-x-2.5 group focus:outline-none"
              aria-label="Caelum Home"
            >
              <CaleumLogo className="w-8 h-8 rounded-lg shadow-2xs group-hover:scale-105 transition-transform" />
              <div className="flex items-baseline">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                  Caelum
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
              
              {/* Get Caelum */}
              <Link
                href="/download"
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                Get Caelum
              </Link>

              {/* Blog */}
              <a
                href="#blog"
                className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                Blog
              </a>

              {/* Documentation Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('docs')}
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeDropdown === 'docs' 
                      ? 'text-blue-600 bg-blue-50/70 font-semibold' 
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                  aria-expanded={activeDropdown === 'docs'}
                >
                  <span>Documentation</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'docs' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'docs' && (
                  <div className="absolute top-full left-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl p-3 z-50 space-y-1">
                    <div className="text-[10px] font-mono uppercase font-bold text-slate-400 px-3 py-1">
                      Project Documentation
                    </div>
                    {docItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.title}
                          href={item.href}
                          target={item.external ? "_blank" : undefined}
                          rel={item.external ? "noopener noreferrer" : undefined}
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="p-1.5 rounded-md bg-slate-100 text-slate-700 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 flex items-center gap-1">
                              <span>{item.title}</span>
                              {item.external && <ExternalLink className="w-3 h-3 text-slate-400" />}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{item.desc}</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Community Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('community')}
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeDropdown === 'community' 
                      ? 'text-blue-600 bg-blue-50/70 font-semibold' 
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                  aria-expanded={activeDropdown === 'community'}
                >
                  <span>Community</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'community' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'community' && (
                  <div className="absolute top-full left-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl p-3 z-50 space-y-1">
                    <div className="text-[10px] font-mono uppercase font-bold text-slate-400 px-3 py-1">
                      Community &amp; Open Source
                    </div>
                    {communityItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.title}
                          href={item.href}
                          target={item.external ? "_blank" : undefined}
                          rel={item.external ? "noopener noreferrer" : undefined}
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="p-1.5 rounded-md bg-slate-100 text-slate-700 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 flex items-center gap-1">
                              <span>{item.title}</span>
                              {item.external && <ExternalLink className="w-3 h-3 text-slate-400" />}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{item.desc}</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tools */}
              <a
                href="#tools"
                className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                Tools
              </a>

              {/* Platforms */}
              <a
                href="#platforms"
                className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                Platforms
              </a>

              {/* Partners / Ecosystem */}
              <a
                href="#partners"
                className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                Partners
              </a>

            </nav>
          </div>

          {/* Right Controls: Search, Theme Toggle, GitHub */}
          <div className="flex items-center space-x-3">
            
            {/* Search Button / Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hidden sm:inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/70 text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 transition-colors text-xs font-mono"
              aria-label="Search Documentation"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search docs...</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-400">⌘K</kbd>
            </button>

            {/* GitHub Repo Button */}
            <a
              href="https://github.com/TheCaelumOS/caelum-os-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
              aria-label="GitHub Repository"
            >
              <GithubLogo className="w-3.5 h-3.5" />
              <span className="hidden md:inline">GitHub</span>
            </a>

            {/* Get Caelum Button CTA */}
            <Link
              href="/download"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get Caelum</span>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>

          </div>

        </div>
      </div>

      {/* Search Bar Modal / Dropdown */}
      {searchOpen && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 shadow-md">
          <div className="max-w-3xl mx-auto flex items-center space-x-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation, tools, platforms, and architecture specifications..."
              className="w-full bg-transparent border-0 focus:outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-mono"
              autoFocus
            />
            <button 
              onClick={() => setSearchOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 text-xs font-mono"
            >
              ESC
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
          
          <div className="space-y-1">
            <Link
              href="/download"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-900 hover:text-blue-600"
            >
              Get Caelum
            </Link>
            <a
              href="#blog"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
            >
              Blog
            </a>
            <a
              href="#tools"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
            >
              Tools
            </a>
            <a
              href="#platforms"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
            >
              Platforms
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
            >
              Architecture
            </a>
            <a
              href="#partners"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
            >
              Partners
            </a>
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400">Documentation</div>
            <div className="grid grid-cols-1 gap-1 pl-2">
              {docItems.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 text-xs font-medium text-slate-700 hover:text-blue-600"
                >
                  {item.title}
                </a>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400">Community</div>
            <div className="grid grid-cols-1 gap-1 pl-2">
              {communityItems.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 text-xs font-medium text-slate-700 hover:text-blue-600"
                >
                  {item.title}
                </a>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col space-y-2">
            <Link
              href="/download"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get Caelum</span>
            </Link>
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

    </header>
  );
}