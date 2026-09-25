"use client";

import React, { useState } from 'react';
import { 
  Boxes, 
  Search, 
  Download, 
  Check, 
  Star, 
  ShieldCheck, 
  Settings2,
  Filter
} from 'lucide-react';
import { ExtensionItem } from './types';

export default function VSCodeExtensions() {
  const [searchQuery, setSearchQuery] = useState('');

  const [extensions, setExtensions] = useState<ExtensionItem[]>([
    {
      id: 'ms-python.python',
      name: 'Python',
      displayName: 'Python',
      version: 'v2026.4.1',
      publisher: 'Microsoft',
      description: 'IntelliSense, linting, debugging, code navigation, code formatting for Python.',
      icon: '🐍',
      installed: true,
      downloads: '108.4M',
      rating: 4.8,
    },
    {
      id: 'ms-azuretools.vscode-docker',
      name: 'Docker',
      displayName: 'Docker',
      version: 'v1.29.0',
      publisher: 'Microsoft',
      description: 'Makes it easy to create, manage, and debug containerized applications directly in CaelumOS.',
      icon: '🐳',
      installed: true,
      downloads: '32.1M',
      rating: 4.7,
    },
    {
      id: 'ms-kubernetes-tools.vscode-kubernetes-tools',
      name: 'Kubernetes',
      displayName: 'Kubernetes',
      version: 'v1.3.15',
      publisher: 'Microsoft',
      description: 'Develop, deploy and debug Kubernetes applications with real cluster synchronization.',
      icon: '☸️',
      installed: true,
      downloads: '8.9M',
      rating: 4.6,
    },
    {
      id: 'hashicorp.terraform',
      name: 'Terraform',
      displayName: 'HashiCorp Terraform',
      version: 'v2.30.0',
      publisher: 'HashiCorp',
      description: 'Syntax highlighting and autocompletion for Terraform HCL configuration files.',
      icon: '📐',
      installed: true,
      downloads: '6.4M',
      rating: 4.5,
    },
    {
      id: 'caelum.ai-copilot',
      name: 'Caelum Copilot',
      displayName: 'Caelum AI Copilot',
      version: 'v3.0.0',
      publisher: 'CaelumOS',
      description: 'Native operating-system level AI pair programmer and infra-code generator.',
      icon: '✨',
      installed: true,
      downloads: '1.2M',
      rating: 5.0,
    },
    {
      id: 'esbenp.prettier-vscode',
      name: 'Prettier',
      displayName: 'Prettier - Code Formatter',
      version: 'v10.1.0',
      publisher: 'Prettier',
      description: 'Code formatter using prettier for JS, TS, HTML, CSS, JSON, Markdown, YAML.',
      icon: '💅',
      installed: true,
      downloads: '45.3M',
      rating: 4.7,
    },
    {
      id: 'dbaeumer.vscode-eslint',
      name: 'ESLint',
      displayName: 'ESLint',
      version: 'v3.0.8',
      publisher: 'Microsoft',
      description: 'Integrates ESLint into VS Code to detect bugs and style violations.',
      icon: '⚡',
      installed: true,
      downloads: '38.6M',
      rating: 4.6,
    },
    {
      id: 'bradlc.vscode-tailwindcss',
      name: 'Tailwind CSS',
      displayName: 'Tailwind CSS IntelliSense',
      version: 'v0.12.0',
      publisher: 'Tailwind Labs',
      description: 'Intelligent Tailwind CSS tooling for VS Code with class autocomplete and hover preview.',
      icon: '🎨',
      installed: false,
      downloads: '16.8M',
      rating: 4.9,
    },
  ]);

  const toggleInstall = (id: string) => {
    setExtensions(prev =>
      prev.map(ext => (ext.id === id ? { ...ext, installed: !ext.installed } : ext))
    );
  };

  const filtered = extensions.filter(ext =>
    ext.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ext.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ext.publisher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#252526] text-[#cccccc] select-none text-xs">
      {/* Header */}
      <div className="p-3 border-b border-[#1e1e1e] flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Boxes className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
            Extensions
          </span>
        </div>
        <button
          onClick={() => {}}
          className="p-1 hover:text-white hover:bg-[#333333] rounded transition-colors text-neutral-400"
          title="Filter Extensions"
        >
          <Filter className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-[#1e1e1e]">
        <div className="relative flex items-center bg-[#3c3c3c] border border-[#3c3c3c] focus-within:border-[#007acc] rounded">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Extensions in Marketplace..."
            className="w-full bg-transparent px-2.5 py-1.5 text-xs text-white outline-none font-mono placeholder:text-neutral-500"
          />
        </div>
      </div>

      {/* Extension List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1e1e1e]">
        {filtered.map((ext) => (
          <div
            key={ext.id}
            className="p-3 hover:bg-[#2a2d2e] transition-colors flex items-start space-x-3 group"
          >
            {/* Icon */}
            <div className="w-9 h-9 rounded-lg bg-[#333333] flex items-center justify-center text-lg flex-shrink-0 border border-neutral-700/60 shadow-xs">
              {ext.icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white truncate text-xs">
                  {ext.displayName}
                </span>
              </div>

              <div className="text-[11px] text-neutral-400 font-mono flex items-center space-x-2 mt-0.5">
                <span>{ext.publisher}</span>
                <span>•</span>
                <span className="flex items-center space-x-0.5 text-amber-400">
                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                  <span>{ext.rating}</span>
                </span>
                <span>•</span>
                <span className="text-neutral-500">{ext.downloads}</span>
              </div>

              <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                {ext.description}
              </p>

              {/* Install button */}
              <div className="mt-2.5 flex items-center space-x-2">
                <button
                  onClick={() => toggleInstall(ext.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
                    ext.installed
                      ? 'bg-[#333333] text-neutral-300 hover:bg-[#444444]'
                      : 'bg-[#007acc] text-white hover:bg-[#0062a3]'
                  }`}
                >
                  {ext.installed ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Installed</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3" />
                      <span>Install</span>
                    </>
                  )}
                </button>

                {ext.installed && (
                  <button
                    className="p-1 text-neutral-500 hover:text-white rounded hover:bg-[#3c3c3c] transition-colors"
                    title="Configure Extension"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
