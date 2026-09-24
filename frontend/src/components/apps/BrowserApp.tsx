"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Search,
  Shield,
  Plus,
  X,
  ExternalLink,
  Globe,
  Lock,
  AlertTriangle,
  Copy,
  Check,
  Compass,
  Cpu,
  Server,
  HardDrive,
  Network
} from 'lucide-react';

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  history: string[];
  historyIndex: number;
  type: 'aws' | 'docs' | 'home' | 'web';
  tryEmbedded?: boolean;
}

const INITIAL_TABS: BrowserTab[] = [
  {
    id: 'aws',
    title: 'AWS Console',
    url: 'https://console.aws.amazon.com/ec2/home?region=us-east-1',
    history: ['https://console.aws.amazon.com/ec2/home?region=us-east-1'],
    historyIndex: 0,
    type: 'aws',
  },
  {
    id: 'docs',
    title: 'CaelumOS Docs',
    url: 'https://docs.caelum-os.internal/architecture/overview',
    history: ['https://docs.caelum-os.internal/architecture/overview'],
    historyIndex: 0,
    type: 'docs',
  },
];

function normalizeUrl(input: string): { url: string; title: string; isValid: boolean; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { url: 'about:home', title: 'New Tab', isValid: true };
  }

  const lower = trimmed.toLowerCase();

  // Block dangerous or malicious protocols
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:') ||
    lower.startsWith('vbscript:')
  ) {
    return {
      url: trimmed,
      title: 'Blocked Protocol',
      isValid: false,
      error: 'Security Policy: Only HTTP and HTTPS web protocols are permitted.',
    };
  }

  // Internal about: protocols
  if (lower === 'about:home' || lower === 'about:blank') {
    return {
      url: lower,
      title: lower === 'about:home' ? 'Firefox Start' : 'Blank Page',
      isValid: true,
    };
  }

  // Direct internal docs
  if (lower.includes('docs.caelum-os.internal')) {
    return {
      url: trimmed.startsWith('http') ? trimmed : `https://${trimmed}`,
      title: 'CaelumOS Docs',
      isValid: true,
    };
  }

  // Explicit http:// or https://
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      return { url: trimmed, title: parsed.hostname, isValid: true };
    } catch {
      return { url: trimmed, title: 'Web Destination', isValid: true };
    }
  }

  // Detect domain patterns like github.com, google.com, kubernetes.io, docs.docker.com, localhost:4000
  const isDomainPattern =
    /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(trimmed) ||
    /^localhost(:\d+)?(\/.*)?$/i.test(trimmed) ||
    /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?(\/.*)?$/i.test(trimmed);

  if (isDomainPattern) {
    const isLocal = trimmed.startsWith('localhost') || trimmed.startsWith('127.0.0.1');
    const fullUrl = `${isLocal ? 'http' : 'https'}://${trimmed}`;
    try {
      const parsed = new URL(fullUrl);
      return { url: fullUrl, title: parsed.hostname, isValid: true };
    } catch {
      // Fallback to search query
    }
  }

  // Default to Google search
  return {
    url: `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`,
    title: `${trimmed} - Google Search`,
    isValid: true,
  };
}

export default function BrowserApp() {
  const [tabs, setTabs] = useState<BrowserTab[]>(INITIAL_TABS);
  const [activeTabId, setActiveTabId] = useState<string>('aws');
  const [urlInput, setUrlInput] = useState<string>('https://console.aws.amazon.com/ec2/home?region=us-east-1');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [navError, setNavError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Sync address bar input whenever active tab changes
  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.url === 'about:home' ? '' : activeTab.url);
      setNavError(null);
    }
  }, [activeTabId, activeTab]);

  // Navigate current tab to a given destination
  const navigateCurrentTab = useCallback(
    (destination: string, openRealBrowser = true) => {
      const { url, title, isValid, error } = normalizeUrl(destination);
      if (!isValid) {
        setNavError(error || 'Invalid URL entered');
        return;
      }
      setNavError(null);

      // Open real browser tab when navigating to external web destinations
      if (
        openRealBrowser &&
        (url.startsWith('https://') || url.startsWith('http://')) &&
        !url.includes('docs.caelum-os.internal')
      ) {
        try {
          if (typeof window !== 'undefined') {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        } catch {
          // Handled gracefully if popups are restricted
        }
      }

      setTabs((prev) =>
        prev.map((t) => {
          if (t.id === activeTabId) {
            const nextHistory = t.history.slice(0, t.historyIndex + 1);
            nextHistory.push(url);
            let nextType: BrowserTab['type'] = 'web';
            if (url === 'about:home') nextType = 'home';
            else if (url.includes('docs.caelum-os.internal')) nextType = 'docs';
            else if (url.includes('console.aws.amazon.com')) nextType = 'aws';

            return {
              ...t,
              url,
              title,
              type: nextType,
              history: nextHistory,
              historyIndex: nextHistory.length - 1,
            };
          }
          return t;
        }),
      );
      setUrlInput(url === 'about:home' ? '' : url);
    },
    [activeTabId],
  );

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    navigateCurrentTab(urlInput, true);
  };

  const handleBack = () => {
    if (!activeTab || activeTab.historyIndex <= 0) return;
    const newIndex = activeTab.historyIndex - 1;
    const prevUrl = activeTab.history[newIndex];
    const { title } = normalizeUrl(prevUrl);

    let nextType: BrowserTab['type'] = 'web';
    if (prevUrl === 'about:home') nextType = 'home';
    else if (prevUrl.includes('docs.caelum-os.internal')) nextType = 'docs';
    else if (prevUrl.includes('console.aws.amazon.com')) nextType = 'aws';

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? { ...t, historyIndex: newIndex, url: prevUrl, title, type: nextType }
          : t,
      ),
    );
    setUrlInput(prevUrl === 'about:home' ? '' : prevUrl);
    setNavError(null);
  };

  const handleForward = () => {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return;
    const newIndex = activeTab.historyIndex + 1;
    const nextUrl = activeTab.history[newIndex];
    const { title } = normalizeUrl(nextUrl);

    let nextType: BrowserTab['type'] = 'web';
    if (nextUrl === 'about:home') nextType = 'home';
    else if (nextUrl.includes('docs.caelum-os.internal')) nextType = 'docs';
    else if (nextUrl.includes('console.aws.amazon.com')) nextType = 'aws';

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? { ...t, historyIndex: newIndex, url: nextUrl, title, type: nextType }
          : t,
      ),
    );
    setUrlInput(nextUrl === 'about:home' ? '' : nextUrl);
    setNavError(null);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleHome = () => {
    navigateCurrentTab('about:home', false);
  };

  const handleAddTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: BrowserTab = {
      id: newId,
      title: 'New Tab',
      url: 'about:home',
      history: ['about:home'],
      historyIndex: 0,
      type: 'home',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setUrlInput('');
    setNavError(null);
  };

  const handleCloseTab = (idToClose: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) return; // Keep at least one tab
    const tabIndex = tabs.findIndex((t) => t.id === idToClose);
    const newTabs = tabs.filter((t) => t.id !== idToClose);
    setTabs(newTabs);

    if (activeTabId === idToClose) {
      const nextActive = newTabs[Math.max(0, tabIndex - 1)];
      setActiveTabId(nextActive.id);
      setUrlInput(nextActive.url === 'about:home' ? '' : nextActive.url);
    }
  };

  const copyCurrentUrl = () => {
    if (typeof navigator !== 'undefined' && activeTab?.url) {
      navigator.clipboard.writeText(activeTab.url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const toggleEmbeddedView = () => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId ? { ...t, tryEmbedded: !t.tryEmbedded } : t,
      ),
    );
  };

  const canGoBack = activeTab && activeTab.historyIndex > 0;
  const canGoForward = activeTab && activeTab.historyIndex < activeTab.history.length - 1;
  const isSecure = activeTab && activeTab.url.startsWith('https://');

  return (
    <div className="flex-1 flex flex-col bg-[#f0f0f0] text-slate-800 font-sans h-full select-none">
      {/* 1. Browser Navigation & Tabs Header */}
      <div className="bg-[#dfdbd2] border-b border-[#c1beb5] px-3 pt-2 flex flex-col space-y-1.5 flex-shrink-0">
        {/* Tabs Bar */}
        <div className="flex items-center space-x-1 text-xs overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => {
                  setActiveTabId(tab.id);
                  setUrlInput(tab.url === 'about:home' ? '' : tab.url);
                  setNavError(null);
                }}
                className={`group px-3 py-1.5 rounded-t-lg font-medium flex items-center space-x-1.5 border-t border-x transition-colors cursor-pointer select-none max-w-[200px] shrink-0 ${
                  isActive
                    ? 'bg-[#eae6df] border-[#c1beb5] text-slate-800 font-bold shadow-xs'
                    : 'bg-[#cfcbc2]/50 border-transparent text-slate-600 hover:bg-[#cfcbc2]'
                }`}
              >
                {/* Tab Icon */}
                {tab.type === 'aws' ? (
                  <svg viewBox="0 0 32 32" className="w-3.5 h-3.5 flex-shrink-0">
                    <path
                      fill="#FF9900"
                      d="M25 21.2c-3.1 2.2-7.5 3.3-11.8 3.3-6 0-11-2.2-13.8-5.6-.4-.5 0-1.1.5-.8 4.3 2.3 9.6 3.6 15 3.6 4.4 0 9.2-.9 12.6-2.8.7-.4 1.1.3.4.8z"
                    />
                    <path
                      fill="#FF9900"
                      d="M26 19.4c-.3-.4-1.1-.1-1.5.1-.4.3-.3 1.1.1 1.4.7.4 1.5 1 1.6.4.3-.4-.9-1.5-.9-1.9z"
                    />
                  </svg>
                ) : tab.type === 'docs' ? (
                  <Shield className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                ) : tab.type === 'home' ? (
                  <Compass className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                )}

                <span className="truncate text-xs">{tab.title}</span>

                {/* Close Button */}
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className="p-0.5 rounded-full hover:bg-slate-400/30 text-slate-500 hover:text-slate-800 transition ml-1 cursor-pointer"
                    title="Close tab"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* New Tab Button */}
          <button
            onClick={handleAddTab}
            className="p-1.5 rounded-md hover:bg-[#cfcbc2] text-slate-700 transition cursor-pointer"
            title="Open new tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Navigation / Address Bar */}
        <div className="flex items-center space-x-2 pb-2">
          {/* Navigation Controls */}
          <div className="flex items-center space-x-1 text-slate-600">
            <button
              onClick={handleBack}
              disabled={!canGoBack}
              className={`p-1 rounded transition ${
                canGoBack
                  ? 'hover:bg-slate-350/50 text-slate-700 cursor-pointer'
                  : 'text-slate-400 opacity-40 cursor-not-allowed'
              }`}
              title="Click to go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleForward}
              disabled={!canGoForward}
              className={`p-1 rounded transition ${
                canGoForward
                  ? 'hover:bg-slate-350/50 text-slate-700 cursor-pointer'
                  : 'text-slate-400 opacity-40 cursor-not-allowed'
              }`}
              title="Click to go forward"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleRefresh}
              className="p-1 rounded hover:bg-slate-350/50 text-slate-700 cursor-pointer transition"
              title="Reload current page"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-600' : ''}`} />
            </button>
            <button
              onClick={handleHome}
              className="p-1 rounded hover:bg-slate-350/50 text-slate-700 cursor-pointer transition"
              title="Firefox Home Page"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* URL Input Form */}
          <form
            onSubmit={handleAddressSubmit}
            className="flex-1 bg-white border border-[#c1beb5] rounded-md px-3 py-1 flex items-center space-x-2 text-xs shadow-inner focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-400 transition"
          >
            {isSecure ? (
              <span className="text-emerald-600 font-semibold select-none flex items-center" title="Secure Connection (HTTPS)">
                <Lock className="w-3.5 h-3.5" />
              </span>
            ) : activeTab?.url === 'about:home' ? (
              <Search className="w-3.5 h-3.5 text-slate-400 select-none" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-slate-400 select-none" />
            )}

            <input
              ref={addressInputRef}
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Search with Google or enter address (e.g. github.com, kubernetes.io)"
              className="flex-1 bg-transparent outline-none text-slate-800 placeholder-slate-400 w-full font-sans text-xs select-text"
            />

            {urlInput && (
              <button
                type="submit"
                className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-1.5 py-0.5 rounded font-medium cursor-pointer transition"
              >
                Go
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Navigation Error Notice */}
      {navError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{navError}</span>
          </div>
          <button
            onClick={() => setNavError(null)}
            className="text-red-500 hover:text-red-800 text-[10px] font-bold uppercase cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Web Body Area */}
      <div className="flex-1 bg-white overflow-hidden flex flex-col">
        {activeTab?.type === 'aws' ? (
          /* AWS MANAGEMENT CONSOLE MOCKUP + LIVE PORTAL */
          <div className="flex-1 flex flex-col overflow-hidden text-xs text-slate-800 select-text">
            {/* Top AWS Menu Banner */}
            <div className="h-9 bg-[#232f3e] text-white flex items-center justify-between px-3 select-none flex-shrink-0">
              <div className="flex items-center space-x-4">
                <span className="font-extrabold text-[13px] tracking-tight flex items-center space-x-1">
                  <span className="text-orange-400">aws</span>
                  <span className="text-white/60 font-light text-[10px] ml-1">console</span>
                </span>
                <div className="bg-[#1f2d3d] border border-slate-600 rounded-md px-2.5 py-0.5 flex items-center space-x-2 text-[10px] w-64">
                  <Search className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-400">Search Services...</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-[10px] text-slate-300">
                <a
                  href="https://console.aws.amazon.com/ec2/home?region=us-east-1"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-2 py-0.5 rounded flex items-center space-x-1 cursor-pointer transition"
                >
                  <span>Open Real AWS Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="h-3 w-[1px] bg-slate-600" />
                <span className="font-semibold text-slate-100">CaelumOS-Core (1284-9024)</span>
              </div>
            </div>

            {/* AWS Workspace Area */}
            <div className="flex-1 flex overflow-hidden">
              <div className="w-44 bg-[#f2f2f2] border-r border-slate-200 flex flex-col p-2.5 space-y-1.5 select-none flex-shrink-0">
                <span className="font-bold text-[10px] text-slate-500 uppercase tracking-widest px-2 mb-1.5">
                  EC2 Dashboard
                </span>
                <span className="px-2 py-1 bg-slate-300/40 rounded font-semibold text-slate-900 border-l-2 border-orange-500">
                  EC2 Home
                </span>
                <span className="px-2 py-1 hover:bg-slate-200 rounded text-slate-700 cursor-pointer">
                  Instances (Running)
                </span>
                <span className="px-2 py-1 hover:bg-slate-200 rounded text-slate-700 cursor-pointer">
                  Security Groups
                </span>
                <span className="px-2 py-1 hover:bg-slate-200 rounded text-slate-700 cursor-pointer">
                  Load Balancers
                </span>
                <span className="px-2 py-1 hover:bg-slate-200 rounded text-slate-700 cursor-pointer">
                  Target Groups
                </span>
              </div>

              <div className="flex-1 p-5 overflow-y-auto bg-slate-50 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h2 className="text-sm font-bold text-slate-900">EC2 Resource Summary (us-east-1)</h2>
                  <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase">
                    All Services Operational
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Running Instances</span>
                      <Server className="w-4 h-4 text-orange-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-950">3 / 4</p>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                      Healthy
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Volume Snapshots</span>
                      <HardDrive className="w-4 h-4 text-orange-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-950">12</p>
                    <span className="text-[9px] text-slate-400">AWS-GP3 Storage</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Security Groups</span>
                      <Shield className="w-4 h-4 text-orange-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-950">5 Active</p>
                    <span className="text-[9px] text-purple-600 font-semibold uppercase">IAM Guard Active</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Elastic Load Balancers</span>
                      <Network className="w-4 h-4 text-orange-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-950">1 Online</p>
                    <span className="text-[9px] text-emerald-600 font-semibold uppercase flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                      ALB Active
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900">CloudWatch Alarms Active</h4>
                    <p className="text-slate-500 text-[11px]">
                      No active metrics alarms currently violating configuration thresholds.
                    </p>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200 font-bold">
                    0 ALARMS
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab?.type === 'docs' ? (
          /* CAELUM OS DOCUMENTATION */
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50 text-slate-800 leading-relaxed max-w-3xl mx-auto space-y-6 select-text text-[11px] sm:text-xs">
            <div className="border-b border-slate-200 pb-3 space-y-1">
              <span className="text-purple-600 font-bold uppercase tracking-wider text-[9px]">
                CaelumOS Core Architecture
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-950">AI Orchestrator Overview</h1>
            </div>

            <div className="space-y-3.5">
              <p>
                Welcome to the official internal documentation for <strong>CaelumOS</strong>: the specialized Web
                Desktop Operating System configured specifically to manage massive, multi-cloud clusters and AI agent
                deployment pipelines.
              </p>

              <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-xl p-4 space-y-1 text-slate-700">
                <h4 className="font-bold text-purple-950 text-xs">Core Paradigm</h4>
                <p className="text-[10px]">
                  CaelumOS replaces complex infrastructure dashboard navigation with a unified Web Desktop interface,
                  wrapping interactive shells (AI Terminal) and Terraform metrics directly inside lightweight Gnome
                  window frames.
                </p>
              </div>

              <h3 className="text-xs font-bold text-slate-950 pt-2 border-b border-slate-100 pb-1 flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 text-purple-600" />
                <span>AI Terminal Integration Protocol</span>
              </h3>
              <p>
                Every deployment command issued inside the AI Terminal (e.g.{' '}
                <code>deploy AWS microservice cluster</code>) triggers a background task query mapping to CaelumOS
                state. The AI core interprets the prompt, designs infrastructure configs, and streams compiling
                Terraform scripts directly on your screen.
              </p>
            </div>
          </div>
        ) : activeTab?.type === 'home' ? (
          /* FIREFOX START / HOME PAGE */
          <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800">
            <div className="max-w-xl w-full flex flex-col items-center text-center space-y-6">
              {/* Firefox / CaelumOS Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center shadow-lg text-white font-black text-xl">
                  🦊
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">Firefox Web Browser</h1>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">CaelumOS Desktop Edition</span>
                </div>
              </div>

              {/* Centered Search Bar */}
              <form
                onSubmit={handleAddressSubmit}
                className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 shadow-md flex items-center space-x-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Search the web or enter URL..."
                  className="flex-1 outline-none text-xs text-slate-800 placeholder-slate-400 font-sans"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3 py-1.5 rounded-xl cursor-pointer transition shadow-xs"
                >
                  Search
                </button>
              </form>

              {/* Quick Sites Shortcuts */}
              <div className="w-full space-y-3 text-left">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Top Sites & Bookmarks
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {[
                    { name: 'GitHub', url: 'https://github.com', icon: '🐙' },
                    { name: 'Google', url: 'https://www.google.com', icon: '🔍' },
                    { name: 'Kubernetes', url: 'https://kubernetes.io', icon: '☸️' },
                    { name: 'Docker Docs', url: 'https://docs.docker.com', icon: '🐳' },
                    { name: 'AWS Console', url: 'https://console.aws.amazon.com', icon: '☁️' },
                    { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '🥞' },
                    { name: 'CaelumOS Docs', url: 'https://docs.caelum-os.internal/architecture/overview', icon: '🛡️' },
                  ].map((site) => (
                    <button
                      key={site.name}
                      onClick={() => navigateCurrentTab(site.url, true)}
                      className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center space-y-1.5 transition shadow-xs hover:shadow-sm cursor-pointer group"
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">{site.icon}</span>
                      <span className="text-[11px] font-semibold text-slate-700 group-hover:text-blue-600 truncate max-w-full">
                        {site.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* REAL WEB DESTINATION VIEW */
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {/* Top Navigation Status Bar */}
            <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs flex-shrink-0">
              <div className="flex items-center space-x-2.5 truncate">
                <span className="flex items-center text-emerald-600 font-semibold text-[11px]">
                  <Lock className="w-3.5 h-3.5 mr-1" />
                  TLS Encrypted
                </span>
                <span className="h-3 w-[1px] bg-slate-200" />
                <span className="font-semibold text-slate-900 truncate">
                  {(() => {
                    try {
                      return new URL(activeTab.url).hostname;
                    } catch {
                      return activeTab.url;
                    }
                  })()}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={copyCurrentUrl}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-[11px] flex items-center space-x-1 cursor-pointer transition border border-slate-200"
                  title="Copy URL to clipboard"
                >
                  {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                </button>

                <button
                  onClick={toggleEmbeddedView}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-[11px] flex items-center space-x-1 cursor-pointer transition border border-slate-200"
                  title="Toggle sandbox preview"
                >
                  <Globe className="w-3 h-3 text-blue-600" />
                  <span>{activeTab?.tryEmbedded ? 'Hide Sandbox' : 'Try Sandbox Frame'}</span>
                </button>

                <a
                  href={activeTab.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium text-[11px] flex items-center space-x-1 cursor-pointer transition shadow-xs"
                >
                  <span>Open in Real Browser Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Content Area: Embedded Frame OR Live Destination Portal Card */}
            {activeTab?.tryEmbedded ? (
              <div className="flex-1 flex flex-col relative bg-white">
                <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5 text-[11px] text-amber-800 flex items-center justify-between">
                  <span>
                    <strong>Sandbox Preview:</strong> External sites with <code>X-Frame-Options: SAMEORIGIN</code> (e.g. GitHub, Google) may block frame embedding. If the page appears blank, click <strong>Open in Real Browser Tab</strong> above.
                  </span>
                  <button
                    onClick={toggleEmbeddedView}
                    className="text-amber-900 font-bold hover:underline cursor-pointer ml-2"
                  >
                    Close
                  </button>
                </div>
                <iframe
                  src={activeTab.url}
                  title={activeTab.title}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  className="w-full flex-1 border-0"
                />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
                <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-inner text-2xl">
                    🌐
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-slate-900">
                      {(() => {
                        try {
                          return new URL(activeTab.url).hostname;
                        } catch {
                          return 'Web Destination';
                        }
                      })()}
                    </h2>
                    <p className="text-xs text-slate-500 break-all font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 select-all">
                      {activeTab.url}
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-left space-y-1 text-xs">
                    <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Security & Integrity Verified</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-normal">
                      Target destination validated. You can browse this site live in your primary browser tab, or attempt an embedded sandbox preview.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <a
                      href={activeTab.url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      <span>Open Live Website in Browser Tab</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={toggleEmbeddedView}
                      className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer border border-slate-200"
                    >
                      <Globe className="w-3.5 h-3.5 text-slate-600" />
                      <span>Try Embedded Sandbox Preview</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
