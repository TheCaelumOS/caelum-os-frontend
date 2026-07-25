"use client";

import React, { useState } from 'react';
import Logo from './Logo';
import { Plus, User, Cloud, ChevronDown, Check, ShieldAlert, Monitor, DollarSign, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'Deploy', href: '#deploy', icon: Cloud },
  { name: 'Security', href: '#security', icon: ShieldAlert },
  { name: 'Monitoring', href: '#monitoring', icon: Monitor },
  { name: 'Cost Optimizer', href: '#cost', icon: DollarSign },
  { name: 'Automations', href: '#automations', icon: Activity },
];

export default function Navbar() {
  const [activeTab, setActiveTab] = useState('Deploy');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [showCloudDropdown, setShowCloudDropdown] = useState(false);
  const [connectedClouds, setConnectedClouds] = useState<{ [key: string]: boolean }>({
    AWS: true,
    Azure: false,
  });

  const toggleCloud = (cloud: string) => {
    setConnectedClouds((prev) => ({
      ...prev,
      [cloud]: !prev[cloud],
    }));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 glass shadow-sm shadow-slate-100/20">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-100/50 p-1.5 rounded-full border border-slate-200/40 relative">
          {navItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setActiveTab(item.name)}
                onMouseEnter={() => setHoveredTab(item.name)}
                onMouseLeave={() => setHoveredTab(null)}
                className="relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5"
                style={{
                  color: isActive ? '#0f0b18' : hoveredTab === item.name ? '#6d28d9' : '#64748b',
                }}
              >
                {/* Active Indicator Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavBackground"
                    className="absolute inset-0 bg-white shadow-sm border border-slate-200/30 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {/* Hover Indicator Background (Faded purple outline or background) */}
                {hoveredTab === item.name && !isActive && (
                  <motion.div
                    layoutId="hoverNavBackground"
                    className="absolute inset-0 bg-purple-50/50 rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                
                <span className="relative z-10 flex items-center space-x-1.5">
                  <item.icon className="w-3.5 h-3.5 opacity-60" />
                  <span>{item.name}</span>
                </span>
              </a>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          {/* Cloud Account Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowCloudDropdown(!showCloudDropdown)}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 hover:text-purple-700 hover:border-purple-200 hover:bg-purple-50/20 text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-purple-600" />
              <span>Add Cloud Account</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showCloudDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Cloud Provider Dropdown */}
            <AnimatePresence>
              {showCloudDropdown && (
                <>
                  {/* Overlay to close */}
                  <div className="fixed inset-0 z-10" onClick={() => setShowCloudDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2.5 w-60 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-xl ring-1 ring-black/5 z-20"
                  >
                    <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                      Integrations
                    </div>
                    <div className="space-y-1 mt-1">
                      {/* AWS */}
                      <button
                        onClick={() => toggleCloud('AWS')}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-orange-50 text-orange-600 font-bold text-[10px]">
                            AWS
                          </div>
                          <span>Amazon Web Services</span>
                        </div>
                        {connectedClouds.AWS ? (
                          <div className="flex items-center space-x-1.5 text-green-600">
                            <span className="text-[10px]">Connected</span>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal">Connect</span>
                        )}
                      </button>
                      
                      {/* Azure */}
                      <button
                        onClick={() => toggleCloud('Azure')}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-50 text-blue-600 font-bold text-[10px]">
                            AZR
                          </div>
                          <span>Microsoft Azure</span>
                        </div>
                        {connectedClouds.Azure ? (
                          <div className="flex items-center space-x-1.5 text-green-600">
                            <span className="text-[10px]">Connected</span>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal">Connect</span>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile */}
          <button className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/50 shadow-inner text-slate-600 hover:text-slate-800 transition-colors duration-200 active:scale-95">
            <User className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
