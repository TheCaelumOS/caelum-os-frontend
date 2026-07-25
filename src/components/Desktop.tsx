"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal as TermIcon, 
  Layout, 
  Trash2, 
  Grid, 
  Wifi, 
  Volume2, 
  Battery, 
  ChevronDown, 
  Search, 
  ShieldCheck, 
  TrendingDown, 
  Lock, 
  Zap, 
  Sliders,
  Power,
  Activity,
  X
} from 'lucide-react';
import WindowFrame from './WindowFrame';
import TerminalApp from './apps/TerminalApp';
import DashboardApp from './apps/DashboardApp';
import BrowserApp from './apps/BrowserApp';
import NautilusApp from './apps/NautilusApp';
import SystemMonitorApp from './apps/SystemMonitorApp';

// Brand SVG Logos
const TerraformLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path fill="#844FBA" d="M1.5 0h7v7h-7zM15.5 0h7v7h-7zM8.5 7h7v7h-7zM1.5 14h7v7h-7zM15.5 14h7v7h-7z" />
  </svg>
);

const DockerLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path fill="#0db7ed" d="M22.3 10.05c-.34-.73-.91-1.3-1.61-1.67-.18-.1-.38-.17-.58-.23a4.23 4.23 0 0 0-.28-1.57c-.24-.55-.65-1.02-1.18-1.32-.47-.27-1.02-.38-1.55-.32-.23-.83-.73-1.54-1.42-2-.68-.45-1.5-.64-2.3-.53h-.03v1.89h.03c.53-.06 1.08.06 1.53.36.42.28.71.72.82 1.22l.06.28.28.03c.66.08 1.25.46 1.58 1.04.18.32.28.69.29 1.06v.06h1.92v-.03c0-.12.02-.24.03-.36l.01-.22zM8.99 7.62h1.61v-1.6H8.99v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm-7.02 2.34h1.61v-1.6H6.65v1.6zm2.34 0h1.61v-1.6H8.99v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm-11.7 2.34h1.61v-1.6H4.31v1.6zm2.34 0h1.61v-1.6H6.65v1.6zm2.34 0h1.61v-1.6H8.99v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm-14.04 2.34c0 1.9 1.53 3.44 3.44 3.44h11.23c3.1 0 5.66-2.4 5.86-5.46.02-.3.17-.57.43-.73.66-.43 1.25-1.04 1.52-1.76.27-.72.11-1.5-.18-1.89-.46-.52-1.14-.82-1.81-.82-.09 0-.17.01-.26.02-.45.04-.84-.13-1.12-.48l-.51-.38-.51.38c-.28.35-.67.52-1.12.48a1.64 1.64 0 0 0-1.12.48l-.51.38v-4.3c0-.1-.08-.18-.18-.18H8.38c-.1 0-.18.08-.18.18v5.43c0 .1-.08.18-.18.18H6.41c-.1 0-.18-.08-.18-.18v-5.43c0-.1-.08-.18-.18-.18H4.44c-.1 0-.18.08-.18.18v5.43c0 .1-.08.18-.18.18H2.47c-.1 0-.18-.08-.18-.18v-3.25c0-.1-.08-.18-.18-.18H.3c-.1 0-.18.08-.18.18v1.36c0 1.9 1.53 3.44 3.44 3.44h1.76v-.06z" />
  </svg>
);

const KubernetesLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path fill="#326CE5" d="M12.44 2.1a1.23 1.23 0 00-.88 0L3.18 5.5a1.24 1.24 0 00-.73 1.05v9.9a1.24 1.24 0 00.73 1.05l8.38 3.4a1.23 1.23 0 00.88 0l8.38-3.4a1.24 1.24 0 00.73-1.05v-9.9a1.24 1.24 0 00-.73-1.05z" />
    <path fill="#FFFFFF" d="M12 4.45l6.53 2.65v2.96L12 7.42zm-6.53 2.65L12 4.45v2.97L5.47 10.06zM4.65 8.9v6.2l3.4-1.38V7.52zm4.24 4.9L12 12.46l3.11 1.26v2.96L12 15.42zm4.23-1.34L19.35 8.9V13.8l-3.4 1.38zm7.34 2.74l-6.53 2.65v-2.96l6.53-2.65zm-16.92 0L12 18.06V20.7l-6.53-2.65zm6.53-5.26v2.96L5.47 12.8v-2.96z" />
  </svg>
);

const AwsLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className}>
    <path fill="#FF9900" d="M25 21.2c-3.1 2.2-7.5 3.3-11.8 3.3-6 0-11-2.2-13.8-5.6-.4-.5 0-1.1.5-.8 4.3 2.3 9.6 3.6 15 3.6 4.4 0 9.2-.9 12.6-2.8.7-.4 1.1.3.4.8z" />
    <path fill="#FF9900" d="M26 19.4c-.3-.4-1.1-.1-1.5.1-.4.3-.3 1.1.1 1.4.7.4 1.5 1 1.6.4.3-.4-.9-1.5-.9-1.9z" />
  </svg>
);

const AzureLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 128 128" className={className}>
    <path fill="#0078d4" d="M10.8 108.8L63.3 22l43.5 28.5L63.3 83.3z" />
    <path fill="#50e6ff" d="M117.2 108.8H10.8l52.5-25.5z" />
  </svg>
);

const GithubLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-white`}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
  </svg>
);

const GrafanaLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 50 50" className={className}>
    <path fill="#F26522" d="M25 5C14 5 5 14 5 25s9 20 20 20 20-9 20-20S36 5 25 5zm5.5 30.5c-3 .5-6-1.5-6.5-4.5s1.5-6 4.5-6.5 6 1.5 6.5 4.5-1.5 6-4.5 6.5zm3.8-13.8c-2 2-5 1-7-1s-3-5-1-7 5-1 7 1 3 5 1 7z" />
  </svg>
);

const PrometheusLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path fill="#E6522C" d="M12.02 0a12 12 0 1011.98 12c0-2.85-.99-5.46-2.65-7.53L19.8 6.02A9.5 9.5 0 0121.5 12a9.5 9.5 0 11-16.7-6.27l1.7-1.46c.14-.12.33-.12.47.01l1.58 1.48c.15.14.39.1.48-.09a3.7 3.7 0 015.65-1.12l1.62-1.39C14.6 2.05 13.34 1.44 12.02.04v-.04z" />
    <path fill="#FF7800" d="M10.8 14.88c-.65-.63-.98-1.5-.98-2.6 0-1.11.33-1.98.98-2.62s1.55-.96 2.7-.96 2.06.32 2.7.96.98 1.5.98 2.61c0 1.11-.33 1.98-.98 2.61s-1.55.96-2.7.96-2.05-.32-2.7-.96z" />
  </svg>
);

// 9. Firefox Logo SVG
const FirefoxLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <circle cx="12" cy="12" r="10" fill="#2563eb" />
    <path fill="#ea580c" d="M12 2a10 10 0 0110 10c0 4.1-2.5 7.6-6.1 9.1-.5.2-1-.2-.8-.7a6 6 0 00.9-3.2c0-3.3-2.7-6-6-6s-6 2.7-6 6c0 1.2.3 2.3.9 3.2.2.5-.3.9-.8.7A10 10 0 012 12c0-5.5 4.5-10 10-10z" />
    <path fill="#f97316" d="M14 6a4 4 0 00-4 4c0 .8.2 1.5.6 2.1l-.8.8A5 5 0 018 10a6 6 0 016-6c1.1 0 2.1.3 3 .8l-.8.8c-.6-.4-1.3-.6-2.2-.6z" />
    <path fill="#facc15" d="M16.5 7.5A8 8 0 0012 4v4a4 4 0 014.5-3.5z" />
  </svg>
);

// 10. Nautilus Orange Folder Logo SVG
const NautilusLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="folderGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#c2410c" />
      </linearGradient>
    </defs>
    <path fill="url(#folderGrad)" d="M2 4a2 2 0 012-2h4l2 3h10a2 2 0 012 2v11a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" />
    <path fill="#ea580c" opacity="0.6" d="M2 7h20v1H2z" />
  </svg>
);

// 11. GNOME System Monitor Logo SVG
const SysMonitorLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    {/* Dark rounded squircle base */}
    <rect x="2" y="2" width="20" height="20" rx="5" fill="#1e1e24" stroke="#2d2d3a" strokeWidth="1" />
    
    {/* Concentric resource gauge tracks */}
    <circle cx="12" cy="12" r="7" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1.4" fill="none" />
    <circle cx="12" cy="12" r="4.8" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="1.4" fill="none" />
    
    {/* Colored gauge value arcs */}
    <path d="M 12 5 A 7 7 0 0 1 19 12" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M 12 7.2 A 4.8 4.8 0 0 1 16.8 12" stroke="#10b981" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    
    {/* Oscilloscope heartbeat signal */}
    <path d="M 4 12 h 3.5 l 1.2 -4.5 l 1.3 8.5 l 1.2 -6 l 1.3 3.5 h 4" stroke="#06b6d4" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// System Icon Theme Wrappers
const TerminalIcon = ({ className = "w-11 h-11" }: { className?: string }) => (
  <div className={`${className} bg-neutral-900 border border-neutral-700/60 rounded-2xl flex items-center justify-center text-emerald-450 shadow-md`}>
    <TermIcon className="w-6 h-6" />
  </div>
);

const SecurityIcon = ({ className = "w-11 h-11" }: { className?: string }) => (
  <div className={`${className} bg-purple-950/60 border border-purple-500/35 rounded-2xl flex items-center justify-center text-purple-300 shadow-md`}>
    <ShieldCheck className="w-6 h-6" />
  </div>
);

const CostIcon = ({ className = "w-11 h-11" }: { className?: string }) => (
  <div className={`${className} bg-rose-950/60 border border-rose-500/35 rounded-2xl flex items-center justify-center text-rose-300 shadow-md`}>
    <TrendingDown className="w-6 h-6" />
  </div>
);

const IdentityIcon = ({ className = "w-11 h-11" }: { className?: string }) => (
  <div className={`${className} bg-blue-950/60 border border-blue-500/35 rounded-2xl flex items-center justify-center text-blue-300 shadow-md`}>
    <Lock className="w-6 h-6" />
  </div>
);

const AutomationsIcon = ({ className = "w-11 h-11" }: { className?: string }) => (
  <div className={`${className} bg-amber-950/60 border border-amber-500/35 rounded-2xl flex items-center justify-center text-amber-300 shadow-md`}>
    <Zap className="w-6 h-6" />
  </div>
);

const SettingsIcon = ({ className = "w-11 h-11" }: { className?: string }) => (
  <div className={`${className} bg-neutral-800 border border-neutral-700/60 rounded-2xl flex items-center justify-center text-slate-300 shadow-md`}>
    <Sliders className="w-6 h-6" />
  </div>
);

// Window state structure
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

// 6. Interactive Canvas Particle network representing a glowing K8s Topology cluster
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

function CanvasTopology() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Initialize 60 node cluster particles
    const particles: Particle[] = [];
    for (let i = 0; i < 55; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1.5
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Particle physics & nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce borders
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Repel from mouse pointer
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.x -= (dx / dist) * force * 2.2;
          p.y -= (dy / dist) * force * 2.2;
        }

        // Draw particle nodes
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.45)'; // purple theme glow
        ctx.fill();

        // Connect nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distance = Math.hypot(p2.x - p.x, p2.y - p.y);
          if (distance < 95) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.18 * (1 - distance / 95)})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-40" />;
}

// OS Notification toast interface
interface OSNotification {
  id: string;
  title: string;
  message: string;
  type: 'k8s' | 'security' | 'info';
}

export default function Desktop() {
  // Current System Date/Time
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      };
      setTimeStr(date.toLocaleDateString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 1. Fake Linux Boot Sequence State
  const [isBooting, setIsBooting] = useState(true);
  const [bootLogList, setBootLogList] = useState<string[]>([]);
  const bootLogsTemplate = [
    "Initializing CaelumOS Bootloader v2.1...",
    "[  OK  ] Started CaelumOS AI Kernel Adapter Daemon.",
    "[  OK  ] Mounted private IAM namespace system vaults.",
    "[  OK  ] Initializing systemd loopback sockets.",
    "[  OK  ] Started static policy security guards.",
    "[  OK  ] Connected AWS us-east-1 credential endpoints.",
    "[  OK  ] Connected Azure ARM template deployment tunnels.",
    "[  OK  ] Loaded Terraform Plan configuration matrices.",
    "[  OK  ] Started Docker virtualized container engine.",
    "[  OK  ] Initialized Kubernetes node clustering master nodes.",
    "[  OK  ] Started Grafana and Prometheus monitor scrapers.",
    "[  OK  ] Loading GNOME Desktop environments...",
    "Booting complete. Welcome to CaelumOS."
  ];

  useEffect(() => {
    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < bootLogsTemplate.length) {
        const nextLog = bootLogsTemplate[logIndex];
        setBootLogList(prev => [...prev, nextLog]);
        logIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsBooting(false);
        }, 400);
      }
    }, 150); // ~2 seconds total for boot sequence
    return () => clearInterval(interval);
  }, []);

  // 5. Environment Workspaces switcher states
  const [activeWorkspace, setActiveWorkspace] = useState(0); // 0: Dev, 1: Staging, 2: Prod

  const getWorkspaceFilter = () => {
    if (activeWorkspace === 0) return 'none';
    if (activeWorkspace === 1) return 'hue-rotate(210deg) saturate(0.85) brightness(0.95)'; // Ocean blue
    return 'hue-rotate(320deg) saturate(1.25) brightness(0.9)'; // Warning Crimson Red
  };

  // 7. Ubuntu/GNOME Style notifications dropdown system
  const [notifications, setNotifications] = useState<OSNotification[]>([]);
  useEffect(() => {
    if (isBooting) return;

    // Trigger notification alert exactly 5 seconds after desktop loads
    const timer = setTimeout(() => {
      setNotifications(prev => [
        ...prev,
        {
          id: 'k8s-alert-success',
          title: 'Deployment Successful',
          message: 'k8s-caelum-cluster-1 is now online and healthy (3/3 pods running).',
          type: 'k8s'
        }
      ]);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isBooting]);

  // 2. Right-Click Context Menu State
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  useEffect(() => {
    const closeMenu = () => setContextMenu(prev => prev.show ? { ...prev, show: false } : prev);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY
    });
  };



  // Window Manager States (Includes Browser, Nautilus, and System Monitor states)
  const [windows, setWindows] = useState<AppWindow[]>([
    {
      id: 'terminal',
      title: 'linux@caelum-os:~ (AI Terminal)',
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: 10,
      theme: 'dark',
      width: 720,
      height: 480
    },
    {
      id: 'dashboard',
      title: 'CaelumOS Cloud Deploy Dashboard',
      isOpen: false,
      isMinimized: false,
      isMaximized: true,
      zIndex: 5,
      theme: 'light',
      width: 1024,
      height: 600
    },
    {
      id: 'monitoring',
      title: 'Grafana Monitor - Caelum Live Infrastructure',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
      theme: 'dark',
      width: 800,
      height: 500
    },
    {
      id: 'browser',
      title: 'Firefox Web Browser',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 6,
      theme: 'light',
      width: 850,
      height: 520
    },
    {
      id: 'nautilus',
      title: 'Files (Nautilus Manager)',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 4,
      theme: 'light',
      width: 780,
      height: 480
    },
    {
      id: 'sysmonitor',
      title: 'System Monitor',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 3,
      theme: 'dark',
      width: 720,
      height: 450
    }
  ]);

  const [topZIndex, setTopZIndex] = useState(11);
  const [showAppDrawer, setShowAppDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  
  // Settings sliders states
  const [volume, setVolume] = useState(80);
  const [brightness, setBrightness] = useState(90);

  // App drawer modules
  const allApps = [
    { id: 'dashboard', name: 'Cloud Deploy', icon: TerraformLogo, desc: 'Deploy cloud environments via Terraform', category: 'DevOps' },
    { id: 'terminal', name: 'AI Terminal', icon: TerminalIcon, desc: 'AI orchestration CLI shell', category: 'System' },
    { id: 'monitoring', name: 'Monitoring', icon: GrafanaLogo, desc: 'Grafana & Prometheus metrics', category: 'Monitor' },
    { id: 'browser', name: 'Web Browser', icon: FirefoxLogo, desc: 'Browse internal developer documentation', category: 'DevOps' },
    { id: 'nautilus', name: 'Files Explorer', icon: NautilusLogo, desc: 'Browse cloud repository contents', category: 'System' },
    { id: 'sysmonitor', name: 'System Monitor', icon: SysMonitorLogo, desc: 'Monitor cluster nodes and memory resources', category: 'Monitor' },
    { id: 'kubernetes', name: 'Kubernetes Engine', icon: KubernetesLogo, desc: 'Manage Kubernetes pod clusters', category: 'DevOps' },
    { id: 'docker', name: 'Docker Hub', icon: DockerLogo, desc: 'Container build registries', category: 'DevOps' },
    { id: 'aws', name: 'AWS Cloud', icon: AwsLogo, desc: 'Amazon Web Services credentials', category: 'Cloud' },
    { id: 'azure', name: 'Azure Cloud', icon: AzureLogo, desc: 'Microsoft Azure connections', category: 'Cloud' },
    { id: 'github', name: 'GitHub Integration', icon: GithubLogo, desc: 'Git repository sync adapters', category: 'DevOps' },
    { id: 'security', name: 'Cloud Security', icon: SecurityIcon, desc: 'Compliance scanner advisor', category: 'Security' },
    { id: 'cost', name: 'Cost Optimizer', icon: CostIcon, desc: 'Budget right-sizing rules', category: 'Finance' },
    { id: 'identity', name: 'Identity Lock', icon: IdentityIcon, desc: 'IAM access control lists', category: 'Security' },
    { id: 'automations', name: 'Automations', icon: AutomationsIcon, desc: 'Cron deployment workers', category: 'System' },
    { id: 'settings', name: 'Settings Control', icon: SettingsIcon, desc: 'Cloud OS preferences', category: 'System' }
  ];

  // Open / Focus a window
  const openApp = (appId: string) => {
    setShowAppDrawer(false);

    // Map integration apps to their layout window equivalents and slide workspaces
    let targetWindowId = appId;
    let targetWorkspaceIdx = 0;
    if (['terraform', 'kubernetes', 'aws', 'azure', 'github'].includes(appId)) {
      targetWindowId = 'dashboard';
      targetWorkspaceIdx = 1;
    } else if (['grafana', 'prometheus'].includes(appId)) {
      targetWindowId = 'monitoring';
      targetWorkspaceIdx = 2;
    } else if (appId === 'docker') {
      targetWindowId = 'terminal';
      targetWorkspaceIdx = 0;
    } else if (appId === 'terminal' || appId === 'nautilus') {
      targetWorkspaceIdx = 0;
    } else if (appId === 'dashboard' || appId === 'browser') {
      targetWorkspaceIdx = 1;
    } else if (appId === 'monitoring' || appId === 'sysmonitor') {
      targetWorkspaceIdx = 2;
    }

    setActiveWorkspace(targetWorkspaceIdx);

    setWindows(prev => prev.map(win => {
      if (win.id === targetWindowId) {
        const nextZ = topZIndex + 1;
        setTopZIndex(nextZ);
        return { ...win, isOpen: true, isMinimized: false, zIndex: nextZ };
      }
      return win;
    }));
  };

  const focusWindow = (id: string) => {
    const nextZ = topZIndex + 1;
    setTopZIndex(nextZ);

    if (id === 'terminal' || id === 'nautilus') setActiveWorkspace(0);
    else if (id === 'dashboard' || id === 'browser') setActiveWorkspace(1);
    else if (id === 'monitoring' || id === 'sysmonitor') setActiveWorkspace(2);

    setWindows(prev => prev.map(win => {
      if (win.id === id) {
        return { ...win, isMinimized: false, zIndex: nextZ };
      }
      return win;
    }));
  };

  const toggleWindowMinimize = (id: string) => {
    setWindows(prev => prev.map(win => {
      if (win.id === id) {
        return { ...win, isMinimized: !win.isMinimized };
      }
      return win;
    }));
  };

  const toggleWindowMaximize = (id: string) => {
    setWindows(prev => prev.map(win => {
      if (win.id === id) {
        return { ...win, isMaximized: !win.isMaximized };
      }
      return win;
    }));
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.map(win => {
      if (win.id === id) {
        return { ...win, isOpen: false };
      }
      return win;
    }));
  };

  const handleDockClick = (id: string) => {
    const win = windows.find(w => w.id === id);
    if (!win) {
      if (id === 'github') window.open('https://github.com', '_blank');
      return;
    }
    if (!win.isOpen) {
      openApp(id);
    } else if (win.isMinimized) {
      focusWindow(id);
    } else {
      const maxZ = Math.max(...windows.map(w => w.isOpen && !w.isMinimized ? w.zIndex : 0));
      if (win.zIndex === maxZ) {
        toggleWindowMinimize(id);
      } else {
        focusWindow(id);
      }
    }
  };

  const filteredApps = allApps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans select-none">
      
      {/* 0. Boot Loader Sequence Panel */}
      <AnimatePresence>
        {isBooting && (
          <motion.div
            key="bootloader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-[#000000] z-50 flex flex-col justify-end p-8 font-mono text-[10px] sm:text-xs text-slate-300 leading-relaxed select-text"
          >
            <div className="space-y-1 overflow-hidden h-[90vh] flex flex-col justify-end">
              {bootLogList.map((log, idx) => {
                if (!log) return null;
                const isOk = log.startsWith('[  OK  ]');
                return (
                  <div key={idx} className="flex items-center">
                    {isOk ? (
                      <>
                        <span className="text-green-500 font-extrabold mr-2">[  OK  ]</span>
                        <span>{log.substring(8)}</span>
                      </>
                    ) : (
                      <span className="text-slate-400">{log}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ubuntu Wallpaper (Right click background menu, filter shifts color hues dynamically per workspace) */}
      <div 
        className="ubuntu-wallpaper transition-all duration-700 ease-in-out" 
        style={{ filter: getWorkspaceFilter() }}
        onContextMenu={handleRightClick} 
      />

      {/* Live Topology Node Canvas Wallpaper Overlay */}
      {!isBooting && <CanvasTopology />}



      {/* Ubuntu-styled Right-Click Context Menu */}
      <AnimatePresence>
        {contextMenu.show && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setContextMenu({ show: false, x: 0, y: 0 })} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ top: contextMenu.y, left: contextMenu.x }}
              className="absolute z-45 w-48 rounded-lg bg-[#2b2b2b]/95 border border-neutral-800 text-slate-200 text-xs py-1.5 shadow-2xl font-medium backdrop-blur-sm"
            >
              <button
                onClick={() => {
                  setContextMenu({ show: false, x: 0, y: 0 });
                  openApp('dashboard');
                }}
                className="w-full text-left px-4 py-2 hover:bg-[#ff6936] hover:text-white transition-colors cursor-pointer"
              >
                New Deployment
              </button>
              <button
                onClick={() => {
                  setContextMenu({ show: false, x: 0, y: 0 });
                  openApp('terminal');
                }}
                className="w-full text-left px-4 py-2 hover:bg-[#ff6936] hover:text-white transition-colors cursor-pointer"
              >
                Open Terminal
              </button>
              <button
                onClick={() => {
                  setContextMenu({ show: false, x: 0, y: 0 });
                  setWindows(prev => prev.map(w => ({ ...w, isMinimized: true })));
                }}
                className="w-full text-left px-4 py-2 hover:bg-[#ff6936] hover:text-white transition-colors cursor-pointer"
              >
                Clean Workspace
              </button>
              <div className="h-[1px] bg-neutral-800 my-1" />
              <button
                onClick={() => {
                  setContextMenu({ show: false, x: 0, y: 0 });
                  setShowAppDrawer(true);
                }}
                className="w-full text-left px-4 py-2 hover:bg-[#ff6936] hover:text-white transition-colors cursor-pointer"
              >
                Show Applications
              </button>
              <button
                onClick={() => {
                  setContextMenu({ show: false, x: 0, y: 0 });
                  window.location.reload();
                }}
                className="w-full text-left px-4 py-2 hover:bg-[#ff6936] hover:text-white transition-colors cursor-pointer"
              >
                Restart OS
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 1. The Top Panel (System Bar) */}
      <div className="fixed top-0 left-0 right-0 h-7 bg-[#111111]/95 border-b border-black/40 text-slate-100 flex items-center justify-between px-4 z-40 text-xs font-semibold select-none shadow-sm">
        
        {/* Left: Shield / Activities */}
        <div className="flex items-center space-x-3.5">
          <button 
            onClick={() => setShowAppDrawer(!showAppDrawer)}
            className="flex items-center space-x-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="w-3.5 h-3.5 text-purple-400 fill-purple-400/10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            <span className="font-bold tracking-tight">Activities</span>
          </button>

          {/* Quick indicators */}
          {windows.filter(w => w.isOpen && !w.isMinimized).map(win => (
            <span key={win.id} className="text-[10px] text-slate-400 font-medium tracking-wide bg-white/5 border border-white/5 px-2 py-0.5 rounded mr-1">
              {win.id === 'terminal' ? 'AI Terminal' : win.id === 'dashboard' ? 'Cloud Deploy' : win.id === 'monitoring' ? 'Monitor' : win.id === 'browser' ? 'Browser' : win.id === 'nautilus' ? 'Files' : 'SysMonitor'}
            </span>
          ))}
        </div>

        {/* Center: System Clock */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-slate-200">
          {timeStr}
        </div>

        {/* Right: Quick Settings Tray */}
        <div className="relative">
          <button
            onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
            className="flex items-center space-x-2.5 hover:text-white px-2 py-0.5 rounded hover:bg-white/5 transition-all cursor-pointer"
          >
            <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
            <Volume2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <Battery className="w-4 h-4 stroke-[2.5] text-emerald-400" />
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* System settings dropdown menu */}
          <AnimatePresence>
            {showSettingsDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSettingsDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-1.5 w-60 rounded-xl border border-neutral-800 bg-[#1e1e1e] p-3 text-slate-200 shadow-2xl z-50 text-[11px] font-medium"
                >
                  <div className="space-y-3.5">
                    {/* Connection indicators */}
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-slate-400">
                      <span className="font-bold uppercase tracking-wider text-[9px]">Settings Console</span>
                      <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Online</span>
                      </span>
                    </div>

                    {/* Wifi / Volume Toggles */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-[#2a2a2a] hover:bg-[#353535] rounded-lg p-2 flex flex-col items-center cursor-pointer transition-colors">
                        <Wifi className="w-4 h-4 mb-1 text-purple-400" />
                        <span>CaelumNet</span>
                      </div>
                      <div className="bg-[#2a2a2a] hover:bg-[#353535] rounded-lg p-2 flex flex-col items-center cursor-pointer transition-colors">
                        <Volume2 className="w-4 h-4 mb-1 text-purple-400" />
                        <span>Output: ON</span>
                      </div>
                    </div>

                    {/* Volume Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Volume</span>
                        <span>{volume}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-full accent-purple-500 h-1 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Brightness Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Brightness</span>
                        <span>{brightness}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full accent-purple-500 h-1 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Power actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                      <button
                        onClick={() => {
                          setShowSettingsDropdown(false);
                          alert("Restarting CaelumOS System Environment...");
                          window.location.reload();
                        }}
                        className="w-24 py-1.5 rounded-lg bg-[#2a2a2a] hover:bg-neutral-800 border border-neutral-800 text-center font-bold transition-all text-[10px] cursor-pointer"
                      >
                        RESTART
                      </button>
                      <button
                        onClick={() => {
                          setShowSettingsDropdown(false);
                          alert("Powering down CaelumOS virtual shell. Close browser tab to exit.");
                        }}
                        className="w-24 py-1.5 rounded-lg bg-[#e95420] hover:bg-[#ff6936] text-white text-center font-bold flex items-center justify-center space-x-1.5 transition-all text-[10px] cursor-pointer"
                      >
                        <Power className="w-3 h-3" />
                        <span>POWER OFF</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* 2. Left Dock (Launcher) */}
      <div className="fixed left-0 top-7 bottom-0 w-[60px] bg-[#111111]/80 border-r border-black/40 backdrop-blur-md flex flex-col items-center justify-between py-3 z-30 shadow-2xl">
        {/* Top Dock Apps */}
        <div className="flex flex-col items-center space-y-3.5 w-full">
          
          {/* 9-Dot App Grid Button */}
          <button
            onClick={() => setShowAppDrawer(!showAppDrawer)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200 cursor-pointer ${
              showAppDrawer ? 'bg-white/15 text-white ring-1 ring-white/10' : ''
            }`}
            title="Show Applications"
          >
            <Grid className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="w-6 h-[1px] bg-white/10 my-1" />

          {/* AI Terminal */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => handleDockClick('terminal')}
              className="w-10 h-10 rounded-xl bg-[#2c001e] hover:bg-[#3c0c2e] border border-purple-900/50 flex items-center justify-center text-emerald-450 group-hover:scale-105 active:scale-95 transition-all duration-200 shadow-md cursor-pointer"
              title="CaelumOS AI Terminal"
            >
              <TermIcon className="w-4.5 h-4.5" />
            </button>
            {windows.find(w => w.id === 'terminal')?.isOpen && (
              <span className="absolute left-1 top-4.5 w-1 h-1 rounded-full bg-white shadow-sm shadow-white/80" />
            )}
          </div>

          {/* Asset Explorer (Nautilus Manager) */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => handleDockClick('nautilus')}
              className="w-10 h-10 rounded-xl bg-[#1e1e1e] hover:bg-neutral-800 border border-white/5 flex items-center justify-center group-hover:scale-105 active:scale-95 transition-all duration-200 shadow-md cursor-pointer text-orange-500"
              title="Files (Nautilus Explorer)"
            >
              <NautilusLogo className="w-6.5 h-6.5" />
            </button>
            {windows.find(w => w.id === 'nautilus')?.isOpen && (
              <span className="absolute left-1 top-4.5 w-1 h-1 rounded-full bg-white shadow-sm shadow-white/80" />
            )}
          </div>

          {/* Cloud Deploy Dashboard */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => handleDockClick('dashboard')}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white group-hover:scale-105 active:scale-95 transition-all duration-200 shadow-md cursor-pointer"
              title="Cloud Deploy Dashboard"
            >
              <Layout className="w-4.5 h-4.5" />
            </button>
            {windows.find(w => w.id === 'dashboard')?.isOpen && (
              <span className="absolute left-1 top-4.5 w-1 h-1 rounded-full bg-white shadow-sm shadow-white/80" />
            )}
          </div>

          {/* Firefox Web Browser */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => handleDockClick('browser')}
              className="w-10 h-10 rounded-xl bg-[#1e1e1e] hover:bg-neutral-800 border border-white/5 flex items-center justify-center group-hover:scale-105 active:scale-95 transition-all duration-200 shadow-md cursor-pointer"
              title="Web Browser (Firefox)"
            >
              <FirefoxLogo className="w-6.5 h-6.5" />
            </button>
            {windows.find(w => w.id === 'browser')?.isOpen && (
              <span className="absolute left-1 top-4.5 w-1 h-1 rounded-full bg-white shadow-sm shadow-white/80" />
            )}
          </div>

          {/* GitHub link */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => handleDockClick('github')}
              className="w-10 h-10 rounded-xl bg-[#1e1e1e] hover:bg-neutral-800 border border-white/5 flex items-center justify-center text-white group-hover:scale-105 active:scale-95 transition-all duration-200 shadow-md cursor-pointer"
              title="Open GitHub"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
              </svg>
            </button>
          </div>

          {/* AWS / Azure Cloud launcher (Official Colors, side-by-side) */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => handleDockClick('dashboard')}
              className="w-10 h-10 rounded-xl bg-[#1e1e1e] hover:bg-neutral-800 border border-white/5 flex items-center justify-center p-1 space-x-1 group-hover:scale-105 active:scale-95 transition-all duration-200 shadow-md cursor-pointer"
              title="AWS / Azure Cloud Console"
            >
              {/* AWS Smile logo */}
              <svg viewBox="0 0 32 32" className="w-4 h-4 flex-shrink-0">
                <path fill="#FF9900" d="M25 21.2c-3.1 2.2-7.5 3.3-11.8 3.3-6 0-11-2.2-13.8-5.6-.4-.5 0-1.1.5-.8 4.3 2.3 9.6 3.6 15 3.6 4.4 0 9.2-.9 12.6-2.8.7-.4 1.1.3.4.8z"/>
                <path fill="#FF9900" d="M26 19.4c-.3-.4-1.1-.1-1.5.1-.4.3-.3 1.1.1 1.4.7.4 1.5 1 1.6.4.3-.4-.9-1.5-.9-1.9z"/>
              </svg>
              {/* Azure Diamond logo */}
              <svg viewBox="0 0 128 128" className="w-4.5 h-4.5 flex-shrink-0">
                <path fill="#0078d4" d="M10.8 108.8L63.3 22l43.5 28.5L63.3 83.3z" />
                <path fill="#50e6ff" d="M117.2 108.8H10.8l52.5-25.5z" />
              </svg>
            </button>
            {windows.find(w => w.id === 'dashboard')?.isOpen && (
              <span className="absolute left-1 top-4.5 w-1 h-1 rounded-full bg-white shadow-sm shadow-white/80" />
            )}
          </div>

          {/* Terraform (Official Purple Logo) */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => handleDockClick('dashboard')}
              className="w-10 h-10 rounded-xl bg-[#1e1e1e] hover:bg-neutral-800 border border-white/5 flex items-center justify-center group-hover:scale-105 active:scale-95 transition-all duration-200 shadow-md cursor-pointer"
              title="Terraform Provisioner"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#844FBA" d="M1.5 0h7v7h-7zM15.5 0h7v7h-7zM8.5 7h7v7h-7zM1.5 14h7v7h-7zM15.5 14h7v7h-7z" />
              </svg>
            </button>
          </div>

          {/* Docker (Official Blue Whale Logo) */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => handleDockClick('terminal')}
              className="w-10 h-10 rounded-xl bg-[#1e1e1e] hover:bg-neutral-800 border border-white/5 flex items-center justify-center group-hover:scale-105 active:scale-95 transition-all duration-200 shadow-md cursor-pointer"
              title="Docker Containerizer"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path fill="#0db7ed" d="M22.3 10.05c-.34-.73-.91-1.3-1.61-1.67-.18-.1-.38-.17-.58-.23a4.23 4.23 0 0 0-.28-1.57c-.24-.55-.65-1.02-1.18-1.32-.47-.27-1.02-.38-1.55-.32-.23-.83-.73-1.54-1.42-2-.68-.45-1.5-.64-2.3-.53h-.03v1.89h.03c.53-.06 1.08.06 1.53.36.42.28.71.72.82 1.22l.06.28.28.03c.66.08 1.25.46 1.58 1.04.18.32.28.69.29 1.06v.06h1.92v-.03c0-.12.02-.24.03-.36l.01-.22zM8.99 7.62h1.61v-1.6H8.99v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm-7.02 2.34h1.61v-1.6H6.65v1.6zm2.34 0h1.61v-1.6H8.99v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm-11.7 2.34h1.61v-1.6H4.31v1.6zm2.34 0h1.61v-1.6H6.65v1.6zm2.34 0h1.61v-1.6H8.99v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm-14.04 2.34c0 1.9 1.53 3.44 3.44 3.44h11.23c3.1 0 5.66-2.4 5.86-5.46.02-.3.17-.57.43-.73.66-.43 1.25-1.04 1.52-1.76.27-.72.11-1.5-.18-1.89-.46-.52-1.14-.82-1.81-.82-.09 0-.17.01-.26.02-.45.04-.84-.13-1.12-.48l-.51-.38-.51.38c-.28.35-.67.52-1.12.48a1.64 1.64 0 0 0-1.12.48l-.51.38v-4.3c0-.1-.08-.18-.18-.18H8.38c-.1 0-.18.08-.18.18v5.43c0 .1-.08.18-.18.18H6.41c-.1 0-.18-.08-.18-.18v-5.43c0-.1-.08-.18-.18-.18H4.44c-.1 0-.18.08-.18.18v5.43c0 .1-.08.18-.18.18H2.47c-.1 0-.18-.08-.18-.18v-3.25c0-.1-.08-.18-.18-.18H.3c-.1 0-.18.08-.18.18v1.36c0 1.9 1.53 3.44 3.44 3.44h1.76v-.06z" />
              </svg>
            </button>
          </div>

          {/* Kubernetes (Official Blue Wheel Logo) */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => handleDockClick('dashboard')}
              className="w-10 h-10 rounded-xl bg-[#1e1e1e] hover:bg-neutral-800 border border-white/5 flex items-center justify-center group-hover:scale-105 active:scale-95 transition-all duration-200 shadow-md cursor-pointer"
              title="Kubernetes Orchestrator"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#326CE5" d="M12.44 2.1a1.23 1.23 0 00-.88 0L3.18 5.5a1.24 1.24 0 00-.73 1.05v9.9a1.24 1.24 0 00.73 1.05l8.38 3.4a1.23 1.23 0 00.88 0l8.38-3.4a1.24 1.24 0 00.73-1.05v-9.9a1.24 1.24 0 00-.73-1.05z" />
                <path fill="#FFFFFF" d="M12 4.45l6.53 2.65v2.96L12 7.42zm-6.53 2.65L12 4.45v2.97L5.47 10.06zM4.65 8.9v6.2l3.4-1.38V7.52zm4.24 4.9L12 12.46l3.11 1.26v2.96L12 15.42zm4.23-1.34L19.35 8.9V13.8l-3.4 1.38zm7.34 2.74l-6.53 2.65v-2.96l6.53-2.65zm-16.92 0L12 18.06V20.7l-6.53-2.65zm6.53-5.26v2.96L5.47 12.8v-2.96z" />
              </svg>
            </button>
          </div>

          {/* Grafana / Prometheus (Official Logos, side-by-side) */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => handleDockClick('monitoring')}
              className="w-10 h-10 rounded-xl bg-[#1e1e1e] hover:bg-neutral-800 border border-white/5 flex items-center justify-center p-1.5 space-x-1 group-hover:scale-105 active:scale-95 transition-all duration-200 shadow-md cursor-pointer"
              title="Grafana / Prometheus Metrics"
            >
              {/* Grafana Portal */}
              <svg viewBox="0 0 50 50" className="w-4 h-4 flex-shrink-0">
                <path fill="#F26522" d="M25 5C14 5 5 14 5 25s9 20 20 20 20-9 20-20S36 5 25 5zm5.5 30.5c-3 .5-6-1.5-6.5-4.5s1.5-6 4.5-6.5 6 1.5 6.5 4.5-1.5 6-4.5 6.5zm3.8-13.8c-2 2-5 1-7-1s-3-5-1-7 5-1 7 1 3 5 1 7z"/>
              </svg>
              {/* Prometheus Flame */}
              <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
                <path fill="#E6522C" d="M12.02 0a12 12 0 1011.98 12c0-2.85-.99-5.46-2.65-7.53L19.8 6.02A9.5 9.5 0 0121.5 12a9.5 9.5 0 11-16.7-6.27l1.7-1.46c.14-.12.33-.12.47.01l1.58 1.48c.15.14.39.1.48-.09a3.7 3.7 0 015.65-1.12l1.62-1.39C14.6 2.05 13.34 1.44 12.02.04v-.04z"/>
                <path fill="#FF7800" d="M10.8 14.88c-.65-.63-.98-1.5-.98-2.6 0-1.11.33-1.98.98-2.62s1.55-.96 2.7-.96 2.06.32 2.7.96.98 1.5.98 2.61c0 1.11-.33 1.98-.98 2.61s-1.55.96-2.7.96-2.05-.32-2.7-.96z"/>
              </svg>
            </button>
            {windows.find(w => w.id === 'monitoring')?.isOpen && (
              <span className="absolute left-1 top-4.5 w-1 h-1 rounded-full bg-white shadow-sm shadow-white/80" />
            )}
          </div>

          {/* GNOME System Monitor */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => handleDockClick('sysmonitor')}
              className="w-10 h-10 rounded-xl bg-[#1e1e1e] hover:bg-neutral-800 border border-white/5 flex items-center justify-center group-hover:scale-105 active:scale-95 transition-all duration-200 shadow-md cursor-pointer text-emerald-450"
              title="System Monitor"
            >
              <SysMonitorLogo className="w-6.5 h-6.5" />
            </button>
            {windows.find(w => w.id === 'sysmonitor')?.isOpen && (
              <span className="absolute left-1 top-4.5 w-1 h-1 rounded-full bg-white shadow-sm shadow-white/80" />
            )}
          </div>

        </div>

        {/* Bottom Dock Apps: Trash */}
        <div className="flex flex-col items-center w-full">
          <button
            onClick={() => alert("Trash bin is empty.")}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200 cursor-pointer"
            title="Trash Can"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* 3. Window Sandbox Canvas Workspace (Separated by sliding motion panels) */}
      <div className="absolute left-[60px] top-7 right-0 bottom-0 overflow-hidden z-20">
        
        {/* Workspace 0: Dev Workspace Panel */}
        <motion.div
          animate={{ x: (0 - activeWorkspace) * 100 + '%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 180 }}
          className="absolute inset-0 p-4"
        >
          {/* AI Terminal Window */}
          <WindowFrame
            id="terminal"
            title="linux@caelum-os:~ (AI Terminal)"
            isOpen={windows[0].isOpen}
            isMinimized={windows[0].isMinimized}
            isMaximized={windows[0].isMaximized}
            zIndex={windows[0].zIndex}
            onClose={() => closeWindow('terminal')}
            onMinimize={() => toggleWindowMinimize('terminal')}
            onMaximize={() => toggleWindowMaximize('terminal')}
            onFocus={() => focusWindow('terminal')}
            theme="dark"
            defaultWidth={680}
            defaultHeight={440}
          >
            <TerminalApp onOpenApp={openApp} />
          </WindowFrame>

          {/* Nautilus explorer App Window */}
          <WindowFrame
            id="nautilus"
            title="Files (Nautilus Manager)"
            isOpen={windows[4].isOpen}
            isMinimized={windows[4].isMinimized}
            isMaximized={windows[4].isMaximized}
            zIndex={windows[4].zIndex}
            onClose={() => closeWindow('nautilus')}
            onMinimize={() => toggleWindowMinimize('nautilus')}
            onMaximize={() => toggleWindowMaximize('nautilus')}
            onFocus={() => focusWindow('nautilus')}
            theme="light"
            defaultWidth={760}
            defaultHeight={460}
          >
            <NautilusApp />
          </WindowFrame>
        </motion.div>

        {/* Workspace 1: Staging Workspace Panel */}
        <motion.div
          animate={{ x: (1 - activeWorkspace) * 100 + '%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 180 }}
          className="absolute inset-0 p-4"
        >
          {/* Cloud Deploy Dashboard Window */}
          <WindowFrame
            id="dashboard"
            title="CaelumOS Cloud Deploy Dashboard"
            isOpen={windows[1].isOpen}
            isMinimized={windows[1].isMinimized}
            isMaximized={windows[1].isMaximized}
            zIndex={windows[1].zIndex}
            onClose={() => closeWindow('dashboard')}
            onMinimize={() => toggleWindowMinimize('dashboard')}
            onMaximize={() => toggleWindowMaximize('dashboard')}
            onFocus={() => focusWindow('dashboard')}
            theme="light"
            defaultWidth={1050}
            defaultHeight={600}
          >
            <DashboardApp />
          </WindowFrame>

          {/* Web Browser App Window */}
          <WindowFrame
            id="browser"
            title="Firefox Web Browser"
            isOpen={windows[3].isOpen}
            isMinimized={windows[3].isMinimized}
            isMaximized={windows[3].isMaximized}
            zIndex={windows[3].zIndex}
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
        </motion.div>

        {/* Workspace 2: Production Workspace Panel */}
        <motion.div
          animate={{ x: (2 - activeWorkspace) * 100 + '%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 180 }}
          className="absolute inset-0 p-4"
        >
          {/* Grafana Monitor Window */}
          <WindowFrame
            id="monitoring"
            title="Grafana Monitor - Caelum Live Infrastructure"
            isOpen={windows[2].isOpen}
            isMinimized={windows[2].isMinimized}
            isMaximized={windows[2].isMaximized}
            zIndex={windows[2].zIndex}
            onClose={() => closeWindow('monitoring')}
            onMinimize={() => toggleWindowMinimize('monitoring')}
            onMaximize={() => toggleWindowMaximize('monitoring')}
            onFocus={() => focusWindow('monitoring')}
            theme="dark"
            defaultWidth={780}
            defaultHeight={460}
          >
            <div className="flex-1 flex flex-col bg-[#111111] text-[#dfdbd2] p-5 overflow-y-auto space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-sm text-slate-100">Core Node Clusters Status</span>
                </div>
                <span className="text-[10px] bg-green-500/20 border border-green-500/30 text-green-400 px-2 py-0.5 rounded font-bold uppercase">
                  Healthy
                </span>
              </div>

              {/* Quick Chart Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CPU Allocation</span>
                  <p className="text-2xl font-extrabold text-slate-100">22.4%</p>
                  <div className="w-full bg-[#2a2a2a] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[22%]" />
                  </div>
                </div>
                <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Memory Allocation</span>
                  <p className="text-2xl font-extrabold text-slate-100">46.8%</p>
                  <div className="w-full bg-[#2a2a2a] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[46%]" />
                  </div>
                </div>
                <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Network Traffic</span>
                  <p className="text-2xl font-extrabold text-slate-100">8.4 MB/s</p>
                  <div className="w-full bg-[#2a2a2a] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[35%]" />
                  </div>
                </div>
              </div>

              {/* Chart Graphic representation */}
              <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between h-44">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                  <span>Grafana Live Chart - Streamed Rates</span>
                  <span>Interval: 1s</span>
                </div>
                {/* Simulated Sine Wave SVGs */}
                <div className="flex-1 w-full flex items-end">
                  <svg className="w-full h-24 overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                    <path
                      d="M0,80 Q25,30 50,60 T100,50 T150,75 T200,30 T250,90 T300,50 T350,20 T400,60 T450,40 T500,70"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      className="drop-shadow-[0_2px_8px_rgba(245,158,11,0.2)]"
                    />
                    <path
                      d="M0,80 Q25,30 50,60 T100,50 T150,75 T200,30 T250,90 T300,50 T350,20 T400,60 T450,40 T500,70 L500,100 L0,100 Z"
                      fill="url(#gradient-yellow)"
                      opacity="0.08"
                    />
                    <defs>
                      <linearGradient id="gradient-yellow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              
              {/* Process nodes log list */}
              <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-3.5 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live Node Statuses</span>
                <div className="space-y-1.5 text-xs text-slate-300 leading-none">
                  <div className="flex justify-between py-1 border-b border-neutral-800/40">
                    <span>aws-us-east-cluster-node-1</span>
                    <span className="text-green-400 font-semibold">Running</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800/40">
                    <span>aws-us-east-cluster-node-2</span>
                    <span className="text-green-400 font-semibold">Running</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800/40">
                    <span>db-postgre-production-replica-1</span>
                    <span className="text-green-400 font-semibold">Running</span>
                  </div>
                </div>
              </div>
            </div>
          </WindowFrame>

          {/* System Monitor App Window */}
          <WindowFrame
            id="sysmonitor"
            title="System Monitor"
            isOpen={windows[5].isOpen}
            isMinimized={windows[5].isMinimized}
            isMaximized={windows[5].isMaximized}
            zIndex={windows[5].zIndex}
            onClose={() => closeWindow('sysmonitor')}
            onMinimize={() => toggleWindowMinimize('sysmonitor')}
            onMaximize={() => toggleWindowMaximize('sysmonitor')}
            onFocus={() => focusWindow('sysmonitor')}
            theme="dark"
            defaultWidth={720}
            defaultHeight={450}
          >
            <SystemMonitorApp />
          </WindowFrame>
        </motion.div>

      </div>

      {/* 4. App Drawer Overlay (Hidden by Default) */}
      <AnimatePresence>
        {showAppDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 app-grid-glass z-25 flex flex-col justify-start pt-16 px-6 sm:px-12 select-none"
          >
            
            {/* Top Search bar */}
            <div className="w-full max-w-lg mx-auto relative mb-12">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 stroke-[2.5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search modules..."
                className="w-full pl-11 pr-4 py-3 bg-neutral-900/60 border border-neutral-800 rounded-full text-slate-200 text-sm outline-none focus:border-purple-600 focus:bg-neutral-900/90 shadow-2xl transition-all"
                autoFocus
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Grid of Apps */}
            <motion.div
              layout
              className="max-w-4xl mx-auto grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-6 sm:gap-10 overflow-y-auto max-h-[70vh] pb-10"
            >
              {filteredApps.map((app) => (
                <motion.button
                  key={app.id}
                  layout
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openApp(app.id)}
                  className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 rounded-3xl transition-all group cursor-pointer"
                >
                  <div className="w-14 h-14 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300">
                    <app.icon className="w-11 h-11" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 tracking-wide text-center">
                    {app.name}
                  </span>
                  <span className="text-[9px] text-slate-400 text-center leading-normal mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    {app.desc}
                  </span>
                </motion.button>
              ))}
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. GNOME Notification Toasts (Top Center Dropdown Alert Stack) */}
      <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-50 flex flex-col space-y-2.5 max-w-sm w-full px-4 select-text">
        <AnimatePresence>
          {notifications.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -45, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -25, scale: 0.92 }}
              transition={{ type: 'spring', damping: 22, stiffness: 220 }}
              className="bg-[#2b2b2b]/95 border border-neutral-800 text-slate-200 rounded-xl shadow-2xl p-3.5 flex items-start space-x-3.5 backdrop-blur-md relative overflow-hidden"
            >
              {/* Notification icon indicator */}
              <div className="flex-shrink-0 mt-0.5">
                {toast.type === 'k8s' ? (
                  <div className="w-8 h-8 rounded-lg bg-blue-900/50 flex items-center justify-center">
                    <KubernetesLogo className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-emerald-900/50 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Message text content */}
              <div className="flex-1 space-y-0.5 pr-4">
                <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                  <span>{toast.title}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {toast.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setNotifications(prev => prev.filter(t => t.id !== toast.id))}
                className="absolute top-2 right-2.5 w-4 h-4 text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center cursor-pointer"
              >
                <X className="w-3 h-3 stroke-[2.5]" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>


    </div>
  );
}
