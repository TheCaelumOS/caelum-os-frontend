'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Terminal, 
  Layers, 
  ShieldCheck, 
  FileText, 
  Copy, 
  Check, 
  ArrowRight
} from 'lucide-react';
import { GithubLogo } from './Logos';

export default function DocsSection() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const docTabs = [
    {
      id: "quickstart",
      title: "Host Daemons & Setup",
      badge: "Local Engine",
      description: "How CaelumOS coordinates directly with local development runtimes on your host machine.",
      code: `# 1. Verify your local Docker daemon is operational
docker --version
docker info

# 2. Check local Terraform / OpenTofu binary
terraform version

# 3. Configure local credentials for AWS and Azure
aws sts get-caller-identity
az account show

# 4. CaelumOS connects to local named pipes & sockets natively:
# Windows: //./pipe/dockerDesktopLinuxEngine
# Linux/macOS: /var/run/docker.sock`,
      notes: [
        "Zero mock sandboxes — connects directly to your active host daemon.",
        "Automatic discovery of Azure subscriptions and AWS STS caller identity.",
        "Isolated workspace directories prevent Terraform statefile collisions."
      ]
    },
    {
      id: "bootable",
      title: "Bootable OS Specifications",
      badge: "Kernel & ISO",
      description: "Target architecture and hardware specifications for the future standalone bootable OS release.",
      code: `System Architecture:   x86_64 (AMD64) & aarch64 (ARM64 / Apple Silicon)
Kernel Base:           Minimal Immutable Linux LTS (6.x) with custom PTY drivers
Boot Standard:         UEFI 64-bit with Secure Boot support
Container Engine:      Embedded Containerd / OCI Runtime Supervisor
IaC Provisioner:       Pre-compiled Terraform & OpenTofu engine
Memory Requirement:    Minimum 4 GB RAM (8 GB Recommended)
Storage Target:        Minimum 20 GB NVMe / SSD / Live USB 3.0+`,
      notes: [
        "Purpose-built compositor eliminating all desktop background bloat.",
        "Pre-bundled CLI toolchains: git, curl, jq, docker, terraform, kubectl.",
        "Air-gapped and local-first runtime with zero telemetry backdoors."
      ]
    },
    {
      id: "security",
      title: "Security & Credential Isolation",
      badge: "Local-First",
      description: "Strict isolation principles governing secrets, cloud tokens, and system calls.",
      code: `// CaelumOS Local-First Credential Resolution:
// 1. Never sends AWS/Azure secret keys to any external SaaS backend.
// 2. Local backend processes communicate exclusively over localhost:4000.
// 3. Sensitive HCL state files (.tfstate) stay inside local sandboxes.
// 4. Container standard streams (stdout/stderr) are piped over local WebSockets.

const credentialPolicy = {
  telemetry: "disabled",
  cloudKeysRemoteUpload: "blocked",
  hostSocketAccess: "loopback-only",
  stateEncryption: "AES-256-GCM"
};`,
      notes: [
        "Host credentials remain in their native system keyrings (~/.aws, ~/.azure).",
        "No middleman servers between your workstation and your infrastructure.",
        "Auditable open-source codebase licensed under Apache 2.0."
      ]
    }
  ];

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section id="docs" className="py-24 bg-slate-50/70 border-b border-slate-200 scroll-mt-16 relative" aria-labelledby="docs-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-bold text-blue-700 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Developer Documentation</span>
          </div>

          <h2 id="docs-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Architecture & Documentation
          </h2>

          <p className="text-slate-600 text-base leading-relaxed">
            Transparent technical documentation. Learn how CaelumOS bridges host container daemons, coordinates infrastructure-as-code, and prepares for bootable bare-metal releases.
          </p>
        </div>

        {/* Documentation Hub Tabs & Code Viewer */}
        <div className="mt-12 max-w-5xl mx-auto rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          
          {/* Tab Bar */}
          <div className="flex flex-wrap border-b border-slate-200 bg-slate-50/60">
            {docTabs.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(idx)}
                className={`flex-1 min-w-[200px] px-6 py-4 text-xs font-mono font-semibold flex items-center justify-between transition-colors border-b-2 ${
                  activeTab === idx
                    ? 'border-blue-600 text-slate-900 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <FileText className={`w-4 h-4 ${activeTab === idx ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{tab.title}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-mono ${
                  activeTab === idx 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'bg-slate-200/70 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Active Tab Content */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-mono flex items-center gap-2">
                  <span>{docTabs[activeTab].title}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  {docTabs[activeTab].description}
                </p>
              </div>

              <button
                onClick={() => handleCopy(docTabs[activeTab].code, activeTab)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors w-fit shadow-xs"
              >
                {copiedIndex === activeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Block - High contrast dark terminal */}
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 sm:p-5 font-mono text-xs text-cyan-300/95 overflow-x-auto leading-relaxed shadow-inner">
              <pre className="whitespace-pre">{docTabs[activeTab].code}</pre>
            </div>

            {/* Key Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {docTabs[activeTab].notes.map((note, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-mono flex items-start space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer of Doc Hub */}
          <div className="bg-slate-50/80 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-600">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Full documentation repository published on GitHub</span>
            </span>

            <a
              href="https://github.com/TheCaelumOS/caelum-os-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              <GithubLogo className="w-3.5 h-3.5" />
              <span>View Source Docs on GitHub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
