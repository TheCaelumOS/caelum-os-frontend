"use client";

import React from 'react';
import {
  Files,
  Search,
  GitBranch,
  Play,
  Puzzle,
  Settings,
  User,
} from 'lucide-react';
import { ActivityBarTab } from './types';

interface VSCodeActivityBarProps {
  activeTab: ActivityBarTab;
  onTabChange: (tab: ActivityBarTab) => void;
  modifiedCount?: number;
}

export default function VSCodeActivityBar({
  activeTab,
  onTabChange,
  modifiedCount = 0,
}: VSCodeActivityBarProps) {
  const topItems: Array<{ id: ActivityBarTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'explorer', label: 'Explorer (Ctrl+Shift+E)', icon: <Files className="w-5 h-5" /> },
    { id: 'search', label: 'Search (Ctrl+Shift+F)', icon: <Search className="w-5 h-5" /> },
    {
      id: 'git',
      label: 'Source Control (Ctrl+Shift+G)',
      icon: <GitBranch className="w-5 h-5" />,
      badge: modifiedCount,
    },
    { id: 'debug', label: 'Run and Debug (Ctrl+Shift+D)', icon: <Play className="w-5 h-5" /> },
    { id: 'extensions', label: 'Extensions (Ctrl+Shift+X)', icon: <Puzzle className="w-5 h-5" /> },
  ];

  return (
    <div className="w-12 bg-[#181818] border-r border-[#2b2b2b] flex flex-col justify-between items-center py-2 select-none flex-shrink-0 z-10">
      {/* Top Action Icons */}
      <div className="space-y-2 w-full flex flex-col items-center">
        {topItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              title={item.label}
              className={`w-full py-2.5 flex items-center justify-center relative cursor-pointer transition-colors ${
                isActive
                  ? 'text-white border-l-2 border-white bg-white/5'
                  : 'text-neutral-400 hover:text-white border-l-2 border-transparent'
              }`}
            >
              {item.icon}
              {item.badge && item.badge > 0 ? (
                <span className="absolute top-1.5 right-1.5 px-1 min-w-[14px] h-3.5 rounded-full bg-[#007acc] text-white text-[9px] font-bold font-mono flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Bottom Icons: Accounts & Settings */}
      <div className="space-y-2 w-full flex flex-col items-center">
        <button
          type="button"
          onClick={() => onTabChange('settings')}
          title="Manage & Settings"
          className={`w-full py-2.5 flex items-center justify-center relative cursor-pointer transition-colors ${
            activeTab === 'settings'
              ? 'text-white border-l-2 border-white bg-white/5'
              : 'text-neutral-400 hover:text-white border-l-2 border-transparent'
          }`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
