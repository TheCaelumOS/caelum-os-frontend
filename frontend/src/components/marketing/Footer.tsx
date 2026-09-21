'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Youtube, 
  ArrowUp, 
  ExternalLink,
  Heart,
  MessageSquare,
  Shield,
  FileText,
  Rss
} from 'lucide-react';
import { CaleumLogo, GithubLogo } from './Logos';

export default function Footer() {
  const [isDark, setIsDark] = useState(true);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#030712] text-slate-400 border-t border-slate-800 text-xs font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Light / Dark Mode Switcher (Matching Kali Benchmark Screenshot 7) */}
      <div className="border-b border-slate-800/80 py-4 flex justify-center items-center space-x-3">
        <span className="text-[11px] font-mono font-bold text-slate-500">LIGHT</span>
        <div 
          onClick={() => setIsDark(!isDark)}
          className="w-12 h-6 rounded-full bg-slate-800 border border-slate-700 p-0.5 cursor-pointer flex items-center transition-colors relative"
        >
          <div 
            className={`w-5 h-5 rounded-full bg-blue-600 shadow-md transform transition-transform ${
              isDark ? 'translate-x-6' : 'translate-x-0 bg-white'
            }`} 
          />
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-200">DARK</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-8 lg:gap-6">
          
          {/* Column 1: LINKS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Links
            </h4>
            <ul className="space-y-2 text-slate-400 font-sans">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/download" className="hover:text-white transition-colors">Get Caelum</Link>
              </li>
              <li>
                <a href="#blog" className="hover:text-white transition-colors">Blog</a>
              </li>
              <li>
                <a href="#docs-community" className="hover:text-white transition-colors">Documentation</a>
              </li>
              <li>
                <a href="#roadmap" className="hover:text-white transition-colors">Roadmap</a>
              </li>
              <li>
                <a 
                  href="https://github.com/TheCaelumOS/caelum-os-frontend" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: PLATFORMS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Platforms
            </h4>
            <ul className="space-y-2 text-slate-400 font-sans">
              <li>
                <a href="#platforms" className="hover:text-white transition-colors">Cloud</a>
              </li>
              <li>
                <a href="#platforms" className="hover:text-white transition-colors">Containers</a>
              </li>
              <li>
                <a href="#caelumos" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Bootable OS</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">DEV</span>
                </a>
              </li>
              <li>
                <a href="#platforms" className="hover:text-white transition-colors">Virtual Machines</a>
              </li>
              <li>
                <a href="#platforms" className="hover:text-white transition-colors">Desktop &amp; Laptop</a>
              </li>
              <li>
                <a href="#platforms" className="hover:text-white transition-colors">Future ARM</a>
              </li>
            </ul>
          </div>

          {/* Column 3: DEVELOPMENT */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Development
            </h4>
            <ul className="space-y-2 text-slate-400 font-sans">
              <li>
                <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
              </li>
              <li>
                <a href="#tools" className="hover:text-white transition-colors">Tools</a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-white transition-colors">Integrations</a>
              </li>
              <li>
                <a 
                  href="https://github.com/TheCaelumOS/caelum-os-frontend" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Contributing
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/TheCaelumOS/caelum-os-frontend/issues" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Issues
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/TheCaelumOS/caelum-os-frontend/issues" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Bug Tracker
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: COMMUNITY */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Community
            </h4>
            <ul className="space-y-2 text-slate-400 font-sans">
              <li>
                <a 
                  href="https://github.com/TheCaelumOS/caelum-os-frontend" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/TheCaelumOS/caelum-os-frontend/discussions" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Discord
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/TheCaelumOS/caelum-os-frontend/discussions" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Discussions
                </a>
              </li>
              <li>
                <a 
                  href="#docs-community" 
                  className="hover:text-white transition-colors"
                >
                  Community
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/TheCaelumOS/caelum-os-frontend" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Support Forum
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: FOLLOW US */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Follow Us
            </h4>
            <ul className="space-y-2 text-slate-400 font-sans">
              <li>
                <a 
                  href="https://github.com/TheCaelumOS" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <GithubLogo className="w-3.5 h-3.5 text-slate-400" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://x.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <Twitter className="w-3.5 h-3.5 text-sky-400" />
                  <span>X (Twitter)</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <Youtube className="w-3.5 h-3.5 text-rose-500" />
                  <span>YouTube</span>
                </a>
              </li>
              <li>
                <a 
                  href="#blog" 
                  className="hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <Rss className="w-3.5 h-3.5 text-amber-500" />
                  <span>RSS Feed</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 6: POLICIES */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Policies
            </h4>
            <ul className="space-y-2 text-slate-400 font-sans">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-white transition-colors">Security Policy</Link>
              </li>
              <li>
                <a 
                  href="https://github.com/TheCaelumOS/caelum-os-frontend/blob/main/CODE_OF_CONDUCT.md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Code of Conduct
                </a>
              </li>
            </ul>
          </div>

          {/* Column 7: Brand Identity & Mission (Right Side) */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-4 pt-4 lg:pt-0 border-t border-slate-800 lg:border-t-0">
            <div className="flex items-center space-x-2.5">
              <CaleumLogo className="w-8 h-8 rounded-lg shadow-md" />
              <span className="text-lg font-bold text-white tracking-tight font-sans">
                Caelum
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Open-source developer infrastructure, built for the cloud-native era.
            </p>

            <div className="pt-2 text-[11px] font-mono text-slate-500 space-y-1">
              <p>&copy; 2026 Caelum Project.</p>
              <p>All rights reserved.</p>
            </div>
          </div>

        </div>

        {/* Bottom Banner Strip */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Caelum Open Source Engineering Platform &bull; Apache License 2.0</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}