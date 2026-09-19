"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowUpRight, ArrowRight, Terminal, Github, Sparkles } from 'lucide-react';
import { CaelumLogo } from './Logos';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Overview', href: '#what-is-caelum' },
    { label: 'Platform', href: '#platform' },
    { label: 'Architecture', href: '#architecture' },
    { label: 'Bootable OS', href: '#bootable' },
    { label: 'Roadmap', href: '#roadmap' },
    { label: 'Docs', href: '#docs' },
    { label: 'Download', href: '/download' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#09090b]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl py-3' 
          : 'bg-transparent border-b border-white/[0.04] py-4'
      }`}
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link 
          href="/" 
          className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-lg p-1"
          aria-label="CaelumOS Home"
        >
          <div className="relative">
            <CaelumLogo className="w-8 h-8 transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-cyan-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-base font-extrabold tracking-wider text-white flex items-center gap-1.5">
              CAELUM<span className="text-cyan-400">OS</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase -mt-1 hidden sm:block">
              caleum.me
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Action Buttons (Right) */}
        <div className="hidden md:flex items-center space-x-2.5">
          <a
            href="https://github.com/TheCaelumOS/caelum-os-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
            aria-label="View on GitHub"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>

          <Link
            href="/download"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all"
            aria-label="Download CaelumOS"
          >
            <span>Download</span>
          </Link>

          <a
            href="#what-is-caelum"
            className="group relative inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all active:scale-95"
            aria-label="Explore CaelumOS"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Explore CaelumOS</span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center space-x-2">
          <Link
            href="/download"
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30"
          >
            Download
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors focus:outline-none"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#09090b]/95 backdrop-blur-2xl border-b border-white/[0.08] px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-white/[0.08] flex flex-col space-y-2">
            <Link
              href="/download"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold text-cyan-200 bg-cyan-500/20 border border-cyan-500/30 shadow-md transition-all"
            >
              <span>Download CaelumOS (ISO)</span>
            </Link>
            <a
              href="#what-is-caelum"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Explore CaelumOS</span>
            </a>
            <a
              href="https://github.com/TheCaelumOS/caelum-os-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-medium text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08]"
            >
              <Github className="w-4 h-4" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
