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
  Network,
  BookOpen,
  Eye,
  RefreshCw,
  ShieldCheck,
  Terminal as TerminalIcon,
  Layers,
  Code2
} from 'lucide-react';
import { 
  FirefoxLogo, 
  AwsLogo, 
  DockerLogo, 
  KubernetesLogo, 
  GithubLogo, 
  YoutubeLogo, 
  GoogleLogo 
} from '../icons/RealBrandLogos';

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  renderedUrl: string;
  history: string[];
  historyIndex: number;
  type: 'home' | 'web' | 'youtube' | 'docs' | 'aws';
  canEmbed: boolean;
  blockReason?: string | null;
  isLoading?: boolean;
  readerMode?: boolean;
  readerContent?: { title: string; htmlPreview: string } | null;
}

interface BrowserAppProps {
  onOpenApp?: (appId: string) => void;
}

const INITIAL_TABS: BrowserTab[] = [
  {
    id: 'tab-youtube',
    title: 'YouTube',
    url: 'https://www.youtube.com',
    renderedUrl: 'https://www.youtube-nocookie.com/embed?listType=search&list=trending',
    history: ['https://www.youtube.com'],
    historyIndex: 0,
    type: 'youtube',
    canEmbed: true,
  },
  {
    id: 'tab-google',
    title: 'Google - Web Search',
    url: 'https://www.bing.com/search?q=Google',
    renderedUrl: 'https://www.bing.com/search?q=Google',
    history: ['https://www.bing.com/search?q=Google'],
    historyIndex: 0,
    type: 'web',
    canEmbed: true,
  },
  {
    id: 'tab-github',
    title: 'GitHub: Let’s build from here',
    url: 'https://github.com',
    renderedUrl: 'https://github.com',
    history: ['https://github.com'],
    historyIndex: 0,
    type: 'web',
    canEmbed: false,
    blockReason: 'X-Frame-Options: DENY restricts third-party embedding',
  },
  {
    id: 'tab-docs',
    title: 'CaelumOS Docs',
    url: 'https://docs.caelum-os.internal/architecture/overview',
    renderedUrl: 'https://docs.caelum-os.internal/architecture/overview',
    history: ['https://docs.caelum-os.internal/architecture/overview'],
    historyIndex: 0,
    type: 'docs',
    canEmbed: true,
  },
];

/**
 * Normalizes user input from address bar:
 * - Direct YouTube mapping -> YouTube Embed surface
 * - Known frame-restricted sites -> marked with canEmbed: false
 * - Search queries -> In-OS Web Search engine (Bing Search)
 * - Direct URLs -> embedded directly
 */
function normalizeDestination(input: string): {
  url: string;
  renderedUrl: string;
  title: string;
  type: BrowserTab['type'];
  canEmbed: boolean;
  blockReason?: string | null;
  isValid: boolean;
  error?: string;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      url: 'about:home',
      renderedUrl: 'about:home',
      title: 'New Tab',
      type: 'home',
      canEmbed: true,
      isValid: true,
    };
  }

  const lower = trimmed.toLowerCase();

  // Block dangerous script protocols
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:') ||
    lower.startsWith('vbscript:')
  ) {
    return {
      url: trimmed,
      renderedUrl: 'about:blank',
      title: 'Blocked Protocol',
      type: 'web',
      canEmbed: false,
      blockReason: 'Security Policy: Protocol blocked by CaelumOS sandbox.',
      isValid: false,
      error: 'Security Policy: Only HTTP, HTTPS, and internal protocols are permitted.',
    };
  }

  // Internal about: protocols
  if (lower === 'about:home' || lower === 'about:blank' || lower === 'home') {
    return {
      url: 'about:home',
      renderedUrl: 'about:home',
      title: 'Firefox Start',
      type: 'home',
      canEmbed: true,
      isValid: true,
    };
  }

  // Internal CaelumOS architecture documentation
  if (lower.includes('docs.caelum-os.internal') || lower === 'docs' || lower === 'caelumos docs') {
    return {
      url: 'https://docs.caelum-os.internal/architecture/overview',
      renderedUrl: 'https://docs.caelum-os.internal/architecture/overview',
      title: 'CaelumOS Docs',
      type: 'docs',
      canEmbed: true,
      isValid: true,
    };
  }

  // AWS Console Tab
  if (lower.includes('console.aws.amazon.com') || lower === 'aws console' || lower === 'aws') {
    return {
      url: 'https://console.aws.amazon.com/ec2/home?region=us-east-1',
      renderedUrl: 'https://console.aws.amazon.com/ec2/home?region=us-east-1',
      title: 'AWS Management Console',
      type: 'aws',
      canEmbed: true,
      isValid: true,
    };
  }

  // YouTube Intelligent Handling:
  // Maps directly to in-OS YouTube player / trending search embed surface so it renders inside CaelumOS!
  if (
    lower === 'youtube' ||
    lower === 'youtube.com' ||
    lower === 'www.youtube.com' ||
    lower === 'https://youtube.com' ||
    lower === 'https://www.youtube.com' ||
    lower === 'http://youtube.com' ||
    lower === 'http://www.youtube.com'
  ) {
    return {
      url: 'https://www.youtube.com',
      renderedUrl: 'https://www.youtube-nocookie.com/embed?listType=search&list=trending',
      title: 'YouTube',
      type: 'youtube',
      canEmbed: true,
      isValid: true,
    };
  }

  // YouTube specific video watch URL
  const ytVideoMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytVideoMatch && ytVideoMatch[1]) {
    const videoId = ytVideoMatch[1];
    return {
      url: trimmed,
      renderedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`,
      title: 'YouTube Video',
      type: 'youtube',
      canEmbed: true,
      isValid: true,
    };
  }

  // YouTube search query (e.g. "youtube lofi music")
  if (lower.startsWith('youtube ') || lower.startsWith('yt ')) {
    const query = trimmed.replace(/^(youtube|yt)\s+/i, '').trim();
    return {
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      renderedUrl: `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(query)}`,
      title: `${query} - YouTube`,
      type: 'youtube',
      canEmbed: true,
      isValid: true,
    };
  }

  // Explicit URL check (http:// or https://)
  const hasHttpPrefix = /^https?:\/\//i.test(trimmed);
  const isDomainPattern =
    /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(trimmed) ||
    /^localhost(:\d+)?(\/.*)?$/i.test(trimmed) ||
    /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?(\/.*)?$/i.test(trimmed);

  if (hasHttpPrefix || isDomainPattern) {
    const fullUrl = hasHttpPrefix ? trimmed : `https://${trimmed}`;
    try {
      const parsed = new URL(fullUrl);
      const host = parsed.hostname.toLowerCase();

      // Check known domains with strict X-Frame-Options or frame-ancestors
      if (host === 'github.com' || host === 'gist.github.com') {
        return {
          url: fullUrl,
          renderedUrl: fullUrl,
          title: 'GitHub: Let’s build from here',
          type: 'web',
          canEmbed: false,
          blockReason: 'X-Frame-Options: DENY restricts third-party embedding',
          isValid: true,
        };
      }

      if (host === 'google.com' || host === 'www.google.com') {
        // If navigating to root google.com, provide the in-OS search engine directly
        return {
          url: 'https://www.google.com',
          renderedUrl: 'https://www.bing.com/search?q=Google',
          title: 'Google - Web Search',
          type: 'web',
          canEmbed: true,
          isValid: true,
        };
      }

      return {
        url: fullUrl,
        renderedUrl: fullUrl,
        title: parsed.hostname,
        type: 'web',
        canEmbed: true,
        isValid: true,
      };
    } catch {
      // Fallback to search query
    }
  }

  // Normal Search Query:
  // Render via configured in-OS Search Engine (Bing Search) which loads live inside the tab!
  return {
    url: `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}`,
    renderedUrl: `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}`,
    title: `${trimmed} - Web Search`,
    type: 'web',
    canEmbed: true,
    isValid: true,
  };
}

export default function BrowserApp({ onOpenApp }: BrowserAppProps) {
  const [tabs, setTabs] = useState<BrowserTab[]>(INITIAL_TABS);
  const [activeTabId, setActiveTabId] = useState<string>('tab-youtube');
  const [urlInput, setUrlInput] = useState<string>('https://www.youtube.com');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [navError, setNavError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [runtimeStatus, setRuntimeStatus] = useState<{ connected: boolean; engine?: string }>({ connected: false });
  const addressInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // 1. Detect CaelumOS Local Browser Runtime on mount
  useEffect(() => {
    let mounted = true;
    const detectRuntime = async () => {
      try {
        const res = await fetch('http://127.0.0.1:48721/browser/status');
        if (res.ok && mounted) {
          const data = await res.json();
          setRuntimeStatus({ connected: true, engine: data.engine || 'Chromium Headless' });
        }
      } catch {
        if (mounted) {
          setRuntimeStatus({ connected: false });
        }
      }
    };
    detectRuntime();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Sync Address Bar whenever active tab changes
  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.url === 'about:home' ? '' : activeTab.url);
      setNavError(null);
    }
  }, [activeTabId, activeTab]);

  // 3. Optional Local Runtime header inspection for enhanced accuracy
  const inspectWithRuntime = useCallback(async (tabId: string, targetUrl: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:48721/browser/inspect?url=${encodeURIComponent(targetUrl)}`);
      if (res.ok) {
        const data = await res.json();
        setTabs((prev) =>
          prev.map((t) => {
            if (t.id === tabId && t.url === targetUrl) {
              return {
                ...t,
                canEmbed: data.canEmbed !== false,
                blockReason: data.blockReason || null,
                title: data.title || t.title,
                isLoading: false,
              };
            }
            return t;
          }),
        );
      }
    } catch {
      // Local runtime not active; heuristic fallback is already in place
    }
  }, []);

  // 4. Primary In-OS Tab Navigation - NEVER LEAVES CaelumOS!
  const navigateCurrentTab = useCallback(
    (destination: string) => {
      const norm = normalizeDestination(destination);
      if (!norm.isValid) {
        setNavError(norm.error || 'Invalid destination entered');
        return;
      }
      setNavError(null);

      const targetTabId = activeTabId;

      setTabs((prev) =>
        prev.map((t) => {
          if (t.id === targetTabId) {
            const nextHistory = t.history.slice(0, t.historyIndex + 1);
            nextHistory.push(norm.url);

            return {
              ...t,
              url: norm.url,
              renderedUrl: norm.renderedUrl,
              title: norm.title,
              type: norm.type,
              canEmbed: norm.canEmbed,
              blockReason: norm.blockReason || null,
              history: nextHistory,
              historyIndex: nextHistory.length - 1,
              isLoading: norm.canEmbed && norm.type === 'web',
              readerMode: false,
              readerContent: null,
            };
          }
          return t;
        }),
      );

      setUrlInput(norm.url === 'about:home' ? '' : norm.url);

      // Trigger background runtime verification if connected
      if (runtimeStatus.connected && norm.type === 'web' && norm.canEmbed) {
        inspectWithRuntime(targetTabId, norm.url);
      }
    },
    [activeTabId, runtimeStatus.connected, inspectWithRuntime],
  );

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    navigateCurrentTab(urlInput);
  };

  const handleBack = useCallback(() => {
    if (!activeTab || activeTab.historyIndex <= 0) return;
    const newIndex = activeTab.historyIndex - 1;
    const prevUrl = activeTab.history[newIndex];
    const norm = normalizeDestination(prevUrl);

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              historyIndex: newIndex,
              url: prevUrl,
              renderedUrl: norm.renderedUrl,
              title: norm.title,
              type: norm.type,
              canEmbed: norm.canEmbed,
              blockReason: norm.blockReason || null,
              readerMode: false,
              readerContent: null,
            }
          : t,
      ),
    );
    setUrlInput(prevUrl === 'about:home' ? '' : prevUrl);
    setNavError(null);
  }, [activeTab, activeTabId]);

  const handleForward = useCallback(() => {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return;
    const newIndex = activeTab.historyIndex + 1;
    const nextUrl = activeTab.history[newIndex];
    const norm = normalizeDestination(nextUrl);

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              historyIndex: newIndex,
              url: nextUrl,
              renderedUrl: norm.renderedUrl,
              title: norm.title,
              type: norm.type,
              canEmbed: norm.canEmbed,
              blockReason: norm.blockReason || null,
              readerMode: false,
              readerContent: null,
            }
          : t,
      ),
    );
    setUrlInput(nextUrl === 'about:home' ? '' : nextUrl);
    setNavError(null);
  }, [activeTab, activeTabId]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Force iframe reload by momentarily toggling renderedUrl
    const current = activeTab?.renderedUrl;
    if (current && activeTab?.canEmbed) {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, renderedUrl: '', isLoading: true } : t)),
      );
      setTimeout(() => {
        setTabs((prev) =>
          prev.map((t) => (t.id === activeTabId ? { ...t, renderedUrl: current, isLoading: false } : t)),
        );
        setIsRefreshing(false);
      }, 150);
    } else {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  }, [activeTab, activeTabId]);

  const handleHome = useCallback(() => {
    navigateCurrentTab('about:home');
  }, [navigateCurrentTab]);

  const handleAddTab = useCallback(() => {
    const newId = `tab-${Date.now()}`;
    const newTab: BrowserTab = {
      id: newId,
      title: 'New Tab',
      url: 'about:home',
      renderedUrl: 'about:home',
      history: ['about:home'],
      historyIndex: 0,
      type: 'home',
      canEmbed: true,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setUrlInput('');
    setNavError(null);
    setTimeout(() => {
      addressInputRef.current?.focus();
      addressInputRef.current?.select();
    }, 50);
  }, []);

  const handleCloseTab = useCallback(
    (idToClose: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      if (tabs.length <= 1) {
        // If closing only tab, reset to clean home page
        const resetTab: BrowserTab = {
          id: `tab-${Date.now()}`,
          title: 'New Tab',
          url: 'about:home',
          renderedUrl: 'about:home',
          history: ['about:home'],
          historyIndex: 0,
          type: 'home',
          canEmbed: true,
        };
        setTabs([resetTab]);
        setActiveTabId(resetTab.id);
        setUrlInput('');
        return;
      }

      const tabIndex = tabs.findIndex((t) => t.id === idToClose);
      const newTabs = tabs.filter((t) => t.id !== idToClose);
      setTabs(newTabs);

      if (activeTabId === idToClose) {
        const nextActive = newTabs[Math.max(0, tabIndex - 1)];
        setActiveTabId(nextActive.id);
        setUrlInput(nextActive.url === 'about:home' ? '' : nextActive.url);
      }
    },
    [tabs, activeTabId],
  );

  // 5. Global Keyboard Shortcuts: Ctrl+L, Ctrl+T, Ctrl+W, Ctrl+R, Alt+Left, Alt+Right
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        addressInputRef.current?.focus();
        addressInputRef.current?.select();
      } else if (cmdOrCtrl && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        handleAddTab();
      } else if (cmdOrCtrl && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        handleCloseTab(activeTabId);
      } else if (cmdOrCtrl && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        handleRefresh();
      } else if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBack();
      } else if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        handleForward();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAddTab, handleCloseTab, handleRefresh, handleBack, handleForward, activeTabId]);

  // Fetch Reader View for blocked pages
  const handleFetchReader = async (tab: BrowserTab) => {
    try {
      const res = await fetch(`http://127.0.0.1:48721/browser/reader?url=${encodeURIComponent(tab.url)}`);
      if (res.ok) {
        const data = await res.json();
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tab.id
              ? {
                  ...t,
                  readerMode: true,
                  readerContent: { title: data.title || tab.title, htmlPreview: data.htmlPreview || '' },
                }
              : t,
          ),
        );
      }
    } catch {
      // Reader service offline
    }
  };

  const copyCurrentUrl = () => {
    if (typeof navigator !== 'undefined' && activeTab?.url) {
      navigator.clipboard.writeText(activeTab.url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  // Explicit User Action: ONLY executed if the user explicitly clicks the fallback button
  const handleOpenExplicitExternal = (targetUrl: string) => {
    try {
      if (typeof window !== 'undefined') {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      // Handled gracefully
    }
  };

  const canGoBack = activeTab && activeTab.historyIndex > 0;
  const canGoForward = activeTab && activeTab.historyIndex < activeTab.history.length - 1;
  const isSecure = activeTab && activeTab.url.startsWith('https://');

  // Render appropriate tab favicon / mark
  const renderTabIcon = (tab: BrowserTab) => {
    if (tab.type === 'youtube') return <YoutubeLogo className="w-3.5 h-3.5 flex-shrink-0" />;
    if (tab.type === 'aws') return <AwsLogo className="w-3.5 h-3.5 flex-shrink-0" />;
    if (tab.type === 'docs') {
      return (
        <img
          src="/branding/caelumos-icon.png"
          alt="CaelumOS"
          className="w-3.5 h-3.5 rounded object-contain flex-shrink-0"
        />
      );
    }
    if (tab.type === 'home') return <Compass className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />;
    if (tab.url.includes('github.com')) return <GithubLogo className="w-3.5 h-3.5 flex-shrink-0 text-slate-800" />;
    if (tab.url.includes('google.com') || tab.title.toLowerCase().includes('google')) {
      return <GoogleLogo className="w-3.5 h-3.5 flex-shrink-0" />;
    }
    return <Globe className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />;
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col bg-[#f0f0f0] text-slate-800 font-sans h-full select-none outline-none"
      tabIndex={-1}
    >
      {/* 1. Ubuntu GNOME / Firefox Style Tab Strip */}
      <div className="bg-[#dfdbd2] border-b border-[#c1beb5] px-2 pt-2 flex flex-col space-y-1.5 flex-shrink-0">
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
                className={`group px-3 py-1.5 rounded-t-lg font-medium flex items-center space-x-2 border-t border-x transition-colors cursor-pointer select-none max-w-[200px] shrink-0 ${
                  isActive
                    ? 'bg-[#eae6df] border-[#c1beb5] text-slate-900 font-bold shadow-xs'
                    : 'bg-[#cfcbc2]/50 border-transparent text-slate-600 hover:bg-[#cfcbc2]'
                }`}
              >
                {/* Tab Favicon / Logo */}
                {renderTabIcon(tab)}

                {/* Tab Title */}
                <span className="truncate text-xs flex-1">{tab.title}</span>

                {/* Loading indicator */}
                {tab.isLoading && (
                  <RotateCw className="w-3 h-3 text-blue-600 animate-spin flex-shrink-0" />
                )}

                {/* Tab Close Button */}
                <button
                  type="button"
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className="p-0.5 rounded-full hover:bg-slate-400/30 text-slate-500 hover:text-slate-900 transition cursor-pointer flex-shrink-0"
                  title="Close tab (Ctrl+W)"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* New Tab Button (+) */}
          <button
            type="button"
            onClick={handleAddTab}
            className="p-1.5 rounded-lg hover:bg-[#cfcbc2] text-slate-700 hover:text-slate-950 transition cursor-pointer flex items-center justify-center shrink-0"
            title="Open new tab (Ctrl+T)"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Navigation Bar: Controls, Address Bar, Search */}
        <div className="flex items-center space-x-2 pb-2">
          {/* Back Button */}
          <button
            type="button"
            onClick={handleBack}
            disabled={!canGoBack}
            className={`p-1.5 rounded-lg transition flex items-center justify-center ${
              canGoBack
                ? 'hover:bg-slate-300/60 text-slate-700 active:scale-95 cursor-pointer'
                : 'text-slate-400/50 cursor-default'
            }`}
            title="Back (Alt+Left)"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Forward Button */}
          <button
            type="button"
            onClick={handleForward}
            disabled={!canGoForward}
            className={`p-1.5 rounded-lg transition flex items-center justify-center ${
              canGoForward
                ? 'hover:bg-slate-300/60 text-slate-700 active:scale-95 cursor-pointer'
                : 'text-slate-400/50 cursor-default'
            }`}
            title="Forward (Alt+Right)"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Reload Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-1.5 rounded-lg hover:bg-slate-300/60 text-slate-700 active:scale-95 transition cursor-pointer flex items-center justify-center"
            title="Reload current page (Ctrl+R)"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Home Button */}
          <button
            type="button"
            onClick={handleHome}
            className="p-1.5 rounded-lg hover:bg-slate-300/60 text-slate-700 active:scale-95 transition cursor-pointer flex items-center justify-center"
            title="Firefox Start Home"
          >
            <Home className="w-4 h-4" />
          </button>

          {/* Intelligent Unified Address & Search Bar */}
          <form
            onSubmit={handleAddressSubmit}
            className="flex-1 bg-white border border-[#b4b1a8] rounded-xl px-3 py-1 flex items-center space-x-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition shadow-inner"
          >
            {isSecure ? (
              <Lock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            )}

            <input
              ref={addressInputRef}
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Search web or enter URL (e.g. youtube, https://github.com)..."
              className="flex-1 outline-none text-xs text-slate-800 placeholder-slate-400 font-sans bg-transparent"
            />

            {urlInput && (
              <button
                type="button"
                onClick={() => setUrlInput('')}
                className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Clear address bar"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            <button
              type="submit"
              className="text-[10px] bg-slate-100 hover:bg-blue-600 hover:text-white border border-slate-300 text-slate-700 px-2 py-0.5 rounded-md font-semibold cursor-pointer transition shadow-2xs"
            >
              Go
            </button>
          </form>

          {/* CaelumOS Browser Runtime Status Badge */}
          <div
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border ${
              runtimeStatus.connected
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-slate-200 border-slate-300 text-slate-600'
            }`}
            title={
              runtimeStatus.connected
                ? `CaelumOS Local Browser Runtime active (${runtimeStatus.engine})`
                : 'In-OS Browser Sandbox Active'
            }
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                runtimeStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="font-semibold">
              {runtimeStatus.connected ? 'Local Engine Active' : 'In-OS Sandbox'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Error Notice */}
      {navError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-700 flex items-center justify-between flex-shrink-0 animate-in fade-in duration-100">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{navError}</span>
          </div>
          <button
            type="button"
            onClick={() => setNavError(null)}
            className="text-red-500 hover:text-red-800 text-[10px] font-bold uppercase cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. Main Browser Tab Viewport Surfaces */}
      <div className="flex-1 bg-white overflow-hidden relative flex flex-col">
        {tabs.map((tab) => {
          const isCurrentTab = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              style={{ display: isCurrentTab ? 'flex' : 'none' }}
              className="flex-1 w-full h-full flex-col overflow-hidden relative bg-white"
            >
              {/* VIEW A: FIREFOX START / HOME PAGE */}
              {tab.type === 'home' ? (
                <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800">
                  <div className="max-w-xl w-full flex flex-col items-center text-center space-y-6">
                    {/* Firefox / CaelumOS Emblem */}
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700/60 flex items-center justify-center shadow-lg">
                        <FirefoxLogo className="w-8 h-8" />
                      </div>
                      <div className="text-left">
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                          Firefox Web Browser
                        </h1>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                          CaelumOS Desktop Edition
                        </span>
                      </div>
                    </div>

                    {/* Centered In-OS Search Bar */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (urlInput.trim()) navigateCurrentTab(urlInput);
                      }}
                      className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 shadow-md flex items-center space-x-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition"
                    >
                      <Search className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Search the web or enter URL..."
                        className="flex-1 outline-none text-xs text-slate-800 placeholder-slate-400 font-sans bg-transparent"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3.5 py-1.5 rounded-xl cursor-pointer transition shadow-xs"
                      >
                        Search
                      </button>
                    </form>

                    {/* Quick Sites Shortcuts - ALL REMAIN INSIDE CAELUMOS! */}
                    <div className="w-full space-y-3 text-left">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Top Sites & Bookmarks
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                        {[
                          {
                            name: 'YouTube',
                            dest: 'https://www.youtube.com',
                            logo: <YoutubeLogo className="w-6 h-6" />,
                          },
                          {
                            name: 'Google',
                            dest: 'Google',
                            logo: <GoogleLogo className="w-6 h-6" />,
                          },
                          {
                            name: 'GitHub',
                            dest: 'https://github.com',
                            logo: <GithubLogo className="w-6 h-6 text-slate-900" />,
                          },
                          {
                            name: 'Kubernetes',
                            dest: 'https://kubernetes.io',
                            logo: <KubernetesLogo className="w-6 h-6" />,
                          },
                          {
                            name: 'Docker Docs',
                            dest: 'https://docs.docker.com',
                            logo: <DockerLogo className="w-6 h-6" />,
                          },
                          {
                            name: 'AWS Console',
                            dest: 'https://console.aws.amazon.com/ec2/home?region=us-east-1',
                            logo: <AwsLogo className="w-6 h-6" />,
                          },
                          {
                            name: 'Stack Overflow',
                            dest: 'https://stackoverflow.com',
                            logo: (
                              <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center text-white font-bold text-xs">
                                SO
                              </div>
                            ),
                          },
                          {
                            name: 'CaelumOS Docs',
                            dest: 'https://docs.caelum-os.internal/architecture/overview',
                            logo: (
                              <img
                                src="/branding/caelumos-icon.png"
                                alt="CaelumOS"
                                className="w-6 h-6 rounded-md object-contain"
                              />
                            ),
                          },
                        ].map((site) => (
                          <button
                            key={site.name}
                            type="button"
                            onClick={() => navigateCurrentTab(site.dest)}
                            className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center space-y-1.5 transition shadow-xs hover:shadow-sm cursor-pointer group"
                          >
                            <div className="w-6 h-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                              {site.logo}
                            </div>
                            <span className="text-[11px] font-semibold text-slate-700 group-hover:text-blue-600 truncate max-w-full">
                              {site.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : tab.type === 'youtube' ? (
                /* VIEW B: IN-OS YOUTUBE PLAYER & SEARCH SURFACE */
                <div className="flex-1 flex flex-col overflow-hidden bg-black text-white">
                  {/* YouTube Top Bar Header */}
                  <div className="h-10 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between text-xs select-none flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      <YoutubeLogo className="w-4.5 h-4.5" />
                      <span className="font-bold text-white tracking-tight">YouTube In-OS Player</span>
                      <span className="text-[10px] bg-red-600/30 text-red-400 border border-red-500/40 px-1.5 py-0.2 rounded font-mono">
                        Embedded Live
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => navigateCurrentTab('https://www.youtube.com')}
                        className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-750 text-slate-300 hover:text-white transition cursor-pointer"
                      >
                        Trending
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateCurrentTab('youtube lofi hip hop')}
                        className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-750 text-slate-300 hover:text-white transition cursor-pointer"
                      >
                        Lofi Beats
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateCurrentTab('youtube kubernetes tutorial')}
                        className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-750 text-slate-300 hover:text-white transition cursor-pointer"
                      >
                        K8s Tutorials
                      </button>
                    </div>
                  </div>

                  {/* YouTube Embed Player Viewport */}
                  <div className="flex-1 w-full h-full relative bg-neutral-950 flex flex-col">
                    <iframe
                      src={tab.renderedUrl}
                      title={tab.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full flex-1 border-0"
                    />
                  </div>
                </div>
              ) : tab.type === 'docs' ? (
                /* VIEW C: INTERNAL CAELUMOS ARCHITECTURE DOCUMENTATION */
                <div className="flex-1 flex flex-col overflow-y-auto p-6 md:p-8 bg-white text-slate-800 text-xs">
                  <div className="max-w-2xl mx-auto space-y-4">
                    <div className="border-b border-slate-200 pb-3 flex items-center space-x-2.5">
                      <img
                        src="/branding/caelumos-icon.png"
                        alt="CaelumOS"
                        className="w-7 h-7 rounded-lg object-contain"
                      />
                      <div>
                        <h2 className="text-base font-bold text-slate-900">
                          CaelumOS Architecture Overview
                        </h2>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Internal Documentation v2.4 (Core Specs)
                        </span>
                      </div>
                    </div>

                    <p className="leading-relaxed">
                      CaelumOS replaces complex infrastructure dashboard navigation with a unified Web
                      Desktop interface, wrapping interactive shells (AI Terminal) and cloud metrics
                      directly inside lightweight GNOME window frames.
                    </p>

                    <h3 className="text-xs font-bold text-slate-950 pt-2 border-b border-slate-100 pb-1 flex items-center space-x-1.5">
                      <Cpu className="w-4 h-4 text-purple-600" />
                      <span>True In-OS Web Browsing Architecture</span>
                    </h3>
                    <p className="leading-relaxed">
                      Every tab opened within the CaelumOS Browser stays isolated within the OS
                      workspace. The address bar coordinates with the Local Browser Runtime to inspect
                      security headers (X-Frame-Options, Content-Security-Policy) and render web content
                      safely without launching external Chrome or Edge windows.
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="font-bold text-slate-900 block">Tab Session Isolation</span>
                        <span className="text-[11px] text-slate-600">
                          Tabs preserve viewport and execution state seamlessly across switching.
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="font-bold text-slate-900 block">Zero-External Popups</span>
                        <span className="text-[11px] text-slate-600">
                          Prevents unexpected system browser redirects from interrupting the user workflow.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : tab.type === 'aws' ? (
                /* VIEW D: AWS MANAGEMENT CONSOLE PORTAL TAB */
                <div className="flex-1 flex flex-col overflow-hidden text-xs text-slate-800 select-text">
                  <div className="h-9 bg-[#232f3e] text-white flex items-center justify-between px-3 select-none flex-shrink-0">
                    <div className="flex items-center space-x-3">
                      <span className="font-extrabold text-[13px] tracking-tight flex items-center space-x-1">
                        <span className="text-orange-400">aws</span>
                        <span className="text-white/60 font-light text-[10px] ml-1">console</span>
                      </span>
                      <div className="bg-[#1f2d3d] border border-slate-600 rounded-md px-2.5 py-0.5 flex items-center space-x-2 text-[10px] w-64">
                        <Search className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-400">Search Services (EC2, S3, RDS)...</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-[10px] text-slate-300">
                      {onOpenApp && (
                        <button
                          type="button"
                          onClick={() => onOpenApp('aws')}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-2 py-0.5 rounded flex items-center space-x-1 cursor-pointer transition"
                        >
                          <AwsLogo className="w-3 h-3" />
                          <span>Open in CaelumOS AWS Console</span>
                        </button>
                      )}
                      <span className="h-3 w-[1px] bg-slate-600" />
                      <span className="font-semibold text-slate-100">CaelumOS-Core (1284-9024)</span>
                    </div>
                  </div>

                  <div className="flex-1 p-5 overflow-y-auto bg-slate-50 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h2 className="text-sm font-bold text-slate-900">
                        EC2 Resource Summary (us-east-1)
                      </h2>
                      <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase">
                        All Services Operational
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-1">
                        <span className="text-slate-400 text-xs">Running Instances</span>
                        <p className="text-xl font-bold text-slate-950">3 / 4</p>
                        <span className="text-[9px] text-emerald-600 font-semibold uppercase">
                          Healthy
                        </span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-1">
                        <span className="text-slate-400 text-xs">Security Groups</span>
                        <p className="text-xl font-bold text-slate-950">6 Active</p>
                        <span className="text-[9px] text-slate-500 font-semibold uppercase">
                          Standard
                        </span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-1">
                        <span className="text-slate-400 text-xs">Target Groups</span>
                        <p className="text-xl font-bold text-slate-950">2</p>
                        <span className="text-[9px] text-emerald-600 font-semibold uppercase">
                          Passed Checks
                        </span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-1">
                        <span className="text-slate-400 text-xs">Load Balancers</span>
                        <p className="text-xl font-bold text-slate-950">1 ALB</p>
                        <span className="text-[9px] text-emerald-600 font-semibold uppercase">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : tab.readerMode && tab.readerContent ? (
                /* VIEW E: READER VIEW FOR CONTENT-HEAVY / SECURITY RESTRICTED SITES */
                <div className="flex-1 flex flex-col overflow-y-auto p-6 md:p-10 bg-slate-50 text-slate-900 select-text">
                  <div className="max-w-2xl mx-auto w-full space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-slate-950">{tab.readerContent.title}</h2>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setTabs((prev) =>
                            prev.map((t) => (t.id === tab.id ? { ...t, readerMode: false } : t)),
                          )
                        }
                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition"
                      >
                        Exit Reader View
                      </button>
                    </div>

                    <div
                      className="prose prose-sm max-w-none text-slate-800 leading-relaxed font-sans"
                      dangerouslySetInnerHTML={{ __html: tab.readerContent.htmlPreview }}
                    />
                  </div>
                </div>
              ) : tab.canEmbed ? (
                /* VIEW F: TRUE LIVE EMBEDDED WEB DESTINATION */
                <div className="flex-1 w-full h-full relative bg-white flex flex-col">
                  {tab.renderedUrl && (
                    <iframe
                      src={tab.renderedUrl}
                      title={tab.title}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups-to-escape-sandbox allow-modals allow-downloads"
                      className="w-full flex-1 border-0"
                    />
                  )}
                </div>
              ) : (
                /* VIEW G: CLEAN ERROR & SECURITY POLICY STATE - NEVER LEAVES CAELUMOS AUTOMATICALLY! */
                <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col items-center justify-center text-center bg-slate-50 text-slate-800">
                  <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-5 animate-in fade-in zoom-in-95 duration-150">
                    {/* Security Shield Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                      <Shield className="w-8 h-8" />
                    </div>

                    {/* Exact Prompt-Required Message */}
                    <div className="space-y-2">
                      <h2 className="text-base font-bold text-slate-900 tracking-tight">
                        This website cannot be embedded in the current browser environment.
                      </h2>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                        The destination server enforces security policies (
                        <code className="text-amber-700 font-mono text-[11px] bg-amber-50 px-1 py-0.5 rounded">
                          {tab.blockReason || 'X-Frame-Options: SAMEORIGIN / DENY'}
                        </code>
                        ) that restrict embedding inside web-based desktop frames.
                      </p>
                    </div>

                    {/* Destination Metadata Card */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-1.5 font-mono text-xs">
                      <div className="flex items-center justify-between text-slate-500 text-[10px]">
                        <span>DESTINATION URL</span>
                        <span className="text-emerald-600 flex items-center font-bold">
                          <Lock className="w-3 h-3 mr-1" />
                          TLS ENCRYPTED
                        </span>
                      </div>
                      <p className="text-slate-800 break-all select-all font-semibold">{tab.url}</p>
                    </div>

                    {/* In-OS Action Buttons */}
                    <div className="flex flex-col gap-2.5 pt-2">
                      {/* 1. App Integration: If GitHub, provide direct Open in GitHub Workspace */}
                      {tab.url.includes('github.com') && onOpenApp && (
                        <button
                          type="button"
                          onClick={() => onOpenApp('github')}
                          className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-neutral-950/20 cursor-pointer"
                        >
                          <GithubLogo className="w-4 h-4 text-white" />
                          <span>Open in CaelumOS GitHub Workspace</span>
                        </button>
                      )}

                      {/* 2. Reader View: Inspect text via Local Connector */}
                      <button
                        type="button"
                        onClick={() => handleFetchReader(tab)}
                        className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition border border-slate-300 cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4 text-slate-600" />
                        <span>Inspect Page Content (Reader Mode)</span>
                      </button>

                      {/* 3. In-OS Web Search: Search for this destination inside CaelumOS */}
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            const q = new URL(tab.url).hostname.replace(/^www\./, '');
                            navigateCurrentTab(q);
                          } catch {
                            navigateCurrentTab(tab.url);
                          }
                        }}
                        className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition border border-slate-300 cursor-pointer"
                      >
                        <Search className="w-4 h-4 text-slate-600" />
                        <span>Search Results for this Destination</span>
                      </button>

                      {/* 4. Explicit User Action: "Open in system browser" (ONLY when user explicitly clicks it!) */}
                      <button
                        type="button"
                        onClick={() => handleOpenExplicitExternal(tab.url)}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-sm cursor-pointer"
                      >
                        <span>Open in system browser</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Browser Status & Security Bar */}
      <div className="bg-[#dfdbd2] border-t border-[#c1beb5] px-3 py-1 flex items-center justify-between text-[11px] text-slate-600 select-none flex-shrink-0">
        <div className="flex items-center space-x-2.5 truncate">
          <span className="flex items-center text-emerald-700 font-medium">
            <Lock className="w-3 h-3 mr-1" />
            {isSecure ? 'TLS 1.3 256-bit Encrypted' : 'Standard Connection'}
          </span>
          <span className="h-3 w-[1px] bg-slate-400" />
          <span className="truncate text-slate-700 font-mono text-[10px]">
            {activeTab?.url === 'about:home' ? 'Firefox Start Page' : activeTab?.url}
          </span>
        </div>

        <div className="flex items-center space-x-3 font-mono text-[10px]">
          <button
            type="button"
            onClick={copyCurrentUrl}
            className="hover:text-slate-900 transition flex items-center space-x-1 cursor-pointer"
            title="Copy current URL"
          >
            {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
          </button>
          <span className="h-3 w-[1px] bg-slate-400" />
          <span className="text-slate-500">
            {tabs.length} {tabs.length === 1 ? 'Tab' : 'Tabs'}
          </span>
        </div>
      </div>
    </div>
  );
}
