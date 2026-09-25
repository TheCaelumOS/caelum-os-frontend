"use client";

import React, { useState } from 'react';
import { X, MoreHorizontal, SplitSquareVertical } from 'lucide-react';
import { EditorTab } from './types';

interface VSCodeTabsProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string, e: React.MouseEvent) => void;
  onCloseAllTabs: () => void;
  getFileIcon: (filename: string) => React.ReactNode;
}

export default function VSCodeTabs({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCloseAllTabs,
  getFileIcon,
}: VSCodeTabsProps) {
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center justify-between bg-[#252526] border-b border-[#1e1e1e] h-9 select-none flex-shrink-0 text-xs">
      {/* Scrollable Tabs Container */}
      <div className="flex items-center overflow-x-auto overflow-y-hidden no-scrollbar h-full flex-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isHovered = hoveredTabId === tab.id;

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              onMouseEnter={() => setHoveredTabId(tab.id)}
              onMouseLeave={() => setHoveredTabId(null)}
              onMouseDown={(e) => {
                // Middle click to close tab
                if (e.button === 1) {
                  e.preventDefault();
                  onCloseTab(tab.id, e);
                }
              }}
              title={tab.path}
              className={`group flex items-center space-x-2 px-3 h-full cursor-pointer border-r border-[#1e1e1e] transition-colors relative flex-shrink-0 min-w-[120px] max-w-[200px] ${
                isActive
                  ? 'bg-[#1e1e1e] text-white border-t border-t-[#007acc]'
                  : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#282828] hover:text-[#cccccc]'
              }`}
            >
              {/* File Icon */}
              <div className="flex-shrink-0">
                {getFileIcon(tab.name)}
              </div>

              {/* Tab Title */}
              <span className="truncate flex-1 text-[12px] font-mono">
                {tab.name}
              </span>

              {/* Close Button / Modified Dot */}
              <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                {tab.isModified && !isHovered ? (
                  <span className="w-2 h-2 rounded-full bg-white opacity-80" />
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id, e);
                    }}
                    className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                      isActive || isHovered
                        ? 'opacity-80 hover:opacity-100 hover:bg-[#3c3c3c]'
                        : 'opacity-0 group-hover:opacity-60'
                    }`}
                    title="Close (Ctrl+W)"
                  >
                    <X className="w-3 h-3 text-slate-350 hover:text-white" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center px-2 space-x-1 text-[#858585] relative flex-shrink-0">
        <button
          onClick={() => {}}
          className="p-1 hover:text-[#cccccc] hover:bg-[#333333] rounded transition-colors"
          title="Split Editor Right"
        >
          <SplitSquareVertical className="w-3.5 h-3.5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:text-[#cccccc] hover:bg-[#333333] rounded transition-colors"
            title="More Actions..."
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-7 z-50 w-40 bg-[#252526] border border-[#454545] rounded shadow-xl py-1 text-xs text-[#cccccc]">
              <button
                onClick={() => {
                  onCloseAllTabs();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#094771] hover:text-white flex items-center justify-between"
              >
                <span>Close All Tabs</span>
                <span className="text-[10px] text-neutral-400">Ctrl+K W</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
