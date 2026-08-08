"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest, getSocket } from '../../lib/api';
import { Terminal, Code2, AlertTriangle, Play, RefreshCw, CheckCircle } from 'lucide-react';

const DEFAULT_TF_CODE = `terraform {
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

resource "local_file" "test" {
  filename = "\${path.module}/test.txt"
  content  = "CaelumOS test content!"
}`;

export default function TerraformApp() {
  const [code, setCode] = useState<string>(DEFAULT_TF_CODE);
  const [consoleLogs, setConsoleLogs] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [tfStatus, setTfStatus] = useState<{ installed: boolean; version?: string; workspace?: string; error?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const data = await apiRequest('/terraform/status');
      setTfStatus(data);
      if (data && !data.installed) {
        setError(data.error || 'Terraform CLI not found.');
      } else {
        setError(null);
      }
    } catch (err: any) {
      setTfStatus({ installed: false, version: 'None', workspace: 'None', error: 'Cannot connect to backend server.' });
      setError('Cannot connect to backend server.');
    }
  };

  useEffect(() => {
    fetchStatus();

    // Listen to real-time streamed logs from the socket server
    const socket = getSocket();
    socket.on('terraform-output', (data: { text: string; isError?: boolean }) => {
      setConsoleLogs(prev => prev + data.text);
    });

    return () => {
      socket.off('terraform-output');
    };
  }, []);

  const handleAction = async (action: 'init' | 'validate' | 'fmt' | 'plan' | 'apply' | 'destroy') => {
    setIsExecuting(true);
    setConsoleLogs(`[CaelumOS] Executing: terraform ${action}...\n`);
    try {
      const res = await apiRequest('/terraform/action', {
        method: 'POST',
        body: JSON.stringify({ action, code }),
      });

      if (res && res.success) {
        setConsoleLogs(prev => prev + `\n✔ Success: terraform ${action} complete (Exit Code: ${res.exitCode})\n`);
        if (action === 'fmt' && res.updatedCode) {
          setCode(res.updatedCode);
        }
        await fetchStatus();
      } else {
        setConsoleLogs(prev => prev + `\n✖ Error: terraform ${action} failed (Exit Code: ${res?.exitCode || -1})\n`);
      }
    } catch (err: any) {
      console.error(`Action ${action} execution failed:`, err);
      setConsoleLogs(prev => prev + `\n✖ Error: Execution failed. Please verify connection and try again.\n`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex-grow flex bg-[#0c0c0e] text-slate-100 min-h-0 select-text font-mono text-xs h-full">
      {/* Code Editor block */}
      <div className="w-1/2 border-r border-neutral-850 flex flex-col min-h-0 bg-[#0f0f12]">
        <div className="p-3 border-b border-neutral-850 flex items-center justify-between flex-shrink-0 bg-[#121215]">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Code2 className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] uppercase font-bold tracking-wider">main.tf</span>
          </div>
          <span id="tf-cli-version" className="text-[10px] text-slate-500 font-bold">
            {tfStatus?.installed ? `CLI: ${tfStatus.version}` : 'CLI: Offline'}
          </span>
        </div>
        <textarea
          id="terraform-code-editor"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isExecuting}
          className="flex-grow p-4 bg-transparent outline-none border-none text-[11px] leading-relaxed resize-none text-emerald-400 font-mono font-medium focus:ring-0 focus:border-none whitespace-pre disabled:opacity-50"
        />
      </div>

      {/* Controller actions and console stdout */}
      <div className="w-1/2 flex flex-col min-h-0 bg-[#08080a]">
        {/* Buttons / Actions row */}
        <div className="p-3 bg-[#0f0f12] border-b border-neutral-850 flex items-center justify-between flex-shrink-0">
          <div className="flex flex-wrap gap-1.5 items-center">
            <button
              id="tf-btn-init"
              onClick={() => handleAction('init')}
              disabled={isExecuting || !tfStatus?.installed}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-850 hover:bg-neutral-800 disabled:bg-neutral-900 text-slate-200 font-bold text-[9px] uppercase tracking-wider cursor-pointer disabled:opacity-35"
              title="Initialize working directory"
            >
              Init
            </button>
            <button
              id="tf-btn-validate"
              onClick={() => handleAction('validate')}
              disabled={isExecuting || !tfStatus?.installed}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-850 hover:bg-neutral-800 disabled:bg-neutral-900 text-slate-200 font-bold text-[9px] uppercase tracking-wider disabled:opacity-35 cursor-pointer"
              title="Validate syntax"
            >
              Validate
            </button>
            <button
              id="tf-btn-fmt"
              onClick={() => handleAction('fmt')}
              disabled={isExecuting || !tfStatus?.installed}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-850 hover:bg-neutral-800 disabled:bg-neutral-900 text-slate-200 font-bold text-[9px] uppercase tracking-wider disabled:opacity-35 cursor-pointer"
              title="Format source code"
            >
              Format
            </button>
            <button
              id="tf-btn-plan"
              onClick={() => handleAction('plan')}
              disabled={isExecuting || !tfStatus?.installed}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-850 hover:bg-neutral-800 disabled:bg-neutral-900 text-slate-200 font-bold text-[9px] uppercase tracking-wider disabled:opacity-35 cursor-pointer"
              title="Preview execution plan"
            >
              Plan
            </button>
            <button
              id="tf-btn-apply"
              onClick={() => handleAction('apply')}
              disabled={isExecuting || !tfStatus?.installed}
              className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/30 text-purple-400 font-bold text-[9px] uppercase tracking-wider disabled:opacity-35 cursor-pointer"
              title="Apply configurations"
            >
              Apply
            </button>
            <button
              id="tf-btn-destroy"
              onClick={() => handleAction('destroy')}
              disabled={isExecuting || !tfStatus?.installed}
              className="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/35 border border-red-500/30 text-red-400 font-bold text-[9px] uppercase tracking-wider disabled:opacity-35 cursor-pointer"
              title="Destroy resources"
            >
              Destroy
            </button>
          </div>
          {/* Status badge */}
          <span id="tf-workspace-badge" className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border flex items-center space-x-1 ${
            tfStatus?.installed 
              ? 'bg-green-500/10 text-green-400 border-green-500/25' 
              : 'bg-red-500/10 text-red-400 border-red-500/25'
          }`}>
            <span>Workspace: {tfStatus?.workspace || 'None'}</span>
          </span>
        </div>

        {/* Console Logs area */}
        <div className="flex-grow flex flex-col p-4 min-h-0 bg-[#08080a]">
          {error && (
            <div className="mb-3 p-2 bg-red-950/20 border border-red-500/20 rounded-xl flex items-center justify-between text-[10px] text-red-400 font-sans shadow-sm">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                <span>Terraform Engine status offline: {error}</span>
              </div>
              <button 
                id="tf-btn-retry"
                onClick={fetchStatus}
                className="px-2 py-0.5 bg-red-500/15 border border-red-500/35 rounded text-[8px] font-bold text-red-300 hover:bg-red-500/25 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}
          <div className="flex items-center space-x-1.5 text-slate-400 border-b border-neutral-900 pb-2 mb-2 flex-shrink-0">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Plan & Apply logs</span>
          </div>
          <pre id="tf-console-logs" className="flex-grow overflow-auto text-[10.5px] leading-relaxed text-slate-300 p-3 bg-black/45 rounded-lg border border-neutral-900 whitespace-pre-wrap select-all select-text font-mono">
            {consoleLogs || '[CaelumOS] Write your Terraform configuration in main.tf and run Init/Validate to start.'}
          </pre>
        </div>
      </div>
    </div>
  );
}
