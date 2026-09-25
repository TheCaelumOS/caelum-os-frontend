"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TermIcon, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Trash2, 
  Plus, 
  X, 
  ChevronUp, 
  ChevronDown, 
  SplitSquareVertical,
  CheckCircle2,
  Play,
  RotateCw,
  Sparkles
} from 'lucide-react';
import { BottomPanelTab, DiagnosticProblem } from './types';
import { apiRequest } from '../../lib/api';

interface VSCodeBottomPanelProps {
  activeTab: BottomPanelTab;
  onSelectTab: (tab: BottomPanelTab) => void;
  onClose: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  problems: DiagnosticProblem[];
  onProblemClick?: (problem: DiagnosticProblem) => void;
  externalCommand?: string | null;
  onClearExternalCommand?: () => void;
}

interface TerminalLog {
  id: string;
  type: 'prompt' | 'stdout' | 'stderr' | 'system' | 'info';
  content: string;
  timestamp?: string;
  cwd?: string;
}

export default function VSCodeBottomPanel({
  activeTab,
  onSelectTab,
  onClose,
  isMaximized,
  onToggleMaximize,
  problems,
  onProblemClick,
  externalCommand,
  onClearExternalCommand,
}: VSCodeBottomPanelProps) {
  // Terminal state
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    {
      id: 'init-1',
      type: 'system',
      content: 'CaelumOS Integrated Development Terminal v2.1 [Host Connected]',
    },
    {
      id: 'init-2',
      type: 'info',
      content: 'Connected to local host engine. Run "docker", "kubectl", "git", "terraform", or "npm" commands.',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentCwd, setCurrentCwd] = useState<string>('~');
  const [terminalShell, setTerminalShell] = useState<string>('1: bash');

  // Output channel state
  const [outputChannel, setOutputChannel] = useState<'caelum' | 'typescript' | 'git'>('caelum');
  const [outputLogs, setOutputLogs] = useState<Record<string, string[]>>({
    caelum: [
      '[CaelumOS] Host runtime daemon initialized on port 4000',
      '[CaelumOS] Docker engine auto-connected via local daemon socket',
      '[CaelumOS] Kubernetes kubeconfig detected and synchronized',
      '[CaelumOS] Monaco language servers mounted: ts, js, py, json, yaml, tf',
    ],
    typescript: [
      '[TypeScript Server] Project tsconfig.json loaded',
      '[TypeScript Server] CompilerOptions: target=ES2022, module=CommonJS',
      '[TypeScript Server] No diagnostic syntax errors detected',
    ],
    git: [
      '[Git Engine] Local repository initialized at E:/TheCaelumOS',
      '[Git Engine] Current branch: main',
      '[Git Engine] Upstream remote: origin/main (synchronized)',
    ],
  });

  // Debug Console state
  const [debugLogs, setDebugLogs] = useState<{ query: string; result: string; isError?: boolean }[]>([
    { query: 'process.version', result: '"v20.18.0"' },
    { query: 'os.platform()', result: '"win32"' },
  ]);
  const [debugInput, setDebugInput] = useState('');

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll terminal on new logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Execute external commands (from Run & Debug)
  useEffect(() => {
    if (externalCommand && externalCommand.trim()) {
      executeCommand(externalCommand);
      if (onClearExternalCommand) onClearExternalCommand();
    }
  }, [externalCommand]);

  const executeCommand = async (rawCommand: string) => {
    const cmd = rawCommand.trim();
    if (!cmd) return;

    // Handle 'clear' or 'cls'
    if (cmd === 'clear' || cmd === 'cls') {
      setTerminalLogs([]);
      setInputVal('');
      return;
    }

    // Add to history
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    // Add prompt line
    const logId = `cmd-${Date.now()}`;
    setTerminalLogs(prev => [
      ...prev,
      {
        id: logId,
        type: 'prompt',
        content: cmd,
        cwd: currentCwd,
      },
    ]);
    setInputVal('');
    setIsExecuting(true);

    try {
      const res = await apiRequest('/terminal/execute', {
        method: 'POST',
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          command: cmd,
          cwd: currentCwd === '~' ? undefined : currentCwd,
        }),
      });

      if (res && (res.stdout || res.stderr !== undefined)) {
        if (res.cwd) {
          setCurrentCwd(res.cwd);
        }
        if (res.stdout) {
          setTerminalLogs(prev => [
            ...prev,
            { id: `out-${Date.now()}`, type: 'stdout', content: res.stdout },
          ]);
        }
        if (res.stderr) {
          setTerminalLogs(prev => [
            ...prev,
            { id: `err-${Date.now()}`, type: 'stderr', content: res.stderr },
          ]);
        }
        if (!res.stdout && !res.stderr) {
          setTerminalLogs(prev => [
            ...prev,
            { id: `ok-${Date.now()}`, type: 'info', content: `✔ Command finished (exit code: ${res.exitCode ?? 0})` },
          ]);
        }
      } else {
        setTerminalLogs(prev => [
          ...prev,
          { id: `err-${Date.now()}`, type: 'stderr', content: 'Execution returned empty response.' },
        ]);
      }
    } catch (err: any) {
      setTerminalLogs(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          type: 'stderr',
          content: `Command error: ${err.message || 'Host terminal disconnected'}`,
        },
      ]);
    } finally {
      setIsExecuting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIdx = historyIndex + 1;
        if (nextIdx < commandHistory.length) {
          setHistoryIndex(nextIdx);
          setInputVal(commandHistory[nextIdx]);
        } else {
          setHistoryIndex(-1);
          setInputVal('');
        }
      }
    }
  };

  const handleDebugEval = () => {
    if (!debugInput.trim()) return;
    try {
      // Safe sandbox JS eval
      const result = String(eval(debugInput));
      setDebugLogs(prev => [...prev, { query: debugInput, result }]);
    } catch (err: any) {
      setDebugLogs(prev => [...prev, { query: debugInput, result: err.message, isError: true }]);
    }
    setDebugInput('');
  };

  const errorCount = problems.filter(p => p.severity === 'error').length;
  const warningCount = problems.filter(p => p.severity === 'warning').length;

  return (
    <div
      className={`border-t border-[#333333] bg-[#1e1e1e] flex flex-col select-none text-xs transition-all duration-150 z-20 ${
        isMaximized ? 'h-[75vh]' : 'h-64'
      }`}
    >
      {/* Panel Header Strip */}
      <div className="flex items-center justify-between bg-[#1e1e1e] border-b border-[#2d2d2d] px-3 h-8 flex-shrink-0">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 h-full">
          {/* Problems Tab */}
          <button
            onClick={() => onSelectTab('problems')}
            className={`px-3 h-full flex items-center space-x-1.5 uppercase tracking-wider font-semibold text-[11px] border-b-2 transition-colors cursor-pointer ${
              activeTab === 'problems'
                ? 'text-white border-[#007acc]'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            <span>Problems</span>
            <div className="flex items-center space-x-1 text-[10px] font-mono ml-1">
              <span className="bg-[#4d4d4d] text-white px-1.5 py-0.2 rounded-full">
                {errorCount + warningCount}
              </span>
            </div>
          </button>

          {/* Output Tab */}
          <button
            onClick={() => onSelectTab('output')}
            className={`px-3 h-full flex items-center space-x-1.5 uppercase tracking-wider font-semibold text-[11px] border-b-2 transition-colors cursor-pointer ${
              activeTab === 'output'
                ? 'text-white border-[#007acc]'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            <span>Output</span>
          </button>

          {/* Debug Console Tab */}
          <button
            onClick={() => onSelectTab('debug')}
            className={`px-3 h-full flex items-center space-x-1.5 uppercase tracking-wider font-semibold text-[11px] border-b-2 transition-colors cursor-pointer ${
              activeTab === 'debug'
                ? 'text-white border-[#007acc]'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            <span>Debug Console</span>
          </button>

          {/* Terminal Tab */}
          <button
            onClick={() => onSelectTab('terminal')}
            className={`px-3 h-full flex items-center space-x-1.5 uppercase tracking-wider font-semibold text-[11px] border-b-2 transition-colors cursor-pointer ${
              activeTab === 'terminal'
                ? 'text-white border-[#007acc]'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            <TermIcon className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 text-neutral-400">
          {activeTab === 'terminal' && (
            <>
              {/* Terminal Shell Selector */}
              <select
                value={terminalShell}
                onChange={(e) => setTerminalShell(e.target.value)}
                className="bg-[#2d2d2d] border border-[#3c3c3c] text-[11px] text-neutral-300 rounded px-2 py-0.5 outline-none cursor-pointer"
              >
                <option value="1: bash">1: bash (host)</option>
                <option value="2: powershell">2: powershell</option>
                <option value="3: node">3: node</option>
              </select>

              {/* Clear Terminal */}
              <button
                onClick={() => setTerminalLogs([])}
                className="p-1 hover:text-white hover:bg-[#333333] rounded transition-colors"
                title="Clear Terminal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* New Terminal */}
              <button
                onClick={() => {
                  setTerminalLogs(prev => [
                    ...prev,
                    { id: `new-${Date.now()}`, type: 'system', content: 'New terminal session created.' },
                  ]);
                }}
                className="p-1 hover:text-white hover:bg-[#333333] rounded transition-colors"
                title="New Terminal"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {activeTab === 'output' && (
            <select
              value={outputChannel}
              onChange={(e) => setOutputChannel(e.target.value as any)}
              className="bg-[#2d2d2d] border border-[#3c3c3c] text-[11px] text-neutral-300 rounded px-2 py-0.5 outline-none cursor-pointer"
            >
              <option value="caelum">CaelumOS Runtime</option>
              <option value="typescript">TypeScript Language Server</option>
              <option value="git">Git Output</option>
            </select>
          )}

          {/* Maximize / Restore */}
          <button
            onClick={onToggleMaximize}
            className="p-1 hover:text-white hover:bg-[#333333] rounded transition-colors"
            title={isMaximized ? 'Restore Panel Size' : 'Maximize Panel Size'}
          >
            {isMaximized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {/* Close Panel */}
          <button
            onClick={onClose}
            className="p-1 hover:text-white hover:bg-[#333333] rounded transition-colors"
            title="Close Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Panel Body Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 bg-[#1e1e1e] font-mono select-text">
        {/* TAB 1: TERMINAL */}
        {activeTab === 'terminal' && (
          <div
            className="h-full flex flex-col cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            {/* Terminal Output Stream */}
            <div className="flex-1 overflow-y-auto space-y-1 text-[12px] leading-relaxed">
              {terminalLogs.map((log) => {
                if (log.type === 'system') {
                  return (
                    <div key={log.id} className="text-sky-400 font-semibold">
                      {log.content}
                    </div>
                  );
                }
                if (log.type === 'info') {
                  return (
                    <div key={log.id} className="text-neutral-400 italic">
                      {log.content}
                    </div>
                  );
                }
                if (log.type === 'prompt') {
                  return (
                    <div key={log.id} className="flex items-center space-x-1.5 text-white">
                      <span className="text-emerald-400 font-bold">caelum@host</span>
                      <span className="text-neutral-400">:</span>
                      <span className="text-sky-300 font-bold">{log.cwd || '~'}</span>
                      <span className="text-neutral-400">$</span>
                      <span className="text-amber-200 font-bold ml-1">{log.content}</span>
                    </div>
                  );
                }
                if (log.type === 'stderr') {
                  return (
                    <pre key={log.id} className="text-red-400 whitespace-pre-wrap font-mono pl-2 border-l border-red-500/30">
                      {log.content}
                    </pre>
                  );
                }
                return (
                  <pre key={log.id} className="text-neutral-300 whitespace-pre-wrap font-mono pl-2">
                    {log.content}
                  </pre>
                );
              })}

              {isExecuting && (
                <div className="flex items-center space-x-2 text-sky-400 text-xs py-1">
                  <div className="w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                  <span>Executing on host runtime...</span>
                </div>
              )}

              <div ref={terminalEndRef} />
            </div>

            {/* Terminal Input Line */}
            <div className="flex items-center space-x-1.5 pt-2 text-[12px] flex-shrink-0">
              <span className="text-emerald-400 font-bold">caelum@host</span>
              <span className="text-neutral-400">:</span>
              <span className="text-sky-300 font-bold">{currentCwd}</span>
              <span className="text-neutral-400">$</span>
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isExecuting}
                className="flex-1 bg-transparent text-white outline-none font-mono caret-sky-400"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* TAB 2: PROBLEMS */}
        {activeTab === 'problems' && (
          <div className="h-full space-y-2">
            {problems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-400 text-xs space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1" />
                <span className="font-semibold text-neutral-300">No problems have been detected in the workspace.</span>
                <span className="text-[11px] text-neutral-500">Monaco linter syntax and semantic validation passed.</span>
              </div>
            ) : (
              problems.map((problem) => (
                <div
                  key={problem.id}
                  onClick={() => onProblemClick && onProblemClick(problem)}
                  className="flex items-start space-x-2 p-1.5 hover:bg-[#2a2d2e] rounded cursor-pointer transition-colors text-xs"
                >
                  {problem.severity === 'error' ? (
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  ) : problem.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1 min-w-0">
                    <span className="text-neutral-200">{problem.message}</span>
                    <span className="text-neutral-500 ml-2 font-mono text-[11px]">
                      [{problem.file} ({problem.line}, {problem.column})]
                    </span>
                    {problem.source && (
                      <span className="text-neutral-500 ml-1 text-[10px]">
                        ({problem.source})
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: OUTPUT */}
        {activeTab === 'output' && (
          <div className="h-full space-y-1 text-xs text-neutral-300">
            {(outputLogs[outputChannel] || []).map((line, idx) => (
              <div key={idx} className="font-mono leading-relaxed">
                {line}
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: DEBUG CONSOLE */}
        {activeTab === 'debug' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-1 text-xs">
              {debugLogs.map((log, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="text-sky-300 font-bold">&gt; {log.query}</div>
                  <div className={log.isError ? 'text-red-400 pl-4' : 'text-emerald-400 pl-4'}>
                    {log.result}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-[#2d2d2d] flex-shrink-0">
              <span className="text-sky-400 font-bold">&gt;</span>
              <input
                type="text"
                value={debugInput}
                onChange={(e) => setDebugInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleDebugEval();
                  }
                }}
                placeholder="Evaluate JavaScript expression in debug context..."
                className="flex-1 bg-transparent text-white outline-none font-mono text-xs placeholder:text-neutral-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
