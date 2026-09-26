"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  Battery, 
  Lock, 
  Unlock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Terminal, 
  Check, 
  User,
  UserPlus,
  AlertCircle,
  Loader2,
  Clock
} from 'lucide-react';
import { AuthUser, unlockWithPassword, loginWithCredentials, registerWithCredentials } from '../lib/api';

interface LockScreenProps {
  wallpaperClass: string;
  isBooting: boolean;
  onBootComplete: () => void;
  onUnlockSuccess: (user?: AuthUser) => void;
  user?: AuthUser;
  onRestart?: () => void;
  isFullLoginRequired?: boolean;
}

export default function LockScreen({
  wallpaperClass,
  isBooting,
  onBootComplete,
  onUnlockSuccess,
  user,
  onRestart,
  isFullLoginRequired = false,
}: LockScreenProps) {
  // Clock state
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  // Authentication inputs
  const [email, setEmail] = useState(user?.email || 'dev@caelum-os.io');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // Rate-limiting lockout state
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // UI Modes: 'lock' (password for active user), 'switch_user' (enter different email+password), 'register' (create new account)
  const [viewMode, setViewMode] = useState<'lock' | 'switch_user' | 'register'>(
    isFullLoginRequired ? 'switch_user' : 'lock'
  );

  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Sync user email if prop updates
  useEffect(() => {
    if (user?.email && viewMode === 'lock') {
      setEmail(user.email);
    }
  }, [user, viewMode]);

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

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setLoginError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Boot sequence timer (~1.2s total)
  useEffect(() => {
    if (!isBooting) return;
    const finishTimer = setTimeout(() => {
      onBootComplete();
    }, 1250);
    return () => clearTimeout(finishTimer);
  }, [isBooting, onBootComplete]);

  // Auto-focus password input when lock screen appears
  useEffect(() => {
    if (!isBooting) {
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 150);
    }
  }, [isBooting, viewMode]);

  // Password submission with REAL backend verification
  const handlePasswordSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting || lockoutSeconds > 0) return;

    if (!password) {
      triggerShake('Please enter your password');
      return;
    }

    setIsSubmitting(true);
    setLoginError('');

    try {
      const targetEmail = email.trim() || user?.email || 'dev@caelum-os.io';
      
      let res;
      if (viewMode === 'register') {
        res = await registerWithCredentials(targetEmail, password);
      } else if (viewMode === 'switch_user') {
        res = await loginWithCredentials(targetEmail, password);
      } else {
        res = await unlockWithPassword(targetEmail, password);
      }

      setIsSubmitting(false);

      if (res.success && res.user) {
        setPassword('');
        setLoginError('');
        onUnlockSuccess(res.user);
      } else {
        // Handle Rate Limiting / Lockout (429)
        if (res.statusCode === 429) {
          const waitTime = res.retryAfter || 60;
          setLockoutSeconds(waitTime);
          triggerShake(res.error || `Too many failed attempts. Account locked for ${waitTime} seconds.`);
        } else {
          // Wrong password (401)
          triggerShake('Incorrect password');
        }
      }
    } catch {
      setIsSubmitting(false);
      triggerShake('Authentication daemon unavailable');
    }
  };

  const triggerShake = (errorMsg: string) => {
    setLoginError(errorMsg);
    setIsShaking(true);
    setPassword('');
    setTimeout(() => {
      setIsShaking(false);
      passwordInputRef.current?.focus();
    }, 500);
  };

  // 1. BOOT SPLASH PHASE
  if (isBooting) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d020e] text-white select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="flex flex-col items-center space-y-6"
        >
          {/* CaelumOS Logo with subtle breathing pulse */}
          <div className="relative">
            <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
            <img
              src="/branding/caelumos-icon.png"
              alt="CaelumOS Logo"
              className="relative w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]"
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
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 rounded-full"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-0.5">
              <span>Starting...</span>
              <span className="text-slate-500 truncate">Loading system...</span>
            </div>
          </div>
        </motion.div>

        {/* Footer brand */}
        <div className="absolute bottom-6 text-[11px] text-slate-500 font-mono">
          CaelumOS &bull; Linux Kernel 6.8 &bull; Authenticated Core
        </div>
      </div>
    );
  }

  // 2. LOCK / LOGIN SCREEN PHASE
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
      <div className="absolute inset-0 bg-neutral-950/50 backdrop-blur-2xl transition-all duration-300" />
      <div className="absolute inset-0 bg-radial from-transparent via-black/25 to-black/70 pointer-events-none" />

      {/* Top Panel (GNOME Lock Bar) */}
      <div className="relative z-10 w-full h-8 px-5 flex items-center justify-between text-xs text-slate-300 font-medium bg-neutral-950/40 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <img
            src="/branding/caelumos-icon.png"
            alt="CaelumOS"
            className="w-3.5 h-3.5 object-contain rounded"
          />
          <span className="font-bold tracking-wide text-white">CaelumOS 24.04 LTS</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Secure Node</span>
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

      {/* Center Display: Giant Digital Clock + Authentic OS Password Form */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-sm mx-auto w-full">
        {/* Giant Digital Clock */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="text-center mb-6 sm:mb-8 select-none"
        >
          <div className="text-6xl sm:text-7xl md:text-8xl font-light tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] font-sans">
            {timeStr || '12:00'}
          </div>
          <div className="text-sm sm:text-base font-medium text-slate-300 drop-shadow-md mt-1">
            {dateStr || 'Loading date...'}
          </div>
        </motion.div>

        {/* User Identity & Password Card with Shake Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            x: isShaking ? [-14, 14, -10, 10, -6, 6, -2, 2, 0] : 0,
          }}
          transition={{
            x: { duration: 0.45, ease: 'easeInOut' },
            opacity: { duration: 0.45, delay: 0.2 },
            y: { duration: 0.45, delay: 0.2 }
          }}
          className="w-full flex flex-col items-center"
        >
          {/* CaelumOS Brand Logo */}
          <div className="flex flex-col items-center space-y-3 mb-5">
            <div className="relative group">
              <div 
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl border border-white/20 p-2 bg-neutral-900/90 shadow-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 backdrop-blur-xl"
                style={{
                  boxShadow: '0 0 35px rgba(168, 85, 247, 0.4), 0 0 15px rgba(56, 189, 248, 0.25)'
                }}
              >
                <img
                  src="/branding/caelumos-icon.png"
                  alt="CaelumOS Logo"
                  className="w-full h-full object-contain rounded-2xl drop-shadow-[0_0_16px_rgba(168,85,247,0.5)]"
                />
              </div>

              {/* Online status indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-neutral-950 flex items-center justify-center shadow">
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
                {viewMode === 'register' ? 'Create CaelumOS Account' : (user?.name || 'CaelumOS')}
              </h3>
              <p className="text-xs text-slate-400 font-mono tracking-wider mt-0.5">
                {viewMode === 'switch_user' || viewMode === 'register'
                  ? 'Cloud Authentication'
                  : `${email} • Locked`}
              </p>
            </div>
          </div>

          {/* Real Password Verification Form */}
          <form onSubmit={handlePasswordSubmit} className="w-full space-y-3">
            {/* If switching user or registering, show email input */}
            {(viewMode === 'switch_user' || viewMode === 'register') && (
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address..."
                  autoFocus
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900/80 border border-white/15 focus:border-orange-500/80 text-white text-xs placeholder-slate-400 focus:outline-none backdrop-blur-md shadow-inner transition-colors"
                />
              </div>
            )}

            {/* Password input */}
            <div className="relative">
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lockoutSeconds > 0 ? `Locked (${lockoutSeconds}s)` : 'Enter password...'}
                disabled={lockoutSeconds > 0 || isSubmitting}
                autoFocus={viewMode === 'lock'}
                className="w-full pl-4 pr-20 py-3 rounded-2xl bg-neutral-900/85 border border-white/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-white text-sm placeholder-slate-400 focus:outline-none backdrop-blur-xl shadow-xl transition-all disabled:opacity-50"
              />
              <div className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl cursor-pointer transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || lockoutSeconds > 0}
                  className="p-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white cursor-pointer transition-all disabled:opacity-40 shadow-md shadow-orange-600/30 hover:scale-105 active:scale-95"
                  title="Unlock"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error & Lockout Message */}
            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center flex items-center justify-center space-x-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </motion.div>
            )}

            {/* Unlock CaelumOS button */}
            <button
              type="submit"
              disabled={isSubmitting || lockoutSeconds > 0}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-sm shadow-xl shadow-orange-600/30 flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>
                    {viewMode === 'register'
                      ? 'Create & Enter CaelumOS'
                      : viewMode === 'switch_user'
                      ? 'Sign In & Enter Desktop'
                      : 'Unlock CaelumOS'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Account Switching & Options */}
          <div className="w-full flex items-center justify-between text-[11px] pt-3 px-1 text-slate-400">
            {viewMode === 'lock' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('switch_user');
                    setLoginError('');
                    setPassword('');
                  }}
                  className="hover:text-white transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <User className="w-3 h-3" />
                  <span>Switch User</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode('register');
                    setLoginError('');
                    setPassword('');
                  }}
                  className="hover:text-white transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>New Account</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setViewMode('lock');
                  setLoginError('');
                  setPassword('');
                  setEmail(user?.email || 'dev@caelum-os.io');
                }}
                className="hover:text-white transition-colors cursor-pointer flex items-center space-x-1"
              >
                <span>&larr; Back to Lock Screen</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Information Bar */}
      <div className="relative z-10 w-full px-6 py-3 flex items-center justify-between text-[11px] text-slate-400/80 border-t border-white/5 bg-neutral-950/20 backdrop-blur-xs">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span>CaelumOS Secure Core &bull; Argon2 / Bcrypt Authentication</span>
        </div>
        <div>
          <span>Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-slate-300">Enter ↵</kbd> to unlock</span>
        </div>
      </div>
    </motion.div>
  );
}
