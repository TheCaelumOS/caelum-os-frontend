"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal as TermIcon, 
  Trash2, 
  Grid, 
  Wifi, 
  Volume2, 
  Battery, 
  ChevronDown, 
  Search, 
  ShieldCheck, 
  Zap, 
  Sliders,
  Power,
  Activity,
  User,
  Sparkles,
  Folder,
  Globe,
  Settings as SettingsIcon,
  FolderIcon
} from 'lucide-react';
import WindowFrame from './WindowFrame';
import TerminalApp from './apps/TerminalApp';
import DashboardApp from './apps/DashboardApp';
import BrowserApp from './apps/BrowserApp';
import NautilusApp from './apps/NautilusApp';
import SystemMonitorApp from './apps/SystemMonitorApp';
import DockerApp from './apps/DockerApp';
import AwsApp from './apps/AwsApp';
import AzureApp from './apps/AzureApp';
import GitApp from './apps/GitApp';
import KubernetesApp from './apps/KubernetesApp';
import VscodeApp from './apps/VscodeApp';
import AiAssistantApp from './apps/AiAssistantApp';
import TerraformApp from './apps/TerraformApp';

// SVGs and Brand Logos
const TerraformLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path fill="#844FBA" d="M1.5 0h7v7h-7zM15.5 0h7v7h-7zM8.5 7h7v7h-7zM1.5 14h7v7h-7zM15.5 14h7v7h-7z" />
  </svg>
);

const DockerLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path fill="#0db7ed" d="M22.3 10.05c-.34-.73-.91-1.3-1.61-1.67-.18-.1-.38-.17-.58-.23a4.23 4.23 0 0 0-.28-1.57c-.24-.55-.65-1.02-1.18-1.32-.47-.27-1.02-.38-1.55-.32-.23-.83-.73-1.54-1.42-2-.68-.45-1.5-.64-2.3-.53h-.03v1.89h.03c.53-.06 1.08.06 1.53.36.42.28.71.72.82 1.22l.06.28.28.03c.66.08 1.25.46 1.58 1.04.18.32.28.69.29 1.06v.06h1.92v-.03c0-.12.02-.24.03-.36l.01-.22zM8.99 7.62h1.61v-1.6H8.99v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm-7.02 2.34h1.61v-1.6H6.65v1.6zm2.34 0h1.61v-1.6H8.99v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm-11.7 2.34h1.61v-1.6H4.31v1.6zm2.34 0h1.61v-1.6H6.65v1.6zm2.34 0h1.61v-1.6H8.99v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm-14.04 2.34c0 1.9 1.53 3.44 3.44 3.44h11.23c3.1 0 5.66-2.4 5.86-5.46.02-.3.17-.57.43-.73.66-.43 1.25-1.04 1.52-1.76.27-.72.11-1.5-.18-1.89-.46-.52-1.14-.82-1.81-.82-.09 0-.17.01-.26.02-.45.04-.84-.13-1.12-.48l-.51-.38-.51.38c-.28.35-.67.52-1.12.48a1.64 1.64 0 0 0-1.12.48l-.51.38v-4.3c0-.1-.08-.18-.18-.18H8.38c-.1 0-.18.08-.18.18v5.43c0 .1-.08.18-.18.18H6.41c-.1 0-.18-.08-.18-.18v-5.43c0-.1-.08-.18-.18-.18H4.44c-.1 0-.18.08-.18.18v5.43c0 .1-.08.18-.18.18H2.47c-.1 0-.18-.08-.18-.18v-3.25c0-.1-.08-.18-.18-.18H.3c-.1 0-.18.08-.18.18v1.36c0 1.9 1.53 3.44 3.44 3.44h1.76v-.06z" />
  </svg>
);

const KubernetesLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path fill="#326CE5" d="M12.44 2.1a1.23 1.23 0 00-.88 0L3.18 5.5a1.24 1.24 0 00-.73 1.05v9.9a1.24 1.24 0 00.73 1.05l8.38 3.4a1.23 1.23 0 00.88 0l8.38-3.4a1.24 1.24 0 00.73-1.05v-9.9a1.24 1.24 0 00-.73-1.05z" />
    <path fill="#FFFFFF" d="M12 4.45l6.53 2.65v2.96L12 7.42zm-6.53 2.65L12 4.45v2.97L5.47 10.06zM4.65 8.9v6.2l3.4-1.38V7.52zm4.24 4.9L12 12.46l3.11 1.26v2.96L12 15.42zm4.23-1.34L19.35 8.9V13.8l-3.4 1.38zm7.34 2.74l-6.53 2.65v-2.96l6.53-2.65zm-16.92 0L12 18.06V20.7l-6.53-2.65zm6.53-5.26v2.96L5.47 12.8v-2.96z" />
  </svg>
);

const VscodeLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path fill="#007acc" d="M23.98 6.55L21.3 3.86c-.19-.19-.51-.19-.7 0L14.72 9.5 8.04 3.52c-.19-.19-.51-.19-.7 0L.1 10.64c-.19.19-.19.51 0 .7l2.69 2.69c.19.19.51.19.7 0l5.73-5.73 6.7 6c.19.19.51.19.7 0l7.1-7.1c.19-.2.19-.52-.04-.65z" />
  </svg>
);

const AwsLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className}>
    <path fill="#FF9900" d="M25 21.2c-3.1 2.2-7.5 3.3-11.8 3.3-6 0-11-2.2-13.8-5.6-.4-.5 0-1.1.5-.8 4.3 2.3 9.6 3.6 15 3.6 4.4 0 9.2-.9 12.6-2.8.7-.4 1.1.3.4.8z" />
    <path fill="#FF9900" d="M26 19.4c-.3-.4-1.1-.1-1.5.1-.4.3-.3 1.1.1 1.4.7.4 1.5 1 1.6.4.3-.4-.9-1.5-.9-1.9z" />
  </svg>
);

const AzureLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 128 128" className={className}>
    <path fill="#0078d4" d="M10.8 108.8L63.3 22l43.5 28.5L63.3 83.3z" />
    <path fill="#50e6ff" d="M117.2 108.8H10.8l52.5-25.5z" />
  </svg>
);

const GithubLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-white`}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
  </svg>
);

const GrafanaLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 50 50" className={className}>
    <path fill="#F26522" d="M25 5C14 5 5 14 5 25s9 20 20 20 20-9 20-20S36 5 25 5zm5.5 30.5c-3 .5-6-1.5-6.5-4.5s1.5-6 4.5-6.5 6 1.5 6.5 4.5-1.5 6-4.5 6.5zm3.8-13.8c-2 2-5 1-7-1s-3-5-1-7 5-1 7 1 3 5 1 7z" />
  </svg>
);

const FirefoxLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <circle cx="12" cy="12" r="10" fill="#2563eb" />
    <path fill="#ea580c" d="M12 2a10 10 0 0110 10c0 4.1-2.5 7.6-6.1 9.1-.5.2-1-.2-.8-.7a6 6 0 00.9-3.2c0-3.3-2.7-6-6-6s-6 2.7-6 6c0 1.2.3 2.3.9 3.2.2.5-.3.9-.8.7A10 10 0 012 12c0-5.5 4.5-10 10-10z" />
  </svg>
);

const NautilusLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="folderGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#c2410c" />
      </linearGradient>
    </defs>
    <path fill="url(#folderGrad)" d="M2 4a2 2 0 012-2h4l2 3h10a2 2 0 012 2v11a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" />
  </svg>
);

interface AppWindow {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  theme: 'dark' | 'light';
  width: number;
  height: number;
}

export default function Desktop() {
  const pathname = usePathname();
  const router = useRouter();

  const [timeStr, setTimeStr] = useState('');
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showAppDrawer, setShowAppDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [volume, setVolume] = useState(80);
  const [brightness, setBrightness] = useState(90);

  // Active Sub-Paths for Cloud modules
  const [activeSubPaths, setActiveSubPaths] = useState<Record<string, string>>({
    aws: 'ec2',
    azure: 'vms',
    docker: 'containers',
    kubernetes: 'pods'
  });

  // Windows State Array
  const [windows, setWindows] = useState<AppWindow[]>([
    { id: 'terminal', title: 'linux@caelum-os:~ (Terminal)', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, theme: 'dark', width: 700, height: 440 },
    { id: 'nautilus', title: 'Files (Nautilus Manager)', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 4, theme: 'light', width: 750, height: 460 },
    { id: 'dashboard', title: 'System Deploy Dashboard', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 5, theme: 'light', width: 900, height: 560 },
    { id: 'aws', title: 'AWS Cloud Console', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'light', width: 880, height: 540 },
    { id: 'azure', title: 'Azure Cloud Console', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'light', width: 880, height: 540 },
    { id: 'docker', title: 'Docker Containerizer', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'dark', width: 800, height: 500 },
    { id: 'kubernetes', title: 'Kubernetes Orchestrator', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'dark', width: 820, height: 520 },
    { id: 'monitoring', title: 'Grafana / Prometheus Monitor', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'dark', width: 820, height: 520 },
    { id: 'aiassistant', title: 'AI Assistant Co-Pilot', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'dark', width: 720, height: 480 },
    { id: 'github', title: 'Git Adapter Repository', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'dark', width: 800, height: 500 },
    { id: 'vscode', title: 'VS Code Editor', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'dark', width: 900, height: 560 },
    { id: 'browser', title: 'Firefox Web Browser', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'light', width: 850, height: 520 },
    { id: 'terraform', title: 'Terraform Provisioner', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'dark', width: 840, height: 520 },
  ]);

  const [topZIndex, setTopZIndex] = useState(11);

  // Sync route path to Window opening state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname;
    if (!path || path === '/') return;
    const parts = path.split('/').filter(Boolean);
    const mainApp = parts[0];
    const subpath = parts[1] || '';

    if (windows.some(w => w.id === mainApp)) {
      setWindows(prev => prev.map(w => {
        if (w.id === mainApp) {
          const nextZ = topZIndex + 1;
          setTopZIndex(nextZ);
          return { ...w, isOpen: true, isMinimized: false, zIndex: nextZ };
        }
        return w;
      }));

      if (subpath) {
        setActiveSubPaths(prev => ({
          ...prev,
          [mainApp]: subpath
        }));
      }
    }
  }, []);

  // Sync browser popstate (back/forward) events
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/') return;
      const parts = path.split('/').filter(Boolean);
      const mainApp = parts[0];
      const subpath = parts[1] || '';

      if (windows.some(w => w.id === mainApp)) {
        setWindows(prev => prev.map(w => {
          if (w.id === mainApp) {
            const nextZ = topZIndex + 1;
            setTopZIndex(nextZ);
            return { ...w, isOpen: true, isMinimized: false, zIndex: nextZ };
          }
          return w;
        }));

        if (subpath) {
          setActiveSubPaths(prev => ({
            ...prev,
            [mainApp]: subpath
          }));
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [windows, topZIndex]);

  // Update date/time
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTimeStr(date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const openApp = (appId: string) => {
    setShowAppDrawer(false);
    const nextZ = topZIndex + 1;
    setTopZIndex(nextZ);

    setWindows(prev => prev.map(w => {
      if (w.id === appId) {
        return { ...w, isOpen: true, isMinimized: false, zIndex: nextZ };
      }
      return w;
    }));

    // Update URL path dynamically using browser history API
    const sub = activeSubPaths[appId] ? `/${activeSubPaths[appId]}` : '';
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/${appId}${sub}`);
    }
  };

  const focusWindow = (id: string) => {
    const nextZ = topZIndex + 1;
    setTopZIndex(nextZ);
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, isMinimized: false, zIndex: nextZ };
      }
      return w;
    }));

    const sub = activeSubPaths[id] ? `/${activeSubPaths[id]}` : '';
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/${id}${sub}`);
    }
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, isOpen: false };
      }
      return w;
    }));
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
  };

  const toggleWindowMinimize = (id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, isMinimized: !w.isMinimized };
      }
      return w;
    }));
  };

  const toggleWindowMaximize = (id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, isMaximized: !w.isMaximized };
      }
      return w;
    }));
  };

  const handleSubPathChange = (appId: string, subpath: string) => {
    setActiveSubPaths(prev => ({
      ...prev,
      [appId]: subpath
    }));
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/${appId}/${subpath}`);
    }
  };

  // Left Ubuntu-style Dock Order
  const dockItems = [
    { id: 'launcher', name: 'Dashboard', icon: () => <Grid className="w-5.5 h-5.5 text-orange-500" /> },
    { id: 'terminal', name: 'Terminal', icon: () => <div className="w-9 h-9 bg-neutral-900 border border-neutral-700/60 rounded-xl flex items-center justify-center text-emerald-400"><TermIcon className="w-5 h-5" /></div> },
    { id: 'nautilus', name: 'Files', icon: () => <div className="w-9 h-9 bg-neutral-900 border border-neutral-700/60 rounded-xl flex items-center justify-center text-orange-400"><FolderIcon className="w-5 h-5" /></div> },
    { id: 'dashboard', name: 'Deploy', icon: () => <div className="w-9 h-9 bg-purple-950/60 border border-purple-500/35 rounded-xl flex items-center justify-center text-purple-300"><ShieldCheck className="w-5 h-5" /></div> },
    { id: 'aws', name: 'AWS', icon: () => <div className="w-9 h-9 bg-[#232f3e] border border-white/5 rounded-xl flex items-center justify-center"><AwsLogo className="w-6.5 h-6.5" /></div> },
    { id: 'azure', name: 'Azure', icon: () => <div className="w-9 h-9 bg-[#0078d4]/10 border border-[#0078d4]/20 rounded-xl flex items-center justify-center"><AzureLogo className="w-5.5 h-5.5" /></div> },
    { id: 'docker', name: 'Docker', icon: () => <div className="w-9 h-9 bg-[#0db7ed]/10 border border-[#0db7ed]/20 rounded-xl flex items-center justify-center"><DockerLogo className="w-6 h-6" /></div> },
    { id: 'kubernetes', name: 'Kubernetes', icon: () => <div className="w-9 h-9 bg-[#326ce5]/10 border border-[#326ce5]/20 rounded-xl flex items-center justify-center"><KubernetesLogo className="w-5.5 h-5.5" /></div> },
    { id: 'terraform', name: 'Terraform', icon: () => <div className="w-9 h-9 bg-[#844fba]/10 border border-[#844fba]/20 rounded-xl flex items-center justify-center"><TerraformLogo className="w-5.5 h-5.5" /></div> },
    { id: 'github', name: 'GitHub', icon: () => <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center"><GithubLogo className="w-5.5 h-5.5" /></div> },
    { id: 'monitoring', name: 'Monitoring', icon: () => <div className="w-9 h-9 bg-neutral-900 border border-neutral-700/60 rounded-xl flex items-center justify-center text-amber-500"><Activity className="w-5 h-5" /></div> },
    { id: 'aiassistant', name: 'AI Copilot', icon: () => <div className="w-9 h-9 bg-purple-600/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400"><Sparkles className="w-5 h-5" /></div> },
    { id: 'browser', name: 'Browser', icon: () => <div className="w-9 h-9 bg-[#005af0]/10 border border-[#005af0]/20 rounded-xl flex items-center justify-center text-blue-400"><Globe className="w-5 h-5" /></div> },
    { id: 'settings', name: 'Settings', icon: () => <div className="w-9 h-9 bg-neutral-900 border border-neutral-700/60 rounded-xl flex items-center justify-center text-slate-400"><SettingsIcon className="w-5 h-5" /></div> },
    { id: 'profile', name: 'Profile', icon: () => <div className="w-9 h-9 bg-neutral-900 border border-neutral-700/60 rounded-xl flex items-center justify-center text-slate-450"><User className="w-5 h-5" /></div> },
    { id: 'logout', name: 'Power / Logout', icon: () => <div className="w-9 h-9 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500"><Power className="w-4.5 h-4.5" /></div> }
  ];

  const handleDockItemClick = (id: string) => {
    if (id === 'launcher') {
      setShowAppDrawer(!showAppDrawer);
      return;
    }
    if (id === 'logout') {
      alert('Logging out of CaelumOS...');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/');
      }
      return;
    }
    const win = windows.find(w => w.id === id);
    if (win) {
      if (win.isOpen) {
        if (win.isMinimized) {
          focusWindow(id);
        } else {
          toggleWindowMinimize(id);
        }
      } else {
        openApp(id);
      }
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#4f1836] via-[#2c001e] to-[#77216f] select-none font-sans text-slate-200">
      
      {/* 1. GNOME Top Panel Header Bar */}
      <div className="absolute top-0 left-0 right-0 h-7 bg-neutral-950/85 border-b border-white/5 flex items-center justify-between px-4 z-40 text-xs font-medium">
        {/* Left Activities menu */}
        <div className="flex items-center space-x-4">
          <span className="hover:text-white cursor-pointer font-bold text-[11px] text-slate-200">Activities</span>
        </div>

        {/* Center Clock */}
        <div className="hover:text-white cursor-pointer font-bold select-none text-[11px] text-slate-200">
          {timeStr}
        </div>

        {/* Right status drawer */}
        <div 
          onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
          className="flex items-center space-x-3 hover:bg-white/10 px-2.5 py-0.5 rounded-full cursor-pointer transition-all"
        >
          <span className="text-[10px] text-indigo-400 uppercase font-mono tracking-wider font-extrabold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Cloud Connected</span>
          </span>
          <Wifi className="w-3.5 h-3.5 text-slate-350" />
          <Battery className="w-3.5 h-3.5 text-slate-350" />
          <ChevronDown className="w-3 h-3 opacity-60 text-slate-350" />
        </div>
      </div>

      {/* Settings System Dropdown overlay */}
      <AnimatePresence>
        {showSettingsDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-8 right-3 w-60 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-xl p-4 shadow-2xl z-50 text-xs space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">Sound Volume</span>
                <span className="font-mono">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-orange-500 bg-neutral-800 h-1 rounded"
              />
            </div>
            <div className="space-y-3 border-t border-neutral-800 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">Screen Brightness</span>
                <span className="font-mono">{brightness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-orange-500 bg-neutral-800 h-1 rounded"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Ubuntu Left Vertical Fixed Dock */}
      <div className="absolute left-2 top-9 bottom-2 w-16 bg-[#111111]/70 backdrop-blur-md border border-white/5 rounded-2xl flex flex-col items-center py-4 justify-between z-30 shadow-xl">
        <div className="flex flex-col items-center space-y-2.5 w-full">
          {dockItems.slice(0, 13).map(item => {
            const win = windows.find(w => w.id === item.id);
            const isOpen = win?.isOpen && !win?.isMinimized;
            return (
              <div key={item.id} className="relative group w-full flex justify-center">
                {/* Active application dot on the left of dock container */}
                {win?.isOpen && (
                  <span className="absolute left-1.5 top-[18px] w-1 h-1.5 rounded-full bg-white shadow shadow-white" />
                )}
                <button
                  onClick={() => handleDockItemClick(item.id)}
                  className="w-10 h-10 rounded-xl hover:bg-white/10 active:scale-95 transition-all duration-150 flex items-center justify-center cursor-pointer hover:scale-110"
                  title={item.name}
                >
                  {item.icon()}
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Dock segment */}
        <div className="flex flex-col items-center space-y-2.5 w-full">
          {dockItems.slice(13).map(item => (
            <button
              key={item.id}
              onClick={() => handleDockItemClick(item.id)}
              className="w-10 h-10 rounded-xl hover:bg-white/10 active:scale-95 transition-all duration-150 flex items-center justify-center cursor-pointer hover:scale-110"
              title={item.name}
            >
              {item.icon()}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Windows floating layer container */}
      <div className="absolute left-[76px] top-7 right-0 bottom-0 z-20 overflow-hidden pointer-events-none">
        <div className="relative w-full h-full pointer-events-auto">
          {/* Terminal */}
          {windows.find(w => w.id === 'terminal')?.isOpen && (
            <WindowFrame
              id="terminal"
              title="linux@caelum-os:~ (Terminal)"
              isOpen={windows.find(w => w.id === 'terminal')?.isOpen || false}
              isMinimized={windows.find(w => w.id === 'terminal')?.isMinimized || false}
              isMaximized={windows.find(w => w.id === 'terminal')?.isMaximized || false}
              zIndex={windows.find(w => w.id === 'terminal')?.zIndex || 10}
              onClose={() => closeWindow('terminal')}
              onMinimize={() => toggleWindowMinimize('terminal')}
              onMaximize={() => toggleWindowMaximize('terminal')}
              onFocus={() => focusWindow('terminal')}
              theme="dark"
              defaultWidth={700}
              defaultHeight={440}
            >
              <TerminalApp onOpenApp={openApp} />
            </WindowFrame>
          )}

          {/* Files Explorer */}
          {windows.find(w => w.id === 'nautilus')?.isOpen && (
            <WindowFrame
              id="nautilus"
              title="Files (Nautilus Manager)"
              isOpen={windows.find(w => w.id === 'nautilus')?.isOpen || false}
              isMinimized={windows.find(w => w.id === 'nautilus')?.isMinimized || false}
              isMaximized={windows.find(w => w.id === 'nautilus')?.isMaximized || false}
              zIndex={windows.find(w => w.id === 'nautilus')?.zIndex || 4}
              onClose={() => closeWindow('nautilus')}
              onMinimize={() => toggleWindowMinimize('nautilus')}
              onMaximize={() => toggleWindowMaximize('nautilus')}
              onFocus={() => focusWindow('nautilus')}
              theme="light"
              defaultWidth={750}
              defaultHeight={460}
            >
              <NautilusApp />
            </WindowFrame>
          )}

          {/* Dashboard */}
          {windows.find(w => w.id === 'dashboard')?.isOpen && (
            <WindowFrame
              id="dashboard"
              title="Deploy Summary Dashboard"
              isOpen={windows.find(w => w.id === 'dashboard')?.isOpen || false}
              isMinimized={windows.find(w => w.id === 'dashboard')?.isMinimized || false}
              isMaximized={windows.find(w => w.id === 'dashboard')?.isMaximized || false}
              zIndex={windows.find(w => w.id === 'dashboard')?.zIndex || 5}
              onClose={() => closeWindow('dashboard')}
              onMinimize={() => toggleWindowMinimize('dashboard')}
              onMaximize={() => toggleWindowMaximize('dashboard')}
              onFocus={() => focusWindow('dashboard')}
              theme="light"
              defaultWidth={900}
              defaultHeight={560}
            >
              <DashboardApp />
            </WindowFrame>
          )}

          {/* AWS Cloud Console */}
          {windows.find(w => w.id === 'aws')?.isOpen && (
            <WindowFrame
              id="aws"
              title="AWS Cloud Console"
              isOpen={windows.find(w => w.id === 'aws')?.isOpen || false}
              isMinimized={windows.find(w => w.id === 'aws')?.isMinimized || false}
              isMaximized={windows.find(w => w.id === 'aws')?.isMaximized || false}
              zIndex={windows.find(w => w.id === 'aws')?.zIndex || 2}
              onClose={() => closeWindow('aws')}
              onMinimize={() => toggleWindowMinimize('aws')}
              onMaximize={() => toggleWindowMaximize('aws')}
              onFocus={() => focusWindow('aws')}
              theme="light"
              defaultWidth={880}
              defaultHeight={540}
            >
              <AwsApp 
                initialSubPath={activeSubPaths.aws}
                onPathChange={(subpath) => handleSubPathChange('aws', subpath)}
              />
            </WindowFrame>
          )}

          {/* Azure Cloud Console */}
          {windows.find(w => w.id === 'azure')?.isOpen && (
            <WindowFrame
              id="azure"
              title="Azure Cloud Console"
              isOpen={windows.find(w => w.id === 'azure')?.isOpen || false}
              isMinimized={windows.find(w => w.id === 'azure')?.isMinimized || false}
              isMaximized={windows.find(w => w.id === 'azure')?.isMaximized || false}
              zIndex={windows.find(w => w.id === 'azure')?.zIndex || 2}
              onClose={() => closeWindow('azure')}
              onMinimize={() => toggleWindowMinimize('azure')}
              onMaximize={() => toggleWindowMaximize('azure')}
              onFocus={() => focusWindow('azure')}
              theme="light"
              defaultWidth={880}
              defaultHeight={540}
            >
              <AzureApp 
                initialSubPath={activeSubPaths.azure}
                onPathChange={(subpath) => handleSubPathChange('azure', subpath)}
              />
            </WindowFrame>
          )}

          {/* Docker Hub */}
          {windows.find(w => w.id === 'docker')?.isOpen && (
            <WindowFrame
              id="docker"
              title="Docker Containerizer"
              isOpen={windows.find(w => w.id === 'docker')?.isOpen || false}
              isMinimized={windows.find(w => w.id === 'docker')?.isMinimized || false}
              isMaximized={windows.find(w => w.id === 'docker')?.isMaximized || false}
              zIndex={windows.find(w => w.id === 'docker')?.zIndex || 2}
              onClose={() => closeWindow('docker')}
              onMinimize={() => toggleWindowMinimize('docker')}
              onMaximize={() => toggleWindowMaximize('docker')}
              onFocus={() => focusWindow('docker')}
              theme="dark"
              defaultWidth={800}
              defaultHeight={500}
            >
              <DockerApp 
                initialSubPath={activeSubPaths.docker}
                onPathChange={(subpath) => handleSubPathChange('docker', subpath)}
              />
            </WindowFrame>
          )}

          {/* Kubernetes */}
          {windows.find(w => w.id === 'kubernetes')?.isOpen && (
            <WindowFrame
              id="kubernetes"
              title="Kubernetes Orchestrator"
              isOpen={windows.find(w => w.id === 'kubernetes')?.isOpen || false}
              isMinimized={windows.find(w => w.id === 'kubernetes')?.isMinimized || false}
              isMaximized={windows.find(w => w.id === 'kubernetes')?.isMaximized || false}
              zIndex={windows.find(w => w.id === 'kubernetes')?.zIndex || 2}
              onClose={() => closeWindow('kubernetes')}
              onMinimize={() => toggleWindowMinimize('kubernetes')}
              onMaximize={() => toggleWindowMaximize('kubernetes')}
              onFocus={() => focusWindow('kubernetes')}
              theme="dark"
              defaultWidth={820}
              defaultHeight={520}
            >
              <KubernetesApp 
                initialSubPath={activeSubPaths.kubernetes}
                onPathChange={(subpath) => handleSubPathChange('kubernetes', subpath)}
              />
            </WindowFrame>
          )}

          {/* System Monitor */}
          {windows.find(w => w.id === 'monitoring')?.isOpen && (
            <WindowFrame
              id="monitoring"
              title="System Monitor Live Telemetry"
              isOpen={windows.find(w => w.id === 'monitoring')?.isOpen || false}
              isMinimized={windows.find(w => w.id === 'monitoring')?.isMinimized || false}
              isMaximized={windows.find(w => w.id === 'monitoring')?.isMaximized || false}
              zIndex={windows.find(w => w.id === 'monitoring')?.zIndex || 2}
              onClose={() => closeWindow('monitoring')}
              onMinimize={() => toggleWindowMinimize('monitoring')}
              onMaximize={() => toggleWindowMaximize('monitoring')}
              onFocus={() => focusWindow('monitoring')}
              theme="dark"
              defaultWidth={820}
              defaultHeight={520}
            >
              <SystemMonitorApp />
            </WindowFrame>
          )}

          {/* AI Assistant */}
          {windows.find(w => w.id === 'aiassistant')?.isOpen && (
            <WindowFrame
              id="aiassistant"
              title="AI Assistant Co-Pilot"
              isOpen={windows.find(w => w.id === 'aiassistant')?.isOpen || false}
              isMinimized={windows.find(w => w.id === 'aiassistant')?.isMinimized || false}
              isMaximized={windows.find(w => w.id === 'aiassistant')?.isMaximized || false}
              zIndex={windows.find(w => w.id === 'aiassistant')?.zIndex || 2}
              onClose={() => closeWindow('aiassistant')}
              onMinimize={() => toggleWindowMinimize('aiassistant')}
              onMaximize={() => toggleWindowMaximize('aiassistant')}
              onFocus={() => focusWindow('aiassistant')}
              theme="dark"
              defaultWidth={720}
              defaultHeight={480}
            >
              <AiAssistantApp />
            </WindowFrame>
          )}

          {/* GitHub Integration */}
          {windows.find(w => w.id === 'github')?.isOpen && (
            <WindowFrame
              id="github"
              title="Git Adapter Repository"
              isOpen={windows.find(w => w.id === 'github')?.isOpen || false}
              isMinimized={windows.find(w => w.id === 'github')?.isMinimized || false}
              isMaximized={windows.find(w => w.id === 'github')?.isMaximized || false}
              zIndex={windows.find(w => w.id === 'github')?.zIndex || 2}
              onClose={() => closeWindow('github')}
              onMinimize={() => toggleWindowMinimize('github')}
              onMaximize={() => toggleWindowMaximize('github')}
              onFocus={() => focusWindow('github')}
              theme="dark"
              defaultWidth={800}
              defaultHeight={500}
            >
              <GitApp />
            </WindowFrame>
          )}

          {/* VS Code Editor */}
          {windows.find(w => w.id === 'vscode')?.isOpen && (
            <WindowFrame
              id="vscode"
              title="VS Code Editor"
              isOpen={windows.find(w => w.id === 'vscode')?.isOpen || false}
              isMinimized={windows.find(w => w.id === 'vscode')?.isMinimized || false}
              isMaximized={windows.find(w => w.id === 'vscode')?.isMaximized || false}
              zIndex={windows.find(w => w.id === 'vscode')?.zIndex || 2}
              onClose={() => closeWindow('vscode')}
              onMinimize={() => toggleWindowMinimize('vscode')}
              onMaximize={() => toggleWindowMaximize('vscode')}
              onFocus={() => focusWindow('vscode')}
              theme="dark"
              defaultWidth={900}
              defaultHeight={560}
            >
              <VscodeApp />
            </WindowFrame>
          )}

          {/* Firefox Web Browser */}
          {windows.find(w => w.id === 'browser')?.isOpen && (
            <WindowFrame
              id="browser"
              title="Firefox Web Browser"
              isOpen={windows.find(w => w.id === 'browser')?.isOpen || false}
              isMinimized={windows.find(w => w.id === 'browser')?.isMinimized || false}
              isMaximized={windows.find(w => w.id === 'browser')?.isMaximized || false}
              zIndex={windows.find(w => w.id === 'browser')?.zIndex || 2}
              onClose={() => closeWindow('browser')}
              onMinimize={() => toggleWindowMinimize('browser')}
              onMaximize={() => toggleWindowMaximize('browser')}
              onFocus={() => focusWindow('browser')}
              theme="light"
              defaultWidth={850}
              defaultHeight={520}
            >
              <BrowserApp />
            </WindowFrame>
          )}

          {/* Terraform Provisioner */}
          {windows.find(w => w.id === 'terraform')?.isOpen && (
            <WindowFrame
              id="terraform"
              title="Terraform Provisioner"
              isOpen={windows.find(w => w.id === 'terraform')?.isOpen || false}
              isMinimized={windows.find(w => w.id === 'terraform')?.isMinimized || false}
              isMaximized={windows.find(w => w.id === 'terraform')?.isMaximized || false}
              zIndex={windows.find(w => w.id === 'terraform')?.zIndex || 2}
              onClose={() => closeWindow('terraform')}
              onMinimize={() => toggleWindowMinimize('terraform')}
              onMaximize={() => toggleWindowMaximize('terraform')}
              onFocus={() => focusWindow('terraform')}
              theme="dark"
              defaultWidth={840}
              defaultHeight={520}
            >
              <TerraformApp />
            </WindowFrame>
          )}
        </div>
      </div>

      {/* 5. GNOME App Drawer Overlay (Full screen apps matrix) */}
      <AnimatePresence>
        {showAppDrawer && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 bg-[#2c001e]/90 backdrop-blur-xl z-50 flex items-center justify-center p-8 select-none"
          >
            {/* Close button */}
            <button 
              onClick={() => setShowAppDrawer(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <Power className="w-6 h-6 text-red-500" />
            </button>

            <div className="max-w-4xl w-full text-center space-y-12">
              {/* Search bar inside drawer */}
              <div className="relative max-w-md mx-auto">
                <Search className="w-5 h-5 text-slate-400 absolute left-4.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to search..."
                  className="w-full bg-[#111111]/70 border border-white/10 rounded-2xl pl-12 pr-4 py-2.5 text-sm outline-none text-white focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Apps grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-8">
                {dockItems.slice(1).map(app => (
                  <div
                    key={app.id}
                    onClick={() => openApp(app.id)}
                    className="flex flex-col items-center p-4 rounded-3xl hover:bg-white/10 cursor-pointer transition-all group"
                  >
                    <div className="mb-3.5 group-hover:scale-105 transition-transform duration-200">
                      {app.icon()}
                    </div>
                    <span className="text-xs font-bold text-slate-200">{app.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
