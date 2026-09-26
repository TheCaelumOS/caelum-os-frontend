"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  Battery, 
  Power, 
  Lock, 
  Unlock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  ShieldCheck, 
  Terminal, 
  Check, 
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { AuthUser, loginWithCredentials } from '../lib/api';

interface LockScreenProps {
  wallpaperClass: string;
  isBooting: boolean;
  onBootComplete: () => void;
  onUnlock: () => void;
  user?: AuthUser;
  onRestart?: () => void;
}

export default function LockScreen({
  wallpaperClass,
  isBooting,
  onBootComplete,
  onUnlock,
  user,
  onRestart,
}: LockScreenProps) {
  // Clock state
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  // Mode: 'quick_unlock' (normal authenticated session) or 'password' (credential entry)
  const [authMode, setAuthMode] = useState<'quick_unlock' | 'password'>('quick_unlock');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Boot sequence state
  const [bootStep, setBootStep] = useState(0);
  const bootMessages = [
    'Starting CaelumOS kernel...',
    'Loading system modules...',
    'Initializing cloud runtime & containers...',
    'Mounting virtual filesystem...',
    'Starting desktop manager...'
  ];

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Boot sequence timer (~1.3s total)
  useEffect(() => {
    if (!isBooting) return;

    const stepInterval = setInterval(() => {
      setBootStep((prev) => {
        if (prev < bootMessages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 240);

    const finishTimer = setTimeout(() => {
      onBootComplete();
    }, 1350);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(finishTimer);
    };
  }, [isBooting, onBootComplete]);

  // Global keyboard listener: Enter unlocks or submits login
  useEffect(() => {
    if (isBooting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (authMode === 'quick_unlock') {
          handleQuickUnlock();
        } else {
          handlePasswordSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBooting, authMode, password]);

  const handleQuickUnlock = () => {
    onUnlock();
  };

  const handlePasswordSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    const targetEmail = user?.email || 'dev@caelum-os.io';
    // Allow either entered password or default developer password
    const result = await loginWithCredentials(targetEmail, password || 'CaelumDeveloper123!');

    setIsSubmitting(false);
    if (result.success) {
      onUnlock();
    } else {
      setLoginError(result.error || 'Authentication failed. Please try again.');
    }
  };

  const fillDeveloperCredentials = () => {
    setPassword('CaelumDeveloper123!');
  };

  // 1. BOOT SPLASH PHASE
  if (isBooting) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d020e] text-white select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center space-y-6"
        >
          {/* CaelumOS Logo with subtle breathing pulse */}
          <div className="relative">
            <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
            <img
              src="/branding/caelumos-icon.png"
              alt="CaelumOS Logo"
              className="relative w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-[0_0_25px_rgba(233,84,32,0.4)]"
            />
          </div>

          {/* Title & Tag */}
          <div className="text-center space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              CaelumOS
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono tracking-widest uppercase">
              Cloud Infrastructure Desktop
            </p>
          </div>

          {/* Plymouth-style Progress Bar */}
          <div className="w-56 sm:w-64 space-y-2 pt-2">
            <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.3, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400 rounded-full"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-0.5">
              <span>Starting...</span>
              <span className="text-slate-500 truncate max-w-[150px]">
                {bootMessages[bootStep]}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Footer subtle brand */}
        <div className="absolute bottom-6 text-[11px] text-slate-400 font-mono">
          CaelumOS &bull; Linux Kernel 6.8 &bull; Unified Cloud Workspace
        </div>
      </div>
    );
  }

  // 2. LOCK SCREEN PHASE
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        y: -50,
        scale: 1.03,
        filter: 'blur(10px)',
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
      }}
      className={`fixed inset-0 z-50 flex flex-col justify-between ${wallpaperClass} select-none font-sans text-slate-200 overflow-hidden`}
    >
      {/* Frosted Glass Dark Backdrop Overlay */}
      <div className="absolute inset-0 bg-neutral-950/45 backdrop-blur-2xl transition-all duration-300" />
      <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60 pointer-events-none" />

      {/* Top Panel (GNOME Lock Bar) */}
      <div className="relative z-10 w-full h-8 px-5 flex items-center justify-between text-xs text-slate-300 font-medium bg-neutral-950/40 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <img
            src="/branding/caelumos-icon.png"
            alt="CaelumOS"
            className="w-3.5 h-3.5 object-contain"
          />
          <span className="font-bold tracking-wide text-white">CaelumOS 24.04 LTS</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Cloud Connected</span>
          </span>
          <div className="flex items-center space-x-3 text-slate-350">
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center space-x-1">
              <Battery className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono">100%</span>
            </div>
            {onRestart && (
              <button
                onClick={onRestart}
                title="Reboot / Restart CaelumOS"
                className="hover:text-amber-400 p-0.5 rounded cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Center Display: Giant Digital Clock + User Identity & Unlock Controls */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-lg mx-auto w-full">
        {/* Giant Digital Clock */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8 sm:mb-12 select-none"
        >
          <div className="text-6xl sm:text-8xl md:text-9xl font-light tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] font-sans">
            {timeStr || '12:00'}
          </div>
          <div className="text-base sm:text-xl font-medium text-slate-250 drop-shadow-md mt-1">
            {dateStr || 'Loading date...'}
          </div>
        </motion.div>

        {/* User Identity & Unlock Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full flex flex-col items-center"
        >
          {/* User Avatar Card */}
          <div className="flex flex-col items-center space-y-3 mb-6">
            <div className="relative group">
              <div 
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-white/20 p-1 bg-neutral-900/80 shadow-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                style={{
                  boxShadow: `0 0 30px ${user?.avatarColor || '#e95420'}40`
                }}
              >
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-inner"
                  style={{ backgroundColor: user?.avatarColor || '#e95420' }}
                >
                  {(user?.name || 'Caelum Engineer').charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Online / Active Session Badge */}
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-neutral-950 flex items-center justify-center shadow">
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-white tracking-wide">
                {user?.name || 'Caelum Engineer'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {user?.email || 'dev@caelum-os.io'} &bull; {user?.role || 'Administrator'}
              </p>
            </div>
          </div>

          {/* Action Form / Quick Unlock Button */}
          {authMode === 'quick_unlock' ? (
            <div className="w-full flex flex-col items-center space-y-4">
              {/* Primary Unlock Button */}
              <button
                onClick={handleQuickUnlock}
                className="group w-full max-w-xs py-3 px-6 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-sm shadow-xl shadow-orange-600/30 flex items-center justify-center space-x-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Unlock className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>Unlock CaelumOS</span>
                <ChevronRight className="w-4 h-4 opacity-75 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Press Enter helper */}
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/15 text-slate-200 font-mono text-[10px] shadow-xs">
                  Enter ↵
                </kbd>
                <span className="animate-pulse">Press Enter to unlock</span>
              </div>

              {/* Switch to password entry */}
              <button
                onClick={() => {
                  setAuthMode('password');
                  setLoginError('');
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer pt-2 flex items-center space-x-1"
              >
                <Lock className="w-3 h-3" />
                <span>Log in with password</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="w-full max-w-xs space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter user password..."
                  autoFocus
                  className="w-full pl-3.5 pr-18 py-2.5 rounded-xl bg-neutral-900/80 border border-white/15 focus:border-orange-500/80 text-white text-xs placeholder-slate-400 focus:outline-none backdrop-blur-md shadow-inner transition-colors"
                />
                <div className="absolute right-1 top-1 bottom-1 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-white rounded cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="p-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white cursor-pointer transition-colors disabled:opacity-50"
                    title="Unlock"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-[11px] text-center">
                  {loginError}
                </div>
              )}

              {/* Developer helper badge & quick fill */}
              <div className="flex items-center justify-between text-[11px] pt-1 px-1 text-slate-400">
                <button
                  type="button"
                  onClick={fillDeveloperCredentials}
                  className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  Quick Fill Developer Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('quick_unlock');
                    setLoginError('');
                  }}
                  className="text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      {/* Bottom Information Bar */}
      <div className="relative z-10 w-full px-6 py-3 flex items-center justify-between text-[11px] text-slate-400/80 border-t border-white/5 bg-neutral-950/20 backdrop-blur-xs">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span>CaelumOS v1.0.0 &bull; Ubuntu Engine</span>
        </div>
        <div>
          <span>Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-slate-300">Enter</kbd> to unlock</span>
        </div>
      </div>
    </motion.div>
  );
}
