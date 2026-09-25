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
  FolderIcon,
  HardDrive
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
import SettingsApp, { OsSettings, DEFAULT_OS_SETTINGS } from './apps/SettingsApp';
import GrafanaApp from './apps/GrafanaApp';

import {
  DockerLogo,
  KubernetesLogo,
  GrafanaLogo,
  VscodeLogo,
  AwsLogo,
  AzureLogo,
  TerraformLogo,
  GithubLogo,
  FirefoxLogo,
  NautilusLogo,
  TerminalLogo,
  DashboardLogo,
  AiAssistantLogo,
  SettingsLogo,
} from './icons/RealBrandLogos';

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

  // Desktop Right-Click Context Menu State
  const [desktopContextMenu, setDesktopContextMenu] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0
  });

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    // Only open if right-clicking the desktop wallpaper directly
    const target = e.target as HTMLElement;
    if (target.closest('.window-frame') || target.closest('button') || target.closest('input')) {
      return;
    }
    e.preventDefault();
    let x = e.clientX;
    let y = e.clientY;
    if (typeof window !== 'undefined') {
      if (x + 220 > window.innerWidth) x = window.innerWidth - 230;
      if (y + 250 > window.innerHeight) y = window.innerHeight - 260;
    }
    setDesktopContextMenu({ visible: true, x, y });
  };

  // Windows State Array
  const [windows, setWindows] = useState<AppWindow[]>([
    { id: 'terminal', title: 'linux@caelum-os:~ (Terminal)', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, theme: 'dark', width: 700, height: 440 },
    { id: 'nautilus', title: 'Files (Nautilus Manager)', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 4, theme: 'light', width: 750, height: 460 },
    { id: 'dashboard', title: 'System Deploy Dashboard', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 5, theme: 'light', width: 900, height: 560 },
    { id: 'aws', title: 'AWS Cloud Console', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'light', width: 880, height: 540 },
    { id: 'azure', title: 'Azure Cloud Console', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'light', width: 880, height: 540 },
    { id: 'docker', title: 'Docker Containerizer', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'dark', width: 800, height: 500 },
    { id: 'kubernetes', title: 'Kubernetes Orchestrator', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'dark', width: 820, height: 520 },
    { id: 'monitoring', title: 'Grafana Observability', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'dark', width: 880, height: 560 },
    { id: 'grafana', title: 'Grafana Observability', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'dark', width: 880, height: 560 },
    { id: 'aiassistant', title: 'AI Assistant Co-Pilot', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'dark', width: 720, height: 480 },
    { id: 'github', title: 'GitHub Workspace', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'dark', width: 880, height: 560 },
    { id: 'vscode', title: 'VS Code Editor', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'dark', width: 900, height: 560 },
    { id: 'browser', title: 'Firefox Web Browser', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'light', width: 850, height: 520 },
    { id: 'terraform', title: 'Terraform Provisioner', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'dark', width: 840, height: 520 },
    { id: 'settings', title: 'Settings', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 2, theme: 'dark', width: 920, height: 580 },
  ]);

  const [topZIndex, setTopZIndex] = useState(11);

  // OS Global Settings State (persists to localStorage)
  const [osSettings, setOsSettings] = useState<OsSettings>(DEFAULT_OS_SETTINGS);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('caelum_os_settings');
        if (saved) {
          setOsSettings(prev => ({ ...DEFAULT_OS_SETTINGS, ...JSON.parse(saved) }));
        }
      } catch {}
    }
  }, []);

  const handleUpdateSettings = (updater: (prev: OsSettings) => OsSettings) => {
    setOsSettings(prev => {
      const next = updater(prev);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('caelum_os_settings', JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  // Sync route path to Window opening state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname;
    if (!path || path === '/' || path === '/os') return;
    const parts = path.split('/').filter(p => p && p !== 'os');
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
      if (!path || path === '/' || path === '/os') return;
      const parts = path.split('/').filter(p => p && p !== 'os');
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

  // Dismiss Desktop Context Menu on global click or Escape
  useEffect(() => {
    const handleGlobalClick = () => {
      setDesktopContextMenu(prev => ({ ...prev, visible: false }));
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDesktopContextMenu(prev => ({ ...prev, visible: false }));
      }
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
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
      window.history.pushState(null, '', '/os');
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
    { 
      id: 'launcher', 
      name: 'Dashboard', 
      icon: () => (
        <div className="w-9 h-9 bg-[#321768]/80 border border-purple-500/30 rounded-xl flex items-center justify-center overflow-hidden shadow-xs hover:scale-105 transition-transform">
          <img src="/branding/caelumos-icon.png" alt="CaelumOS" className="w-6.5 h-6.5 object-contain" />
        </div>
      ) 
    },
    { 
      id: 'terminal', 
      name: 'Terminal', 
      icon: () => (
        <div className="w-9 h-9 bg-neutral-900 border border-neutral-700/60 rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-xs">
          <TerminalLogo className="w-6 h-6" />
        </div>
      ) 
    },
    { 
      id: 'nautilus', 
      name: 'Files', 
      icon: () => (
        <div className="w-9 h-9 bg-neutral-900 border border-neutral-700/60 rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-xs">
          <NautilusLogo className="w-6 h-6" />
        </div>
      ) 
    },
    { 
      id: 'dashboard', 
      name: 'Deploy', 
      icon: () => (
        <div className="w-9 h-9 bg-purple-950/60 border border-purple-500/35 rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-xs">
          <DashboardLogo className="w-6 h-6" />
        </div>
      ) 
    },
    { 
      id: 'aws', 
      name: 'AWS', 
      icon: () => (
        <div className="w-9 h-9 bg-[#232f3e] border border-white/10 rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-xs">
          <AwsLogo className="w-6.5 h-6.5" />
        </div>
      ) 
    },
    { 
      id: 'azure', 
      name: 'Azure', 
      icon: () => (
        <div className="w-9 h-9 bg-[#0078d4]/15 border border-[#0078d4]/30 rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-xs">
          <AzureLogo className="w-6 h-6" />
        </div>
      ) 
    },
    { 
      id: 'docker', 
      name: 'Docker', 
      icon: () => (
        <div className="w-9 h-9 bg-[#0db7ed]/15 border border-[#0db7ed]/30 rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-xs">
          <DockerLogo className="w-6 h-6" />
        </div>
      ) 
    },
    { 
      id: 'kubernetes', 
      name: 'Kubernetes', 
      icon: () => (
        <div className="w-9 h-9 bg-[#326ce5]/15 border border-[#326ce5]/30 rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-xs">
          <KubernetesLogo className="w-6 h-6" />
        </div>
      ) 
    },
    { 
      id: 'terraform', 
      name: 'Terraform', 
      icon: () => (
        <div className="w-9 h-9 bg-[#844fba]/15 border border-[#844fba]/30 rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-xs">
          <TerraformLogo className="w-6 h-6" />
        </div>
      ) 
    },
    { 
      id: 'github', 
      name: 'GitHub', 
      icon: () => (
        <div className="w-9 h-9 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-xs">
          <GithubLogo className="w-5.5 h-5.5" />
        </div>
      ) 
    },
    { 
      id: 'vscode', 
      name: 'VS Code', 
      icon: () => (
        <div className="w-9 h-9 bg-[#007acc]/15 border border-[#007acc]/30 rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-xs">
          <VscodeLogo className="w-6 h-6" />
        </div>
      ) 
    },
    { 
      id: 'monitoring', 
      name: 'Grafana', 
      icon: () => (
        <div className="w-9 h-9 bg-[#f26522]/15 border border-[#f26522]/30 rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-xs">
          <GrafanaLogo className="w-6 h-6" />
        </div>
      ) 
    },
    { 
      id: 'aiassistant', 
      name: 'AI Copilot', 
      icon: () => (
        <div className="w-9 h-9 bg-purple-600/15 border border-purple-500/30 rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-xs">
          <AiAssistantLogo className="w-6 h-6" />
        </div>
      ) 
    },
    { 
      id: 'browser', 
      name: 'Browser', 
      icon: () => (
        <div className="w-9 h-9 bg-[#005af0]/15 border border-[#005af0]/30 rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-xs">
          <FirefoxLogo className="w-6 h-6" />
        </div>
      ) 
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      icon: () => (
        <div className="w-9 h-9 bg-neutral-900 border border-neutral-700/60 rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-xs">
          <SettingsLogo className="w-6 h-6" />
        </div>
      ) 
    },
    { 
      id: 'profile', 
      name: 'Profile', 
      icon: () => (
        <div className="w-9 h-9 bg-neutral-900 border border-neutral-700/60 rounded-xl flex items-center justify-center text-slate-350 hover:scale-105 transition-transform shadow-xs">
          <User className="w-5 h-5" />
        </div>
      ) 
    },
    { 
      id: 'logout', 
      name: 'Power / Logout', 
      icon: () => (
        <div className="w-9 h-9 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500 hover:scale-105 transition-transform shadow-xs">
          <Power className="w-4.5 h-4.5" />
        </div>
      ) 
    }
  ];

  const handleDockItemClick = (id: string) => {
    if (id === 'launcher') {
      setShowAppDrawer(!showAppDrawer);
      return;
    }
    if (id === 'profile') {
      openApp('settings');
      return;
    }
    if (id === 'logout') {
      alert('Logging out of CaelumOS...');
      if (typeof window !== 'undefined') {
        window.location.href = '/';
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

  const wallpaperClasses: Record<string, string> = {
    aubergine: 'bg-gradient-to-br from-[#4f1836] via-[#2c001e] to-[#77216f]',
    nebula: 'bg-gradient-to-br from-[#0b1021] via-[#1a1c4b] to-[#2d1b4e]',
    matrix: 'bg-gradient-to-br from-[#030712] via-[#0f172a] to-[#1e293b]',
    cyber: 'bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#3f3f46]',
    emerald: 'bg-gradient-to-br from-[#064e3b] via-[#022c22] to-[#0f172a]'
  };

  const currentBgClass = wallpaperClasses[osSettings.wallpaper] || wallpaperClasses.aubergine;

  return (
    <div 
      onContextMenu={handleDesktopContextMenu}
      className={`w-full h-full relative overflow-hidden ${currentBgClass} select-none font-sans text-slate-200 transition-all duration-500`}
    >
      
      {/* Night Light Eye Comfort Warmth Overlay */}
      {osSettings.nightLight && (
        <div 
          className="absolute inset-0 pointer-events-none z-50 transition-opacity duration-300"
          style={{ 
            backgroundColor: `rgba(245, 158, 11, ${Math.min(0.32, (osSettings.nightLightWarmth / 100) * 0.32)})`,
            mixBlendMode: 'multiply'
          }}
        />
      )}

      {/* 1. GNOME Top Panel Header Bar */}
      <div className="absolute top-0 left-0 right-0 h-7 bg-neutral-950/85 border-b border-white/5 flex items-center justify-between px-4 z-40 text-xs font-medium">
        {/* Left Activities menu */}
        <div className="flex items-center space-x-3">
          <div 
            onClick={() => setShowAppDrawer(!showAppDrawer)}
            className="flex items-center space-x-1.5 cursor-pointer group"
          >
            <img src="/branding/caelumos-icon.png" alt="CaelumOS" className="w-3.5 h-3.5 rounded object-contain group-hover:scale-110 transition-transform" />
            <span className="group-hover:text-white font-bold text-[11px] text-slate-200">Activities</span>
          </div>
          <a
            href="/"
            className="text-[10px] text-slate-400 hover:text-cyan-400 font-mono flex items-center space-x-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 transition-colors"
            title="Return to CaelumOS Website"
          >
            <span>&larr; caleum.me</span>
          </a>
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
            className="absolute top-8 right-3 w-64 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-xl p-4 shadow-2xl z-50 text-xs space-y-4"
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
            <div className="pt-2 border-t border-neutral-800">
              <button
                onClick={() => {
                  setShowSettingsDropdown(false);
                  openApp('settings');
                }}
                className="py-1.5 px-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-slate-300 hover:text-white transition-colors flex items-center space-x-2 text-xs font-semibold cursor-pointer w-full justify-center"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>Open Settings</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Ubuntu Dock (Configurable: Left / Bottom / Right) */}
      <div className={`absolute z-30 shadow-2xl backdrop-blur-md border border-white/10 rounded-2xl transition-all duration-300 ${
        osSettings.dockPosition === 'bottom'
          ? 'bottom-2 left-1/2 -translate-x-1/2 h-16 max-w-[95vw] bg-[#111111]/80 flex flex-row items-center px-4 justify-between space-x-4'
          : osSettings.dockPosition === 'right'
          ? 'right-2 top-9 bottom-2 w-16 bg-[#111111]/80 flex flex-col items-center py-4 justify-between'
          : 'left-2 top-9 bottom-2 w-16 bg-[#111111]/80 flex flex-col items-center py-4 justify-between'
      } ${osSettings.dockAutoHide ? 'opacity-30 hover:opacity-100 transition-opacity' : ''}`}>
        <div className={`flex items-center space-x-2 ${osSettings.dockPosition === 'bottom' ? 'flex-row' : 'flex-col space-y-2.5 space-x-0 w-full'}`}>
          {dockItems.slice(0, dockItems.findIndex(i => i.id === 'settings')).map(item => {
            const win = windows.find(w => w.id === item.id);
            return (
              <div key={item.id} className="relative group flex justify-center">
                {/* Active application dot on dock */}
                {win?.isOpen && (
                  <span className={`absolute rounded-full bg-white shadow shadow-white ${
                    osSettings.dockPosition === 'bottom' ? 'bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1' : 'left-1.5 top-[18px] w-1 h-1.5'
                  }`} />
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

        {/* Bottom / End Dock segment */}
        <div className={`flex items-center space-x-2 ${osSettings.dockPosition === 'bottom' ? 'flex-row' : 'flex-col space-y-2.5 space-x-0 w-full'}`}>
          {dockItems.slice(dockItems.findIndex(i => i.id === 'settings')).map(item => {
            const win = windows.find(w => w.id === item.id);
            return (
              <div key={item.id} className="relative group flex justify-center">
                {win?.isOpen && (
                  <span className={`absolute rounded-full bg-white shadow shadow-white ${
                    osSettings.dockPosition === 'bottom' ? 'bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1' : 'left-1.5 top-[18px] w-1 h-1.5'
                  }`} />
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
      </div>

      {/* 4. Windows floating layer container */}
      <div className={`absolute top-7 z-20 overflow-hidden pointer-events-none ${
        osSettings.dockPosition === 'left' ? 'left-[76px] right-0 bottom-0' :
        osSettings.dockPosition === 'right' ? 'left-0 right-[76px] bottom-0' :
        'left-0 right-0 bottom-[76px]'
      }`}>
        <div className="relative w-full h-full pointer-events-auto">
          {/* Terminal */}
          {windows.find(w => w.id === 'terminal')?.isOpen && (
            <WindowFrame
              id="terminal"
              title="linux@caelum-os:~ (Terminal)"
              icon={<TerminalLogo className="w-4 h-4" />}
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
              icon={<NautilusLogo className="w-4 h-4" />}
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
              <NautilusApp onOpenApp={openApp} />
            </WindowFrame>
          )}

          {/* Dashboard */}
          {windows.find(w => w.id === 'dashboard')?.isOpen && (
            <WindowFrame
              id="dashboard"
              title="Deploy Summary Dashboard"
              icon={<DashboardLogo className="w-4 h-4" />}
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
              icon={<AwsLogo className="w-4.5 h-4.5" />}
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
              icon={<AzureLogo className="w-4 h-4" />}
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
              icon={<DockerLogo className="w-4.5 h-4.5" />}
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
              icon={<KubernetesLogo className="w-4.5 h-4.5" />}
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

          {/* Grafana Observability */}
          {(windows.find(w => w.id === 'monitoring')?.isOpen || windows.find(w => w.id === 'grafana')?.isOpen) && (
            <WindowFrame
              id="monitoring"
              title="Grafana Observability"
              icon={<GrafanaLogo className="w-4.5 h-4.5" />}
              isOpen={windows.find(w => w.id === 'monitoring')?.isOpen || windows.find(w => w.id === 'grafana')?.isOpen || false}
              isMinimized={windows.find(w => w.id === 'monitoring')?.isMinimized || windows.find(w => w.id === 'grafana')?.isMinimized || false}
              isMaximized={windows.find(w => w.id === 'monitoring')?.isMaximized || windows.find(w => w.id === 'grafana')?.isMaximized || false}
              zIndex={Math.max(windows.find(w => w.id === 'monitoring')?.zIndex || 2, windows.find(w => w.id === 'grafana')?.zIndex || 2)}
              onClose={() => { closeWindow('monitoring'); closeWindow('grafana'); }}
              onMinimize={() => { toggleWindowMinimize('monitoring'); toggleWindowMinimize('grafana'); }}
              onMaximize={() => { toggleWindowMaximize('monitoring'); toggleWindowMaximize('grafana'); }}
              onFocus={() => { focusWindow('monitoring'); focusWindow('grafana'); }}
              theme="dark"
              defaultWidth={920}
              defaultHeight={580}
            >
              <GrafanaApp />
            </WindowFrame>
          )}

          {/* AI Assistant */}
          {windows.find(w => w.id === 'aiassistant')?.isOpen && (
            <WindowFrame
              id="aiassistant"
              title="AI Assistant Co-Pilot"
              icon={<AiAssistantLogo className="w-4.5 h-4.5" />}
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
              title="GitHub Workspace"
              icon={<GithubLogo className="w-4 h-4" />}
              isOpen={windows.find(w => w.id === 'github')?.isOpen || false}
              isMinimized={windows.find(w => w.id === 'github')?.isMinimized || false}
              isMaximized={windows.find(w => w.id === 'github')?.isMaximized || false}
              zIndex={windows.find(w => w.id === 'github')?.zIndex || 2}
              onClose={() => closeWindow('github')}
              onMinimize={() => toggleWindowMinimize('github')}
              onMaximize={() => toggleWindowMaximize('github')}
              onFocus={() => focusWindow('github')}
              theme="dark"
              defaultWidth={880}
              defaultHeight={560}
            >
              <GitApp />
            </WindowFrame>
          )}

          {/* VS Code Editor */}
          {windows.find(w => w.id === 'vscode')?.isOpen && (
            <WindowFrame
              id="vscode"
              title="VS Code Editor"
              icon={<VscodeLogo className="w-4.5 h-4.5" />}
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
              icon={<FirefoxLogo className="w-4.5 h-4.5" />}
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
              icon={<TerraformLogo className="w-4.5 h-4.5" />}
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

          {/* Settings Application */}
          {windows.find(w => w.id === 'settings')?.isOpen && (
            <WindowFrame
              id="settings"
              title="Settings"
              icon={<SettingsLogo className="w-4.5 h-4.5" />}
              isOpen={windows.find(w => w.id === 'settings')?.isOpen || false}
              isMinimized={windows.find(w => w.id === 'settings')?.isMinimized || false}
              isMaximized={windows.find(w => w.id === 'settings')?.isMaximized || false}
              zIndex={windows.find(w => w.id === 'settings')?.zIndex || 2}
              onClose={() => closeWindow('settings')}
              onMinimize={() => toggleWindowMinimize('settings')}
              onMaximize={() => toggleWindowMaximize('settings')}
              onFocus={() => focusWindow('settings')}
              theme={osSettings.themeMode}
              defaultWidth={920}
              defaultHeight={580}
            >
              <SettingsApp 
                settings={osSettings}
                onUpdateSettings={handleUpdateSettings}
              />
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
      
      {/* 6. Desktop Right-Click Context Menu */}
      {desktopContextMenu.visible && (
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{ top: `${desktopContextMenu.y}px`, left: `${desktopContextMenu.x}px` }}
          className="fixed z-50 w-52 bg-neutral-900/95 backdrop-blur-md text-slate-200 border border-neutral-700/80 rounded-xl shadow-2xl py-1 text-xs select-none animate-in fade-in duration-100"
        >
          <div 
            onClick={() => {
              setDesktopContextMenu(prev => ({ ...prev, visible: false }));
              openApp('nautilus');
            }}
            className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer"
          >
            <Folder className="w-3.5 h-3.5 text-amber-500" />
            <span>New Folder</span>
          </div>

          <div 
            onClick={() => {
              setDesktopContextMenu(prev => ({ ...prev, visible: false }));
              openApp('nautilus');
            }}
            className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer"
          >
            <NautilusLogo className="w-3.5 h-3.5" />
            <span>Open in Files</span>
          </div>

          <div 
            onClick={() => {
              setDesktopContextMenu(prev => ({ ...prev, visible: false }));
              openApp('terminal');
            }}
            className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer"
          >
            <TerminalLogo className="w-3.5 h-3.5" />
            <span>Open in Terminal</span>
          </div>

          <div 
            onClick={() => {
              setDesktopContextMenu(prev => ({ ...prev, visible: false }));
              openApp('vscode');
            }}
            className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer"
          >
            <VscodeLogo className="w-3.5 h-3.5" />
            <span>Open in VS Code</span>
          </div>

          <div className="h-px bg-neutral-800 my-1 mx-2" />

          <div 
            onClick={() => {
              setDesktopContextMenu(prev => ({ ...prev, visible: false }));
              openApp('settings');
            }}
            className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>Change Background...</span>
          </div>

          <div 
            onClick={() => {
              setDesktopContextMenu(prev => ({ ...prev, visible: false }));
              openApp('settings');
            }}
            className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>Display Settings...</span>
          </div>

          <div className="h-px bg-neutral-800 my-1 mx-2" />

          <div 
            onClick={() => {
              setDesktopContextMenu(prev => ({ ...prev, visible: false }));
              openApp('settings');
            }}
            className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer"
          >
            <SettingsLogo className="w-3.5 h-3.5" />
            <span>Settings</span>
          </div>
        </div>
      )}

    </div>
  );
}
