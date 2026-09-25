"use client";

import React, { useState } from 'react';
import { 
  Play, 
  Terminal, 
  ChevronRight, 
  ChevronDown, 
  Settings2, 
  Bug, 
  RotateCw,
  Box,
  Server,
  Layers
} from 'lucide-react';
import { WorkspaceFile, EditorTab } from './types';

interface VSCodeRunDebugProps {
  activeTab: EditorTab | null;
  activeFile: WorkspaceFile | null;
  onRunCommand: (command: string) => void;
}

interface DebugConfig {
  id: string;
  name: string;
  command: string;
  icon: string;
  description: string;
}

export default function VSCodeRunDebug({
  activeTab,
  activeFile,
  onRunCommand,
}: VSCodeRunDebugProps) {
  const [selectedConfigId, setSelectedConfigId] = useState<string>('current-file');
  const [variablesCollapsed, setVariablesCollapsed] = useState(false);
  const [breakpointsCollapsed, setBreakpointsCollapsed] = useState(false);

  // Dynamic run configuration for currently active file
  const getFileRunCommand = (): string => {
    if (!activeTab) return 'echo "No file open"';
    const ext = activeTab.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'ts':
        return `node ${activeTab.path}`;
      case 'py':
        return `python ${activeTab.path}`;
      case 'sh':
      case 'bash':
        return `bash ${activeTab.path}`;
      case 'tf':
        return 'terraform plan';
      default:
        return `cat ${activeTab.path}`;
    }
  };

  const configs: DebugConfig[] = [
    {
      id: 'current-file',
      name: activeTab ? `Run Current File (${activeTab.name})` : 'Run Current File',
      command: getFileRunCommand(),
      icon: 'file',
      description: 'Executes the active editor document in the terminal',
    },
    {
      id: 'frontend-dev',
      name: 'Start Frontend (npm run dev)',
      command: 'cd frontend && npm run dev',
      icon: 'box',
      description: 'Launches Next.js development server',
    },
    {
      id: 'backend-dev',
      name: 'Start Backend (npm run start:dev)',
      command: 'cd backend && npm run start:dev',
      icon: 'server',
      description: 'Launches NestJS API backend daemon',
    },
    {
      id: 'docker-ps',
      name: 'Docker: List Active Containers',
      command: 'docker ps -a',
      icon: 'layers',
      description: 'Queries Docker engine status on host',
    },
    {
      id: 'k8s-cluster',
      name: 'Kubernetes: Cluster Status',
      command: 'kubectl get all -A',
      icon: 'layers',
      description: 'Inspects all Kubernetes pods and services',
    },
    {
      id: 'terraform-plan',
      name: 'Terraform: Init & Plan',
      command: 'terraform plan',
      icon: 'box',
      description: 'Plans infrastructure declarations',
    },
  ];

  const handleLaunch = () => {
    const config = configs.find(c => c.id === selectedConfigId);
    if (config) {
      onRunCommand(config.command);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#252526] text-[#cccccc] select-none text-xs">
      {/* Header */}
      <div className="p-3 border-b border-[#1e1e1e] flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Bug className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
            Run and Debug
          </span>
        </div>
        <button
          onClick={() => {}}
          className="p-1 hover:text-white hover:bg-[#333333] rounded transition-colors text-neutral-400"
          title="Open launch.json"
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Configuration Selector & Run Bar */}
      <div className="p-3 border-b border-[#1e1e1e] space-y-2">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleLaunch}
            className="w-7 h-7 bg-emerald-600 hover:bg-emerald-500 rounded flex items-center justify-center text-white transition-colors cursor-pointer flex-shrink-0"
            title="Start Debugging / Run (F5)"
          >
            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
          </button>

          <select
            value={selectedConfigId}
            onChange={(e) => setSelectedConfigId(e.target.value)}
            className="flex-1 bg-[#3c3c3c] border border-[#3c3c3c] focus:border-[#007acc] rounded px-2 py-1.5 text-xs text-white outline-none cursor-pointer"
          >
            {configs.map((cfg) => (
              <option key={cfg.id} value={cfg.id}>
                {cfg.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] text-neutral-400 font-mono bg-[#1e1e1e] p-2 rounded border border-[#333333]">
          <div className="text-[10px] text-neutral-500 mb-0.5">Command:</div>
          <div className="text-emerald-400 truncate">
            $ {configs.find(c => c.id === selectedConfigId)?.command}
          </div>
        </div>
      </div>

      {/* Variables Section */}
      <div className="border-b border-[#1e1e1e]">
        <div
          onClick={() => setVariablesCollapsed(!variablesCollapsed)}
          className="flex items-center justify-between px-3 py-1.5 bg-[#202020] hover:bg-[#282828] cursor-pointer text-[11px] font-semibold text-neutral-400"
        >
          <div className="flex items-center space-x-1">
            {variablesCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            <span className="uppercase tracking-wider">Variables</span>
          </div>
        </div>

        {!variablesCollapsed && (
          <div className="p-3 text-[11px] space-y-1 font-mono text-neutral-400">
            <div className="flex justify-between">
              <span className="text-sky-300">NODE_ENV:</span>
              <span className="text-amber-300">"production"</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sky-300">PLATFORM:</span>
              <span className="text-amber-300">"CaelumOS / x64"</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sky-300">RUNTIME_PORT:</span>
              <span className="text-emerald-300">4000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sky-300">ACTIVE_FILE:</span>
              <span className="text-neutral-400 truncate max-w-[120px]">
                {activeTab ? `"${activeTab.name}"` : 'null'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Breakpoints Section */}
      <div className="flex-1 overflow-y-auto">
        <div
          onClick={() => setBreakpointsCollapsed(!breakpointsCollapsed)}
          className="flex items-center justify-between px-3 py-1.5 bg-[#202020] hover:bg-[#282828] cursor-pointer text-[11px] font-semibold text-neutral-400"
        >
          <div className="flex items-center space-x-1">
            {breakpointsCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            <span className="uppercase tracking-wider">Breakpoints</span>
          </div>
        </div>

        {!breakpointsCollapsed && (
          <div className="p-3 space-y-1.5 text-[11px] text-neutral-400">
            <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
              <input type="checkbox" defaultChecked className="accent-[#007acc] rounded" />
              <span>Uncaught Exceptions</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
              <input type="checkbox" className="accent-[#007acc] rounded" />
              <span>Caught Exceptions</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
