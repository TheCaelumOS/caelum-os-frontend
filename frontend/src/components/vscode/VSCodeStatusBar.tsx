"use client";

import React from 'react';
import { 
  GitBranch, 
  RotateCw, 
  XCircle, 
  AlertTriangle, 
  Check, 
  Bell, 
  Terminal as TerminalIcon,
  Server,
  PanelBottom,
  Sparkles
} from 'lucide-react';
import { DiagnosticProblem } from './types';

interface VSCodeStatusBarProps {
  cursorPos: { line: number; col: number };
  activeLanguage: string;
  problems: DiagnosticProblem[];
  isBottomPanelOpen: boolean;
  onToggleBottomPanel: () => void;
  onSelectTab: (tab: 'terminal' | 'problems' | 'output' | 'debug') => void;
}

export default function VSCodeStatusBar({
  cursorPos,
  activeLanguage,
  problems,
  isBottomPanelOpen,
  onToggleBottomPanel,
  onSelectTab,
}: VSCodeStatusBarProps) {
  const errorCount = problems.filter((p) => p.severity === 'error').length;
  const warningCount = problems.filter((p) => p.severity === 'warning').length;

  const formatLanguageName = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'typescript':
      case 'typescriptreact':
        return 'TypeScript React';
      case 'javascript':
      case 'javascriptreact':
        return 'JavaScript';
      case 'python':
        return 'Python';
      case 'json':
        return 'JSON';
      case 'yaml':
        return 'YAML';
      case 'markdown':
        return 'Markdown';
      case 'html':
        return 'HTML';
      case 'css':
        return 'CSS';
      case 'dockerfile':
        return 'Dockerfile';
      case 'hcl':
      case 'terraform':
        return 'Terraform';
      case 'shell':
      case 'bash':
        return 'Bash';
      case 'sql':
        return 'SQL';
      default:
        return lang || 'Plain Text';
    }
  };

  return (
    <footer className="h-[22px] bg-[#007acc] text-white flex items-center justify-between px-2 text-[11px] font-sans select-none flex-shrink-0 z-10">
      {/* Left Segment */}
      <div className="flex items-center space-x-2 h-full">
        {/* Remote Host / CaelumOS Runtime Indicator */}
        <button
          className="h-full px-2 bg-[#16825d] hover:bg-[#1bb07d] flex items-center space-x-1.5 font-semibold text-white transition-colors cursor-pointer"
          title="Connected to CaelumOS Host Runtime"
        >
          <Server className="w-3 h-3" />
          <span>CaelumOS Host</span>
        </button>

        {/* Git Branch */}
        <button
          onClick={() => {}}
          className="h-full px-1.5 hover:bg-white/15 flex items-center space-x-1 transition-colors cursor-pointer"
          title="Git: main (Click to switch branch)"
        >
          <GitBranch className="w-3 h-3" />
          <span className="font-mono">main</span>
          <RotateCw className="w-2.5 h-2.5 ml-0.5 opacity-80" />
        </button>

        {/* Problems Indicator (Errors / Warnings) */}
        <button
          onClick={() => {
            onSelectTab('problems');
            if (!isBottomPanelOpen) onToggleBottomPanel();
          }}
          className="h-full px-1.5 hover:bg-white/15 flex items-center space-x-1.5 transition-colors cursor-pointer"
          title={`${errorCount} Errors, ${warningCount} Warnings`}
        >
          <div className="flex items-center space-x-0.5">
            <XCircle className="w-3 h-3" />
            <span className="font-mono">{errorCount}</span>
          </div>
          <div className="flex items-center space-x-0.5">
            <AlertTriangle className="w-3 h-3" />
            <span className="font-mono">{warningCount}</span>
          </div>
        </button>
      </div>

      {/* Right Segment */}
      <div className="flex items-center space-x-3 h-full">
        {/* Cursor Position */}
        <div className="h-full px-1.5 flex items-center hover:bg-white/15 transition-colors cursor-pointer">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
        </div>

        {/* Indentation */}
        <div className="h-full px-1.5 hidden sm:flex items-center hover:bg-white/15 transition-colors cursor-pointer">
          <span>Spaces: 2</span>
        </div>

        {/* Encoding */}
        <div className="h-full px-1.5 hidden md:flex items-center hover:bg-white/15 transition-colors cursor-pointer">
          <span>UTF-8</span>
        </div>

        {/* Line Endings */}
        <div className="h-full px-1.5 hidden md:flex items-center hover:bg-white/15 transition-colors cursor-pointer">
          <span>LF</span>
        </div>

        {/* Language Mode */}
        <div className="h-full px-1.5 flex items-center font-medium hover:bg-white/15 transition-colors cursor-pointer">
          <span>{formatLanguageName(activeLanguage)}</span>
        </div>

        {/* Prettier / Formatter status */}
        <div className="h-full px-1.5 hidden sm:flex items-center space-x-1 hover:bg-white/15 transition-colors cursor-pointer" title="Prettier Formatter Active">
          <Check className="w-3 h-3 text-emerald-300" />
          <span>Prettier</span>
        </div>

        {/* Toggle Bottom Panel */}
        <button
          onClick={onToggleBottomPanel}
          className={`h-full px-1.5 hover:bg-white/15 flex items-center space-x-1 transition-colors cursor-pointer ${
            isBottomPanelOpen ? 'bg-white/20' : ''
          }`}
          title="Toggle Bottom Panel (Terminal / Problems)"
        >
          <PanelBottom className="w-3.5 h-3.5" />
        </button>

        {/* Bell / Notifications */}
        <button
          className="h-full px-1.5 hover:bg-white/15 flex items-center transition-colors cursor-pointer"
          title="No Notifications"
        >
          <Bell className="w-3 h-3" />
        </button>
      </div>
    </footer>
  );
}
