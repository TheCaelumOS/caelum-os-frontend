'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CaleumLogo, GithubLogo } from './Logos';

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-12 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pb-12 border-b border-slate-200">
          
          {/* Col 1 & 2: Brand Information */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2.5">
              <CaleumLogo className="w-7 h-7 flex-shrink-0" />
              <span className="font-sans text-xl font-extrabold tracking-tight text-[#040C1C]">
                Caleum
              </span>
            </Link>

            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Caleum builds developer infrastructure and operating environments that make cloud, DevOps and software development simpler, faster and more accessible.
            </p>

            <div className="text-[11px] font-mono text-slate-500 space-y-1">
              <div>Domain: <a href="https://caleum.me/" className="text-blue-600 hover:underline">https://caleum.me/</a></div>
              <div>Flagship Product: <span className="text-slate-800 font-semibold">CaelumOS</span></div>
            </div>

            <div className="pt-1">
              <a
                href="https://github.com/TheCaelumOS/caelum-os-frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-[11px] font-mono text-slate-700 hover:text-slate-900 hover:border-slate-300 transition-colors"
              >
                <GithubLogo className="w-3.5 h-3.5" />
                <span>TheCaelumOS / caelum-os-frontend</span>
              </a>
            </div>
          </div>

          {/* Col 3: Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono mb-3">
              CaelumOS
            </h4>
            <ul className="space-y-2 text-slate-600">
              <li>
                <a href="#architecture" className="hover:text-blue-600 transition-colors flex items-center justify-between">
                  <span>Architecture</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">SPEC</span>
                </a>
              </li>
              <li>
                <a href="#what-is-caleumos" className="hover:text-blue-600 transition-colors">Overview</a>
              </li>
              <li>
                <a href="#cloud-providers" className="hover:text-blue-600 transition-colors">AWS &amp; Azure</a>
              </li>
              <li>
                <a href="#containers-iac" className="hover:text-blue-600 transition-colors">Docker &amp; K8s</a>
              </li>
              <li>
                <a href="#intelligence" className="hover:text-blue-600 transition-colors flex items-center justify-between">
                  <span>Intelligence</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">DEV</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Developers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono mb-3">
              Developers
            </h4>
            <ul className="space-y-2 text-slate-600">
              <li>
                <a href="#dev-environment" className="hover:text-blue-600 transition-colors">Toolchain</a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-blue-600 transition-colors">Architecture</a>
              </li>
              <li>
                <a href="https://github.com/TheCaelumOS/caelum-os-frontend" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span>GitHub</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a href="#open-source" className="hover:text-blue-600 transition-colors">Open Source</a>
              </li>
              <li>
                <Link href="/download" className="hover:text-blue-600 transition-colors flex items-center justify-between">
                  <span>ISO Distribution</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">VISION</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono mb-3">
              Company
            </h4>
            <ul className="space-y-2 text-slate-600">
              <li>
                <a href="#what-is-caleumos" className="hover:text-blue-600 transition-colors">About Caleum</a>
              </li>
              <li>
                <a href="#future-os" className="hover:text-blue-600 transition-colors">Native OS Vision</a>
              </li>
              <li>
                <a href="#roadmap" className="hover:text-blue-600 transition-colors">Engineering Roadmap</a>
              </li>
              <li>
                <a href="https://github.com/TheCaelumOS/caelum-os-frontend/issues" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Public Issues</a>
              </li>
            </ul>
          </div>

          {/* Col 6: Stack */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono mb-3">
              Stack
            </h4>
            <ul className="space-y-2 text-slate-600">
              <li>
                <span className="text-slate-700 font-mono">Next.js 14 (Pages)</span>
              </li>
              <li>
                <span className="text-slate-700 font-mono">NestJS 11 Gateway</span>
              </li>
              <li>
                <span className="text-slate-700 font-mono">PostgreSQL + Prisma</span>
              </li>
              <li>
                <span className="text-slate-700 font-mono">Docker &amp; K8s SDK</span>
              </li>
              <li>
                <span className="text-slate-700 font-mono">Terraform CLI</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with Legal & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Caleum. All rights reserved. &bull; Official platform for CaelumOS.
          </div>

          <div className="flex items-center space-x-6">
            <span>TypeScript Open Source</span>
            <span>&bull;</span>
            <a href="https://github.com/TheCaelumOS/caelum-os-frontend" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700">GitHub Repo</a>
            <span>&bull;</span>
            <a href="https://caleum.me/" className="text-blue-600 hover:underline">caleum.me</a>
          </div>
        </div>

      </div>
    </footer>
  );
}