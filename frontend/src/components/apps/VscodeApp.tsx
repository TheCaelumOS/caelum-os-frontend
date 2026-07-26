"use client";

import React, { useState } from 'react';
import { Code2, FolderGit2, Plus, Terminal, RefreshCw, FolderClosed } from 'lucide-react';

interface Project {
  name: string;
  path: string;
  branch: string;
  modified: string;
}

export default function VscodeApp() {
  const [projects, setProjects] = useState<Project[]>([
    { name: 'caelum-os-monorepo', path: 'E:/TheCaelumOS', branch: 'main', modified: '2 mins ago' },
    { name: 'aws-infrastructure-tf', path: 'E:/AWS-Infra-Terraform', branch: 'master', modified: '2 days ago' },
    { name: 'python-fastapi-ai', path: 'E:/AI-Service-Broker', branch: 'dev', modified: '1 week ago' },
  ]);
  const [recentFiles, setRecentFiles] = useState<string[]>([
    'backend/src/main.ts',
    'frontend/src/components/Desktop.tsx',
    'backend/prisma/schema.prisma',
    'docs/ARCHITECTURE.md',
  ]);
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLaunchVSCode = (path: string) => {
    setLoading(true);
    setConsoleOutput(`[CaelumOS VSCode Integration] Spawning 'code ${path}' process...\n`);
    setTimeout(() => {
      setConsoleOutput(prev => prev + `✔ Success: VS Code workspace started successfully.\nProcess ID: ${Math.floor(Math.random() * 8000 + 1000)}\nWatching folder: ${path}\n`);
      setLoading(false);
    }, 1200);
  };

  const handleOpenWorkspace = () => {
    const path = prompt('Enter absolute directory path to open:');
    if (path) {
      handleLaunchVSCode(path);
    }
  };

  return (
    <div className="flex-1 flex bg-[#1e1e1e] text-[#cccccc] min-h-0 select-text font-sans">
      {/* Sidebar: Recent Projects list */}
      <div className="w-1/3 border-r border-[#252526] flex flex-col min-h-0 bg-[#252526]">
        <div className="p-3.5 border-b border-[#1e1e1e] flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Start / Recent Projects</span>
          <button
            onClick={handleOpenWorkspace}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-2 space-y-2">
          {projects.map(p => (
            <div
              key={p.name}
              onClick={() => handleLaunchVSCode(p.path)}
              className="p-3 bg-[#2d2d2d] hover:bg-[#37373d] rounded-xl border border-transparent hover:border-[#3c3c3c] cursor-pointer transition-all space-y-1.5"
            >
              <div className="flex items-center space-x-2">
                <FolderGit2 className="w-4.5 h-4.5 text-blue-400" />
                <span className="font-bold text-xs text-slate-100">{p.name}</span>
              </div>
              <div className="text-[9.5px] text-slate-400 font-mono leading-none">Path: {p.path}</div>
              <div className="flex items-center justify-between text-[9px] text-slate-500 leading-none">
                <span>branch: {p.branch}</span>
                <span>{p.modified}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main panel: recent files list & spawn logs */}
      <div className="flex-grow flex flex-col min-h-0 bg-[#1e1e1e]">
        <div className="p-3.5 border-b border-[#252526] bg-[#2d2d2d] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-xs text-slate-100">VS Code Dev Gateway</span>
          </div>
          <button 
            onClick={handleOpenWorkspace}
            className="px-3 py-1.5 bg-[#007acc] hover:bg-[#0062a3] text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition-colors"
          >
            Open Custom Workspace...
          </button>
        </div>

        {/* Recent files list */}
        <div className="p-4 border-b border-[#252526]">
          <span className="text-[9.5px] uppercase font-bold tracking-wider text-slate-400 block mb-2">Recent Files Opened</span>
          <div className="grid grid-cols-2 gap-2">
            {recentFiles.map(file => (
              <div
                key={file}
                onClick={() => handleLaunchVSCode(`E:/TheCaelumOS/${file}`)}
                className="p-2.5 bg-[#252526] hover:bg-[#2d2d2d] border border-[#2d2d2d] hover:border-[#3c3c3c] rounded-xl flex items-center space-x-2.5 cursor-pointer transition-all"
              >
                <FolderClosed className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-mono text-slate-300 truncate max-w-[170px]">{file}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CLI Process outputs */}
        <div className="flex-1 flex flex-col p-4 min-h-0 bg-[#1e1e1e] font-mono text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400 border-b border-[#252526] pb-2 mb-2 flex-shrink-0">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Console Logs</span>
          </div>
          <pre className="flex-grow overflow-auto text-[10.5px] leading-relaxed text-slate-350 p-3 bg-black/35 rounded-lg border border-[#2d2d2d] whitespace-pre-wrap select-all select-text">
            {consoleOutput || '[CaelumOS VSCode Gateway] Select a project or workspace from the sidebar to launch VS Code inside CaelumOS.'}
          </pre>
        </div>
      </div>
    </div>
  );
}
