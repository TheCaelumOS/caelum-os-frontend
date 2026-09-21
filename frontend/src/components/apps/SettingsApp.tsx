"use client";

import React, { useState, useMemo } from 'react';
import { 
  Palette, 
  Monitor, 
  LayoutGrid, 
  Volume2, 
  VolumeX, 
  Wifi, 
  Bluetooth, 
  Maximize2, 
  Shield, 
  Zap, 
  Globe, 
  Users, 
  Keyboard, 
  Search, 
  Check, 
  ChevronRight, 
  Info, 
  Moon, 
  Sun, 
  RefreshCw, 
  Laptop, 
  HardDrive, 
  Folder, 
  Trash2, 
  Sliders, 
  Lock, 
  Unlock, 
  Headphones, 
  Mouse, 
  Mic, 
  Camera, 
  Clock, 
  BatteryCharging, 
  Battery, 
  Power, 
  Plus, 
  ShieldCheck, 
  Sparkles,
  Play
} from 'lucide-react';

export interface OsSettings {
  // 1. Appearance
  themeMode: 'dark' | 'light';
  accentColor: string;
  wallpaper: string;

  // 2. Displays & Night Light
  resolution: string;
  displayScale: string;
  nightLight: boolean;
  nightLightWarmth: number;
  refreshRate: string;

  // 3. Ubuntu Desktop
  dockPosition: 'left' | 'bottom' | 'right';
  dockAutoHide: boolean;
  dockIconSize: number;
  showTrashOnDesktop: boolean;
  showHomeOnDesktop: boolean;
  showMountedDrives: boolean;

  // 4. Sound
  masterVolume: number;
  inputVolume: number;
  defaultOutputDevice: string;
  defaultInputDevice: string;
  soundAlertEffect: string;
  appVolumes: Record<string, number>;

  // 5. Network & Wi-Fi
  wiredConnected: boolean;
  wifiEnabled: boolean;
  activeWifiSsid: string;
  vpnEnabled: boolean;
  proxyMode: 'none' | 'auto' | 'manual';

  // 6. Bluetooth
  bluetoothEnabled: boolean;
  pairedDevices: Array<{ id: string; name: string; type: 'headset' | 'mouse' | 'keyboard'; connected: boolean; battery?: number }>;

  // 7. Multitasking
  hotCorner: boolean;
  screenEdgeTiling: boolean;
  dynamicWorkspaces: boolean;
  workspaceDisplay: 'primary' | 'all';

  // 8. Privacy & Security
  cameraAccess: boolean;
  microphoneAccess: boolean;
  screenLockDelay: string;
  fileHistoryDays: number;
  sendDiagnosticData: boolean;

  // 9. Power
  powerProfile: 'performance' | 'balanced' | 'power-saver';
  batteryProtection: boolean;
  screenBlankTimeout: string;
  automaticSuspend: boolean;

  // 10. Region & Language
  displayLanguage: string;
  inputSource: string;
  regionalFormats: string;

  // 11. Users
  users: Array<{ id: string; name: string; username: string; role: 'Administrator' | 'Standard'; avatarColor: string }>;
  autoLogin: boolean;

  // 12. Keyboard & Mouse
  mouseSpeed: number;
  naturalScrolling: boolean;
  mouseAcceleration: 'adaptive' | 'flat';
  keyRepeatDelay: number;
  keyRepeatRate: number;
}

export const DEFAULT_OS_SETTINGS: OsSettings = {
  themeMode: 'dark',
  accentColor: '#e95420', // Classic Ubuntu Orange
  wallpaper: 'aubergine',
  resolution: '1920x1080 (16:9)',
  displayScale: '100%',
  nightLight: false,
  nightLightWarmth: 45,
  refreshRate: '60 Hz',
  dockPosition: 'left',
  dockAutoHide: false,
  dockIconSize: 44,
  showTrashOnDesktop: true,
  showHomeOnDesktop: true,
  showMountedDrives: true,
  masterVolume: 75,
  inputVolume: 80,
  defaultOutputDevice: 'Built-in Speakers (Analog Stereo)',
  defaultInputDevice: 'Internal Microphone (Built-in Audio)',
  soundAlertEffect: 'drip',
  appVolumes: {
    'Terminal': 70,
    'Browser': 85,
    'VS Code': 60,
    'System Alerts': 90
  },
  wiredConnected: true,
  wifiEnabled: true,
  activeWifiSsid: 'Caelum-Cloud-Mesh (5 GHz)',
  vpnEnabled: false,
  proxyMode: 'none',
  bluetoothEnabled: true,
  pairedDevices: [
    { id: '1', name: 'Sony WH-1000XM5', type: 'headset', connected: true, battery: 85 },
    { id: '2', name: 'Logitech MX Master 3S', type: 'mouse', connected: true, battery: 92 },
    { id: '3', name: 'Keychron K2 Pro', type: 'keyboard', connected: false }
  ],
  hotCorner: true,
  screenEdgeTiling: true,
  dynamicWorkspaces: true,
  workspaceDisplay: 'primary',
  cameraAccess: true,
  microphoneAccess: true,
  screenLockDelay: '5m',
  fileHistoryDays: 30,
  sendDiagnosticData: false,
  powerProfile: 'balanced',
  batteryProtection: true,
  screenBlankTimeout: '10m',
  automaticSuspend: false,
  displayLanguage: 'English (United States)',
  inputSource: 'English (US, intl., altgr dead keys)',
  regionalFormats: 'United States (en_US.UTF-8)',
  users: [
    { id: 'u1', name: 'Caelum Engineer', username: 'linux@caelum-os', role: 'Administrator', avatarColor: '#e95420' }
  ],
  autoLogin: true,
  mouseSpeed: 6,
  naturalScrolling: true,
  mouseAcceleration: 'adaptive',
  keyRepeatDelay: 400,
  keyRepeatRate: 35
};

const WALLPAPER_OPTIONS = [
  { id: 'aubergine', name: 'Ubuntu Aubergine', preview: 'from-[#4f1836] via-[#2c001e] to-[#77216f]', desc: 'Default gradient' },
  { id: 'nebula', name: 'Caelum Deep Nebula', preview: 'from-[#0b1021] via-[#1a1c4b] to-[#2d1b4e]', desc: 'Cosmic space' },
  { id: 'matrix', name: 'Cloud Native Navy', preview: 'from-[#030712] via-[#0f172a] to-[#1e293b]', desc: 'Developer dark' },
  { id: 'cyber', name: 'Cyber Charcoal', preview: 'from-[#18181b] via-[#27272a] to-[#3f3f46]', desc: 'Minimal neutral' },
  { id: 'emerald', name: 'Nordic Aurora', preview: 'from-[#064e3b] via-[#022c22] to-[#0f172a]', desc: 'Emerald forest' }
];

const ACCENT_COLORS = [
  { id: 'orange', name: 'Ubuntu Orange', hex: '#e95420' },
  { id: 'blue', name: 'Caelum Blue', hex: '#2563eb' },
  { id: 'emerald', name: 'Emerald Green', hex: '#10b981' },
  { id: 'purple', name: 'Royal Purple', hex: '#8b5cf6' },
  { id: 'rose', name: 'Rose Red', hex: '#f43f5e' },
  { id: 'slate', name: 'Slate Gray', hex: '#64748b' }
];

interface SettingsAppProps {
  settings?: OsSettings;
  onUpdateSettings?: (updater: (prev: OsSettings) => OsSettings) => void;
}

export default function SettingsApp({ 
  settings = DEFAULT_OS_SETTINGS, 
  onUpdateSettings 
}: SettingsAppProps) {
  const [activePanel, setActivePanel] = useState<string>('appearance');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [testSoundPlaying, setTestSoundPlaying] = useState<boolean>(false);
  const [newUserModalOpen, setNewUserModalOpen] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<'Standard' | 'Administrator'>('Standard');

  // Internal updater fallback if not provided
  const [localSettings, setLocalSettings] = useState<OsSettings>(settings);
  const currentSettings = onUpdateSettings ? settings : localSettings;

  const update = (fn: (prev: OsSettings) => OsSettings) => {
    if (onUpdateSettings) {
      onUpdateSettings(fn);
    } else {
      setLocalSettings(prev => {
        const next = fn(prev);
        if (typeof window !== 'undefined') {
          localStorage.setItem('caelum_os_settings', JSON.stringify(next));
        }
        return next;
      });
    }
  };

  const panels = [
    { id: 'appearance', name: 'Appearance', icon: Palette, desc: 'Light/dark mode, accent colors, and desktop wallpapers' },
    { id: 'displays', name: 'Displays & Night Light', icon: Monitor, desc: 'Resolution, scaling, and warm color eye protection' },
    { id: 'desktop', name: 'Ubuntu Desktop', icon: LayoutGrid, desc: 'Dock position, auto-hide, icon size, and desktop shortcuts' },
    { id: 'sound', name: 'Sound', icon: Volume2, desc: 'Output/input volumes, default devices, and app mixers' },
    { id: 'network', name: 'Network & Wi-Fi', icon: Wifi, desc: 'Wired, wireless Wi-Fi, VPN profiles, and proxy settings' },
    { id: 'bluetooth', name: 'Bluetooth', icon: Bluetooth, desc: 'Pair headsets, mice, keyboards, and local transfers' },
    { id: 'multitasking', name: 'Multitasking', icon: Maximize2, desc: 'Hot corners, screen edge snapping, and workspaces' },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield, desc: 'Hardware permissions, screen lock, and diagnostic data' },
    { id: 'power', name: 'Power', icon: Zap, desc: 'Performance profiles, battery health, and suspend timing' },
    { id: 'region', name: 'Region & Language', icon: Globe, desc: 'Display languages, keyboard layouts, and number formats' },
    { id: 'users', name: 'Users', icon: Users, desc: 'User accounts, administrator rights, and login options' },
    { id: 'keyboard_mouse', name: 'Keyboard & Mouse', icon: Keyboard, desc: 'Pointer speed, natural scrolling, and custom shortcuts' },
  ];

  const filteredPanels = useMemo(() => {
    if (!searchQuery.trim()) return panels;
    const q = searchQuery.toLowerCase();
    return panels.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  }, [searchQuery]);

  const handleTestSound = () => {
    setTestSoundPlaying(true);
    try {
      if (typeof window !== 'undefined' && window.AudioContext) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio context might be restricted
    }
    setTimeout(() => setTestSoundPlaying(false), 500);
  };

  const handleAddUser = () => {
    if (!newUserName.trim()) return;
    const cleanUsername = newUserName.toLowerCase().replace(/\s+/g, '-');
    const newUser = {
      id: `u-${Date.now()}`,
      name: newUserName.trim(),
      username: `${cleanUsername}@caelum-os`,
      role: newUserRole,
      avatarColor: currentSettings.accentColor
    };
    update(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
    setNewUserName('');
    setNewUserModalOpen(false);
  };

  return (
    <div className="flex-grow flex bg-[#0e0e11] text-slate-100 min-h-0 select-none font-sans h-full">
      {/* 1. Left Sidebar Navigation */}
      <div className="w-64 bg-[#121216] border-r border-neutral-800/80 flex flex-col min-h-0 flex-shrink-0">
        {/* Search Header */}
        <div className="p-3 border-b border-neutral-800/80">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-750 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-sans transition-colors"
            />
          </div>
        </div>

        {/* Panel List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredPanels.map((panel) => {
            const Icon = panel.icon;
            const isActive = activePanel === panel.id;
            return (
              <button
                key={panel.id}
                onClick={() => setActivePanel(panel.id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-2xs font-bold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-neutral-850/60'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="truncate flex-1">{panel.name}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Content Details Pane */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#0e0e11] overflow-y-auto p-6 space-y-6">
        
        {/* PANEL 1: APPEARANCE */}
        {activePanel === 'appearance' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-slate-100 font-sans">Appearance</h2>
              <p className="text-xs text-slate-400">Configure desktop style, window themes, and desktop background</p>
            </div>

            {/* Light / Dark Mode Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => update(prev => ({ ...prev, themeMode: 'light' }))}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  currentSettings.themeMode === 'light' 
                    ? 'bg-neutral-900 border-sky-500 ring-2 ring-sky-500/30 shadow-md' 
                    : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="h-20 bg-slate-100 rounded-xl border border-slate-300 p-2 flex flex-col justify-between shadow-inner">
                  <div className="h-2 w-12 bg-slate-400 rounded-full" />
                  <div className="flex space-x-1.5">
                    <div className="w-4 h-4 bg-orange-500 rounded" />
                    <div className="flex-1 h-4 bg-slate-300 rounded" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200">Light</span>
                  </div>
                  {currentSettings.themeMode === 'light' && <Check className="w-4 h-4 text-sky-400" />}
                </div>
              </div>

              <div 
                onClick={() => update(prev => ({ ...prev, themeMode: 'dark' }))}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  currentSettings.themeMode === 'dark' 
                    ? 'bg-neutral-900 border-sky-500 ring-2 ring-sky-500/30 shadow-md' 
                    : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="h-20 bg-[#1e1e24] rounded-xl border border-neutral-750 p-2 flex flex-col justify-between shadow-inner">
                  <div className="h-2 w-12 bg-neutral-600 rounded-full" />
                  <div className="flex space-x-1.5">
                    <div className="w-4 h-4 bg-orange-500 rounded" />
                    <div className="flex-1 h-4 bg-neutral-700 rounded" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-200">Dark (Default)</span>
                  </div>
                  {currentSettings.themeMode === 'dark' && <Check className="w-4 h-4 text-sky-400" />}
                </div>
              </div>
            </div>

            {/* Accent Colors */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Accent Color</span>
              <div className="flex items-center space-x-3">
                {ACCENT_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => update(prev => ({ ...prev, accentColor: color.hex }))}
                    className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center relative hover:scale-110`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {currentSettings.accentColor === color.hex && (
                      <Check className="w-4 h-4 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Backgrounds / Wallpapers */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Background Wallpaper</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {WALLPAPER_OPTIONS.map(wp => (
                  <div
                    key={wp.id}
                    onClick={() => update(prev => ({ ...prev, wallpaper: wp.id }))}
                    className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col space-y-2 ${
                      currentSettings.wallpaper === wp.id
                        ? 'border-sky-500 bg-neutral-850 ring-1 ring-sky-500/30'
                        : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/50'
                    }`}
                  >
                    <div className={`h-16 rounded-lg bg-gradient-to-br ${wp.preview} border border-white/10 flex items-center justify-center shadow-inner`}>
                      {currentSettings.wallpaper === wp.id && (
                        <div className="w-6 h-6 rounded-full bg-sky-500/90 flex items-center justify-center text-white shadow">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block truncate">{wp.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{wp.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: DISPLAYS & NIGHT LIGHT */}
        {activePanel === 'displays' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-slate-100 font-sans">Displays & Night Light</h2>
              <p className="text-xs text-slate-400">Resolution, interface scaling, and warm color eye comfort filters</p>
            </div>

            {/* Display Specs Card */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-sky-400" />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Primary Display (Built-in Screen)</span>
                  <span className="text-[10px] font-mono text-slate-400">Color Profile: sRGB IEC61966-2.1</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-800 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[11px]">Resolution</label>
                  <select 
                    value={currentSettings.resolution}
                    onChange={(e) => update(prev => ({ ...prev, resolution: e.target.value }))}
                    className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-750 text-slate-200 font-mono focus:outline-none"
                  >
                    <option value="1920x1080 (16:9)">1920 &times; 1080 (16:9) FHD</option>
                    <option value="2560x1440 (16:9)">2560 &times; 1440 (16:9) 2K</option>
                    <option value="3840x2160 (16:9)">3840 &times; 2160 (16:9) 4K</option>
                    <option value="1440x900 (16:10)">1440 &times; 900 (16:10)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[11px]">Refresh Rate</label>
                  <select 
                    value={currentSettings.refreshRate}
                    onChange={(e) => update(prev => ({ ...prev, refreshRate: e.target.value }))}
                    className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-750 text-slate-200 font-mono focus:outline-none"
                  >
                    <option value="60 Hz">60.00 Hz</option>
                    <option value="120 Hz">120.00 Hz (ProMotion)</option>
                    <option value="144 Hz">144.00 Hz</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-slate-400 mb-2 font-mono text-[11px]">Interface Scale</label>
                <div className="grid grid-cols-4 gap-2">
                  {['100%', '125%', '150%', '200%'].map(scale => (
                    <button
                      key={scale}
                      onClick={() => update(prev => ({ ...prev, displayScale: scale }))}
                      className={`py-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-colors ${
                        currentSettings.displayScale === scale
                          ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                          : 'bg-neutral-900 border-neutral-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {scale}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Night Light Section */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Night Light (Eye Comfort)</h4>
                  <p className="text-[11px] text-slate-400">Makes the screen color warmer to reduce eye strain and assist sleep</p>
                </div>
                <div 
                  onClick={() => update(prev => ({ ...prev, nightLight: !prev.nightLight }))}
                  className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${
                    currentSettings.nightLight ? 'bg-amber-500' : 'bg-neutral-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    currentSettings.nightLight ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              {currentSettings.nightLight && (
                <div className="pt-3 border-t border-neutral-800 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Color Temperature</span>
                    <span className="text-amber-400 font-bold">{currentSettings.nightLightWarmth}% Warm</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={currentSettings.nightLightWarmth}
                    onChange={(e) => update(prev => ({ ...prev, nightLightWarmth: Number(e.target.value) }))}
                    className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Less Warm</span>
                    <span>Warmer (3200K)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PANEL 3: UBUNTU DESKTOP */}
        {activePanel === 'desktop' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-slate-100 font-sans">Ubuntu Desktop</h2>
              <p className="text-xs text-slate-400">Customize the application dock, size, auto-hide, and desktop icons</p>
            </div>

            {/* Dock Position */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Dock Position on Screen</span>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'left', label: 'Left (Ubuntu Default)' },
                  { id: 'bottom', label: 'Bottom' },
                  { id: 'right', label: 'Right' },
                ].map(pos => (
                  <button
                    key={pos.id}
                    onClick={() => update(prev => ({ ...prev, dockPosition: pos.id as any }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors text-center ${
                      currentSettings.dockPosition === pos.id
                        ? 'bg-sky-500/20 border-sky-500 text-sky-400 font-bold'
                        : 'bg-neutral-900 border-neutral-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>

              {/* Icon Size Slider */}
              <div className="pt-3 border-t border-neutral-800 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Dock Icon Size</span>
                  <span className="text-sky-400 font-bold">{currentSettings.dockIconSize} px</span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="64"
                  value={currentSettings.dockIconSize}
                  onChange={(e) => update(prev => ({ ...prev, dockIconSize: Number(e.target.value) }))}
                  className="w-full accent-sky-500 bg-neutral-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              {/* Auto Hide */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Auto-hide the Dock</h4>
                  <p className="text-[11px] text-slate-400">Dock hides when windows overlap its screen area</p>
                </div>
                <div 
                  onClick={() => update(prev => ({ ...prev, dockAutoHide: !prev.dockAutoHide }))}
                  className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${
                    currentSettings.dockAutoHide ? 'bg-sky-500' : 'bg-neutral-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    currentSettings.dockAutoHide ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </div>

            {/* Desktop Icons */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Desktop Shortcuts</span>
              
              <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                <div className="flex items-center space-x-2.5">
                  <Folder className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-slate-200">Personal Home Folder</span>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.showHomeOnDesktop}
                  onChange={(e) => update(prev => ({ ...prev, showHomeOnDesktop: e.target.checked }))}
                  className="rounded accent-sky-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                <div className="flex items-center space-x-2.5">
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-slate-200">Trash Can</span>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.showTrashOnDesktop}
                  onChange={(e) => update(prev => ({ ...prev, showTrashOnDesktop: e.target.checked }))}
                  className="rounded accent-sky-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2.5">
                  <HardDrive className="w-4 h-4 text-sky-400" />
                  <span className="text-xs text-slate-200">Mounted Disks and Network Drives</span>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.showMountedDrives}
                  onChange={(e) => update(prev => ({ ...prev, showMountedDrives: e.target.checked }))}
                  className="rounded accent-sky-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* PANEL 4: SOUND */}
        {activePanel === 'sound' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-slate-100 font-sans">Sound</h2>
              <p className="text-xs text-slate-400">Configure master volume, per-application streams, and alert sound effects</p>
            </div>

            {/* Master Output Card */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Master Output Volume</h4>
                  <p className="text-[11px] text-slate-400">{currentSettings.defaultOutputDevice}</p>
                </div>
                <button
                  onClick={handleTestSound}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                    testSoundPlaying ? 'bg-sky-500 text-white border-sky-400' : 'bg-neutral-800 text-slate-300 border-neutral-700 hover:text-white'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{testSoundPlaying ? 'Playing...' : 'Test Sound'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <VolumeX className="w-4 h-4 text-slate-500" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentSettings.masterVolume}
                  onChange={(e) => update(prev => ({ ...prev, masterVolume: Number(e.target.value) }))}
                  className="flex-1 accent-sky-500 bg-neutral-800 h-1.5 rounded cursor-pointer"
                />
                <Volume2 className="w-4 h-4 text-sky-400" />
                <span className="w-8 text-right font-mono text-xs font-bold text-slate-200">{currentSettings.masterVolume}%</span>
              </div>
            </div>

            {/* Input Level */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Microphone Input Level</h4>
                  <p className="text-[11px] text-slate-400">{currentSettings.defaultInputDevice}</p>
                </div>
                <Mic className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentSettings.inputVolume}
                  onChange={(e) => update(prev => ({ ...prev, inputVolume: Number(e.target.value) }))}
                  className="flex-1 accent-emerald-500 bg-neutral-800 h-1.5 rounded cursor-pointer"
                />
                <span className="w-8 text-right font-mono text-xs font-bold text-slate-200">{currentSettings.inputVolume}%</span>
              </div>
            </div>

            {/* Per-Application Volume Mixer */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Applications Mixer</span>
              {Object.entries(currentSettings.appVolumes).map(([app, vol]) => (
                <div key={app} className="flex items-center justify-between py-1.5 border-b border-neutral-800 last:border-b-0 text-xs">
                  <span className="text-slate-300 w-32 truncate">{app}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={vol}
                    onChange={(e) => {
                      const newVol = Number(e.target.value);
                      update(prev => ({
                        ...prev,
                        appVolumes: { ...prev.appVolumes, [app]: newVol }
                      }));
                    }}
                    className="flex-1 mx-4 accent-sky-500 bg-neutral-800 h-1.5 rounded"
                  />
                  <span className="w-8 text-right font-mono text-slate-400">{vol}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PANEL 5: NETWORK & WI-FI */}
        {activePanel === 'network' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-slate-100 font-sans">Network & Wi-Fi</h2>
              <p className="text-xs text-slate-400">Manage wired network, wireless access points, VPN, and proxy profiles</p>
            </div>

            {/* Wired Ethernet */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Laptop className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Wired Ethernet (eth0)</span>
                  <span className="text-[10px] font-mono text-slate-400">Connected &bull; 1000 Mb/s &bull; IPv4: 192.168.1.120</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold">
                CONNECTED
              </span>
            </div>

            {/* Wi-Fi Radio & Networks */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Wi-Fi (wlan0)</h4>
                  <p className="text-[11px] text-slate-400">Scan and connect to local wireless networks</p>
                </div>
                <div 
                  onClick={() => update(prev => ({ ...prev, wifiEnabled: !prev.wifiEnabled }))}
                  className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${
                    currentSettings.wifiEnabled ? 'bg-sky-500' : 'bg-neutral-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    currentSettings.wifiEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              {currentSettings.wifiEnabled && (
                <div className="space-y-1 pt-2 border-t border-neutral-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Available Networks</span>
                  {[
                    { ssid: 'Caelum-Cloud-Mesh (5 GHz)', signal: '100%', secure: true, active: true },
                    { ssid: 'DevOps-Office-Guest', signal: '80%', secure: true, active: false },
                    { ssid: 'Starlink_WLAN_24G', signal: '65%', secure: true, active: false },
                  ].map(net => (
                    <div 
                      key={net.ssid} 
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                        net.active ? 'bg-sky-500/10 border-sky-500/30' : 'bg-neutral-900/40 border-neutral-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Wifi className={`w-4 h-4 ${net.active ? 'text-sky-400' : 'text-slate-400'}`} />
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">{net.ssid}</span>
                          <span className="text-[10px] font-mono text-slate-400">Signal: {net.signal} &bull; WPA3-Personal</span>
                        </div>
                      </div>
                      {net.active ? (
                        <span className="text-[10px] font-mono text-sky-400 font-bold">Connected</span>
                      ) : (
                        <button 
                          onClick={() => update(prev => ({ ...prev, activeWifiSsid: net.ssid }))}
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-slate-300 font-medium cursor-pointer"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* VPN Profile */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200">WireGuard Corporate VPN</h4>
                <p className="text-[11px] text-slate-400">Secure encrypted tunnel for staging environments</p>
              </div>
              <div 
                onClick={() => update(prev => ({ ...prev, vpnEnabled: !prev.vpnEnabled }))}
                className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${
                  currentSettings.vpnEnabled ? 'bg-emerald-500' : 'bg-neutral-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  currentSettings.vpnEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </div>
          </div>
        )}

        {/* PANEL 6: BLUETOOTH */}
        {activePanel === 'bluetooth' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-slate-100 font-sans">Bluetooth</h2>
              <p className="text-xs text-slate-400">Pair wireless accessories, headphones, input devices, and transfer files</p>
            </div>

            {/* Toggle */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200">Bluetooth Radio</h4>
                <p className="text-[11px] text-slate-400">Visible as "caelum-workstation" to nearby devices</p>
              </div>
              <div 
                onClick={() => update(prev => ({ ...prev, bluetoothEnabled: !prev.bluetoothEnabled }))}
                className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${
                  currentSettings.bluetoothEnabled ? 'bg-sky-500' : 'bg-neutral-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  currentSettings.bluetoothEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </div>

            {/* Paired Peripherals List */}
            {currentSettings.bluetoothEnabled && (
              <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Paired Devices</span>
                {currentSettings.pairedDevices.map(dev => (
                  <div key={dev.id} className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {dev.type === 'headset' && <Headphones className="w-4 h-4 text-purple-400" />}
                      {dev.type === 'mouse' && <Mouse className="w-4 h-4 text-sky-400" />}
                      {dev.type === 'keyboard' && <Keyboard className="w-4 h-4 text-orange-400" />}
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{dev.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {dev.connected ? `Connected ${dev.battery ? `• Battery: ${dev.battery}%` : ''}` : 'Disconnected'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        update(prev => ({
                          ...prev,
                          pairedDevices: prev.pairedDevices.map(d => d.id === dev.id ? { ...d, connected: !d.connected } : d)
                        }));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] text-slate-300 font-mono cursor-pointer"
                    >
                      {dev.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PANEL 7: MULTITASKING */}
        {activePanel === 'multitasking' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-slate-100 font-sans">Multitasking</h2>
              <p className="text-xs text-slate-400">Window snapping, screen corners, and virtual workspaces behavior</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Active Hot Screen Corners</h4>
                  <p className="text-[11px] text-slate-400">Push mouse pointer into top-left corner to trigger Activities overview</p>
                </div>
                <div 
                  onClick={() => update(prev => ({ ...prev, hotCorner: !prev.hotCorner }))}
                  className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${
                    currentSettings.hotCorner ? 'bg-sky-500' : 'bg-neutral-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    currentSettings.hotCorner ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Screen Edge Tiling (Snap Windows)</h4>
                  <p className="text-[11px] text-slate-400">Drag windows to screen edges to snap half or quarter display</p>
                </div>
                <div 
                  onClick={() => update(prev => ({ ...prev, screenEdgeTiling: !prev.screenEdgeTiling }))}
                  className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${
                    currentSettings.screenEdgeTiling ? 'bg-sky-500' : 'bg-neutral-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    currentSettings.screenEdgeTiling ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Dynamic Workspaces</h4>
                  <p className="text-[11px] text-slate-400">Automatically add new workspace when an existing one is filled</p>
                </div>
                <div 
                  onClick={() => update(prev => ({ ...prev, dynamicWorkspaces: !prev.dynamicWorkspaces }))}
                  className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${
                    currentSettings.dynamicWorkspaces ? 'bg-sky-500' : 'bg-neutral-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    currentSettings.dynamicWorkspaces ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 8: PRIVACY & SECURITY */}
        {activePanel === 'privacy' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-slate-100 font-sans">Privacy & Security</h2>
              <p className="text-xs text-slate-400">Camera, microphone hardware permissions, screen lock, and diagnostic data</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Camera className="w-5 h-5 text-sky-400" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Camera Access</h4>
                    <p className="text-[11px] text-slate-400">Allow desktop and web applications to use camera sensors</p>
                  </div>
                </div>
                <div 
                  onClick={() => update(prev => ({ ...prev, cameraAccess: !prev.cameraAccess }))}
                  className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${
                    currentSettings.cameraAccess ? 'bg-emerald-500' : 'bg-neutral-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    currentSettings.cameraAccess ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                <div className="flex items-center space-x-3">
                  <Mic className="w-5 h-5 text-purple-400" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Microphone Access</h4>
                    <p className="text-[11px] text-slate-400">Allow applications to record audio input</p>
                  </div>
                </div>
                <div 
                  onClick={() => update(prev => ({ ...prev, microphoneAccess: !prev.microphoneAccess }))}
                  className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${
                    currentSettings.microphoneAccess ? 'bg-emerald-500' : 'bg-neutral-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    currentSettings.microphoneAccess ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Screen Lock Timeout</h4>
                    <p className="text-[11px] text-slate-400">Automatically locks workstation when inactive</p>
                  </div>
                </div>
                <select
                  value={currentSettings.screenLockDelay}
                  onChange={(e) => update(prev => ({ ...prev, screenLockDelay: e.target.value }))}
                  className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-750 text-xs text-slate-200 font-mono"
                >
                  <option value="1m">1 minute</option>
                  <option value="5m">5 minutes</option>
                  <option value="15m">15 minutes</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 9: POWER */}
        {activePanel === 'power' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-slate-100 font-sans">Power</h2>
              <p className="text-xs text-slate-400">Power profiles, battery health, and energy saving timing</p>
            </div>

            {/* Power Profiles */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Power Profile</span>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'performance', title: 'Performance', desc: 'Max CPU boost', icon: Zap },
                  { id: 'balanced', title: 'Balanced', desc: 'Standard usage', icon: BatteryCharging },
                  { id: 'power-saver', title: 'Power Saver', desc: 'Preserves battery', icon: Battery }
                ].map(p => {
                  const Icon = p.icon;
                  const isSelected = currentSettings.powerProfile === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => update(prev => ({ ...prev, powerProfile: p.id as any }))}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-sky-500/20 border-sky-500 text-white' 
                          : 'bg-neutral-900 border-neutral-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold block">{p.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{p.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Battery Protection */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200">Battery Health Limiter (80% Cap)</h4>
                <p className="text-[11px] text-slate-400">Limits charging to 80% to prolong battery lifespan during plugged desktop use</p>
              </div>
              <div 
                onClick={() => update(prev => ({ ...prev, batteryProtection: !prev.batteryProtection }))}
                className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${
                  currentSettings.batteryProtection ? 'bg-emerald-500' : 'bg-neutral-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  currentSettings.batteryProtection ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </div>
          </div>
        )}

        {/* PANEL 10: REGION & LANGUAGE */}
        {activePanel === 'region' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-slate-100 font-sans">Region & Language</h2>
              <p className="text-xs text-slate-400">Display language, regional number and date formatting, and input keyboard sources</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Display Language</label>
                <select
                  value={currentSettings.displayLanguage}
                  onChange={(e) => update(prev => ({ ...prev, displayLanguage: e.target.value }))}
                  className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-750 text-xs text-slate-200 font-mono"
                >
                  <option value="English (United States)">English (United States)</option>
                  <option value="English (United Kingdom)">English (United Kingdom)</option>
                  <option value="German (Deutsch)">German (Deutsch)</option>
                  <option value="French (Français)">French (Français)</option>
                  <option value="Japanese (日本語)">Japanese (日本語)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-neutral-800">
                <label className="block text-xs font-bold text-slate-200 mb-1">Keyboard Input Source</label>
                <select
                  value={currentSettings.inputSource}
                  onChange={(e) => update(prev => ({ ...prev, inputSource: e.target.value }))}
                  className="w-full p-2 rounded-lg bg-neutral-900 border border-neutral-750 text-xs text-slate-200 font-mono"
                >
                  <option value="English (US, intl., altgr dead keys)">English (US, intl., altgr dead keys)</option>
                  <option value="English (US)">English (US, standard)</option>
                  <option value="English (Dvorak)">English (Dvorak)</option>
                  <option value="German (QWERTZ)">German (QWERTZ)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 11: USERS */}
        {activePanel === 'users' && (
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-100 font-sans">Users</h2>
                <p className="text-xs text-slate-400">Manage local user accounts, administrative privileges, and password rules</p>
              </div>
              <button
                onClick={() => setNewUserModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add User...</span>
              </button>
            </div>

            {/* Users List */}
            <div className="space-y-3">
              {currentSettings.users.map(u => (
                <div key={u.id} className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow"
                      style={{ backgroundColor: u.avatarColor || '#e95420' }}
                    >
                      {u.name.substring(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{u.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400">{u.username} &bull; {u.role}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[9px] font-mono font-bold">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>

            {/* Add User Modal */}
            {newUserModalOpen && (
              <div className="p-4 rounded-2xl bg-neutral-900 border border-sky-500/40 shadow-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-200">Add New User Account</h4>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full p-2 rounded-lg bg-neutral-850 border border-neutral-750 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Account Role</label>
                  <div className="flex space-x-3 text-xs">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={newUserRole === 'Standard'}
                        onChange={() => setNewUserRole('Standard')}
                        className="accent-sky-500"
                      />
                      <span>Standard User</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={newUserRole === 'Administrator'}
                        onChange={() => setNewUserRole('Administrator')}
                        className="accent-sky-500"
                      />
                      <span>Administrator</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setNewUserModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 text-xs text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUser}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 text-xs font-bold text-white"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANEL 12: KEYBOARD & MOUSE */}
        {activePanel === 'keyboard_mouse' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-slate-100 font-sans">Keyboard & Mouse</h2>
              <p className="text-xs text-slate-400">Pointer speed, natural scrolling, key repeat rates, and shortcut mappings</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Pointer Speed</span>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentSettings.mouseSpeed}
                  onChange={(e) => update(prev => ({ ...prev, mouseSpeed: Number(e.target.value) }))}
                  className="flex-1 accent-sky-500 bg-neutral-800 h-1.5 rounded cursor-pointer"
                />
                <span className="w-8 text-right font-mono text-xs font-bold text-slate-200">{currentSettings.mouseSpeed}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Natural Scrolling</h4>
                  <p className="text-[11px] text-slate-400">Content moves in direction of two-finger swipe or wheel movement</p>
                </div>
                <div 
                  onClick={() => update(prev => ({ ...prev, naturalScrolling: !prev.naturalScrolling }))}
                  className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${
                    currentSettings.naturalScrolling ? 'bg-sky-500' : 'bg-neutral-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    currentSettings.naturalScrolling ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800 space-y-2">
                <span className="text-xs font-bold text-slate-200 font-mono uppercase">Key Repeat Rate</span>
                <input
                  type="range"
                  min="20"
                  max="60"
                  value={currentSettings.keyRepeatRate}
                  onChange={(e) => update(prev => ({ ...prev, keyRepeatRate: Number(e.target.value) }))}
                  className="w-full accent-sky-500 bg-neutral-800 h-1.5 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Slow</span>
                  <span>Fast ({currentSettings.keyRepeatRate} chars/sec)</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
