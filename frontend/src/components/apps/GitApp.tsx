"use client";

import React, { useState } from 'react';
import { GitBranch, GitCommit, ArrowUp, ArrowDown, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';

interface Commit {
  hash: string;
  author: string;
  message: string;
  date: string;
}

export default function GitApp() {
  const [repoName, setRepoName] = useState<string>('caelum-os-monorepo');
  const [activeBranch, setActiveBranch] = useState<string>('main');
  const [branches, setBranches] = useState<string[]>(['main', 'feature/auth-jwt', 'dev/websocket-monitoring']);
  const [commits, setCommits] = useState<Commit[]>([
    { hash: 'e81a3d9', author: 'Developer <dev@caelum-os.io>', message: 'feat: add websocket gateways for system telemetry monitoring', date: '1 hour ago' },
    { hash: '5f92b7c', author: 'Developer <dev@caelum-os.io>', message: 'feat: register auth controllers with passport strategies', date: '3 hours ago' },
    { hash: '87e2b10', author: 'Developer <dev@caelum-os.io>', message: 'chore: scaffold backend workspace nestjs folders structure', date: '1 day ago' },
    { hash: 'a129efb', author: 'Principal <architect@caelum-os.io>', message: 'initial commit: web OS layouts and components desktop mockups', date: '2 days ago' },
  ]);
  const [gitStatus, setGitStatus] = useState<string>('Your branch is up to date with \'origin/main\'.\nNothing to commit, working tree clean.');
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleCommand = (cmd: 'pull' | 'push' | 'status') => {
    setLoading(true);
    setTerminalOutput(`$ git ${cmd}\n`);
    
    setTimeout(() => {
      if (cmd === 'pull') {
        setTerminalOutput(prev => prev + 'From github.com:caelum/caelum-os\n * branch            main     -> FETCH_HEAD\nAlready up to date.\n');
      } else if (cmd === 'push') {
        setTerminalOutput(prev => prev + 'Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nDelta compression using up to 8 threads\nCompressing objects: 100% (3/3), done.\nWriting objects: 100% (3/3), 322 bytes | 322.00 KiB/s, done.\nTo github.com:caelum/caelum-os.git\n   e81a3d9..5f92b7c  main -> main\n');
      } else if (cmd === 'status') {
        setTerminalOutput(prev => prev + 'On branch main\nYour branch is up to date with \'origin/main\'.\nnothing to commit, working tree clean\n');
      }
      setLoading(false);
    }, 1000);
  };

  const handleCreateBranch = () => {
    const name = prompt('Enter new branch name:');
    if (name) {
      setBranches(prev => [...prev, name]);
      setActiveBranch(name);
      setTerminalOutput(prev => prev + `$ git checkout -b ${name}\nSwitched to a new branch '${name}'\n`);
    }
  };

  return (
    <div className="flex-1 flex bg-[#0c0c0e] text-slate-100 min-h-0 select-text font-sans">
      {/* Sidebar: Branches & Repo info */}
      <div className="w-1/3 border-r border-neutral-800 flex flex-col min-h-0 bg-[#0f0f12] p-3 space-y-4">
        {/* Repo Header */}
        <div className="flex items-center space-x-2.5 pb-3 border-b border-neutral-800">
          <GitBranch className="w-5 h-5 text-orange-500" />
          <div>
            <span className="font-extrabold text-xs text-slate-200 block truncate max-w-[130px]">{repoName}</span>
            <span className="text-[9px] text-slate-500 font-mono">active branch: {activeBranch}</span>
          </div>
        </div>

        {/* Branches list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Branches</span>
            <button 
              onClick={handleCreateBranch}
              className="text-[9px] bg-neutral-800 hover:bg-neutral-700 text-slate-300 font-bold px-2 py-0.5 rounded cursor-pointer"
            >
              + New
            </button>
          </div>
          <div className="space-y-1 overflow-y-auto max-h-40">
            {branches.map(b => (
              <div 
                key={b}
                onClick={() => setActiveBranch(b)}
                className={`p-2 rounded-xl text-xs font-semibold cursor-pointer border flex items-center justify-between ${
                  activeBranch === b 
                    ? 'bg-orange-600/15 border-orange-500/30 text-orange-400' 
                    : 'bg-neutral-900/40 border-neutral-800/80 text-slate-300 hover:bg-neutral-900/90'
                }`}
              >
                <span className="truncate max-w-[140px] font-mono">{b}</span>
                {activeBranch === b && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            ))}
          </div>
        </div>

        {/* Remote Sync Buttons */}
        <div className="space-y-2 pt-2 border-t border-neutral-800">
          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Git Sync Operations</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleCommand('pull')}
              disabled={loading}
              className="flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 text-slate-350 font-bold text-[10px] uppercase cursor-pointer"
            >
              <ArrowDown className="w-3.5 h-3.5 text-blue-500" />
              <span>Pull</span>
            </button>
            <button
              onClick={() => handleCommand('push')}
              disabled={loading}
              className="flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 text-slate-350 font-bold text-[10px] uppercase cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5 text-green-500" />
              <span>Push</span>
            </button>
          </div>
          <button
            onClick={() => handleCommand('status')}
            className="w-full flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 text-slate-350 font-bold text-[10px] uppercase cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-amber-500" />
            <span>Status checks</span>
          </button>
        </div>
      </div>

      {/* Main panel: Commits & logs stdout */}
      <div className="flex-grow flex flex-col min-h-0 bg-[#0c0c0e]">
        {/* Active branch commits */}
        <div className="p-3 border-b border-neutral-800 bg-[#0f0f12]">
          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Recent commits</span>
          <div className="mt-2 space-y-1.5 overflow-y-auto max-h-48">
            {commits.map(c => (
              <div key={c.hash} className="p-2.5 bg-neutral-900/35 border border-neutral-900/75 rounded-xl flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <GitCommit className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-bold text-xs text-slate-200">{c.message}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block leading-none">{c.author} | {c.date}</span>
                </div>
                <span className="text-[9.5px] font-mono bg-neutral-800 text-slate-400 px-1.5 py-0.5 rounded leading-none">
                  {c.hash}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Command terminal log Output */}
        <div className="flex-1 flex flex-col p-3 min-h-0 bg-[#08080a] font-mono text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400 border-b border-neutral-900 pb-2 mb-2 flex-shrink-0">
            <Terminal className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Console Logs</span>
          </div>
          <pre className="flex-grow overflow-auto text-[10.5px] leading-relaxed text-slate-350 p-2.5 bg-black/45 rounded-lg border border-neutral-900 whitespace-pre-wrap select-all select-text">
            {terminalOutput || '$ git log --oneline -n 5\ne81a3d9 feat: add websocket gateways for system telemetry monitoring\n5f92b7c feat: register auth controllers with passport strategies\n87e2b10 chore: scaffold backend workspace nestjs folders structure\na129efb initial commit: web OS layouts and components desktop mockups'}
          </pre>
        </div>
      </div>
    </div>
  );
}
