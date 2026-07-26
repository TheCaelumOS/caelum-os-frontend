"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Play, Square, RotateCw, Terminal, Cpu, Database, Network, RefreshCw } from 'lucide-react';

interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  ports: string;
  created: string;
}

export default function DockerApp() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [logs, setLogs] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchContainers = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/docker/containers');
      setContainers(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (id: string) => {
    try {
      const data = await apiRequest(`/docker/container/${id}/logs`);
      setLogs(data.logs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAction = async (id: string, action: 'start' | 'stop' | 'restart') => {
    setActionLoading(true);
    try {
      await apiRequest(`/docker/container/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      await fetchContainers();
      await fetchLogs(id);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchLogs(selectedId);
    }
  }, [selectedId]);

  return (
    <div className="flex-1 flex bg-[#0c0c0e] text-slate-100 min-h-0 select-text font-sans">
      {/* Sidebar: Containers list */}
      <div className="w-1/3 border-r border-neutral-800 flex flex-col min-h-0 bg-[#0f0f12]">
        <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Containers</span>
          <button 
            onClick={fetchContainers} 
            disabled={loading}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {loading && containers.length === 0 ? (
            <div className="text-center text-xs py-10 text-slate-500">Querying Docker daemon...</div>
          ) : (
            containers.map(c => {
              const isRunning = c.state === 'running';
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedId === c.id 
                      ? 'bg-blue-600/10 border-blue-500/30' 
                      : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate max-w-[130px]">{c.name}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      isRunning ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {c.state}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">{c.image}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Panel: Selected Container actions & logs */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#0c0c0e]">
        {selectedId ? (
          <>
            {/* Header / Controls */}
            {(() => {
              const c = containers.find(item => item.id === selectedId);
              if (!c) return null;
              const isRunning = c.state === 'running';
              return (
                <div className="p-4 border-b border-neutral-800 bg-[#0f0f12] flex items-center justify-between flex-shrink-0">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">{c.name}</h3>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">ID: {c.id} | Ports: {c.ports}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAction(c.id, 'start')}
                      disabled={isRunning || actionLoading}
                      className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/25 border border-green-500/30 text-green-400 disabled:opacity-30 disabled:hover:bg-green-500/10 cursor-pointer transition-colors"
                      title="Start Container"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={() => handleAction(c.id, 'stop')}
                      disabled={!isRunning || actionLoading}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 disabled:opacity-30 disabled:hover:bg-red-500/10 cursor-pointer transition-colors"
                      title="Stop Container"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={() => handleAction(c.id, 'restart')}
                      disabled={actionLoading}
                      className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 cursor-pointer transition-colors"
                      title="Restart Container"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Container Stats Mockup */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-900/20 border-b border-neutral-800 flex-shrink-0">
              <div className="bg-[#0f0f12] border border-neutral-800/60 rounded-xl p-2.5 flex items-center space-x-2.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">CPU Load</span>
                  <span className="text-xs font-bold font-mono">1.2%</span>
                </div>
              </div>
              <div className="bg-[#0f0f12] border border-neutral-800/60 rounded-xl p-2.5 flex items-center space-x-2.5">
                <Database className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Memory usage</span>
                  <span className="text-xs font-bold font-mono">42.5 MB</span>
                </div>
              </div>
              <div className="bg-[#0f0f12] border border-neutral-800/60 rounded-xl p-2.5 flex items-center space-x-2.5">
                <Network className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Network I/O</span>
                  <span className="text-xs font-bold font-mono">14 KB / 8 KB</span>
                </div>
              </div>
            </div>

            {/* Logs Area */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#08080a] p-3 font-mono text-xs">
              <div className="flex items-center space-x-1.5 text-slate-400 border-b border-neutral-900 pb-2 mb-2 flex-shrink-0">
                <Terminal className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Console Logs</span>
              </div>
              <pre className="flex-grow overflow-auto text-[11px] leading-relaxed text-slate-300 p-2 bg-black/35 rounded-lg border border-neutral-900 whitespace-pre-wrap select-all">
                {logs || 'No logs registered.'}
              </pre>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-slate-500 text-xs">
            Select a container from list to manage.
          </div>
        )}
      </div>
    </div>
  );
}
