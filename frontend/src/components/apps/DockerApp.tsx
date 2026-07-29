"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Play, Square, RotateCw, Terminal, Cpu, Database, Network, RefreshCw, AlertCircle, Layers, FileText } from 'lucide-react';

interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  ports: string;
  created: string;
}

interface DockerAppProps {
  initialSubPath?: string;
  onPathChange?: (subpath: string) => void;
}

export default function DockerApp({ initialSubPath = '', onPathChange }: DockerAppProps) {
  const [containers, setContainers] = useState<Container[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [logs, setLogs] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  
  // Tabs mapping
  const [activeTab, setActiveTab] = useState<string>(initialSubPath || 'containers');

  const tabs = [
    { id: 'containers', name: 'Containers' },
    { id: 'images', name: 'Images' },
    { id: 'networks', name: 'Networks' },
    { id: 'volumes', name: 'Volumes' },
    { id: 'compose', name: 'Docker Compose' },
    { id: 'logs', name: 'Daemon Logs' },
  ];

  const fetchContainers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('/docker/containers');
      setContainers(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (e: any) {
      console.warn('Backend server unreachable. Using fallback offline simulation mode.', e);
      setError('Backend is unavailable. Please start the backend server.');
      const mockContainers = [
        { id: 'c-89fb42a7810e', name: 'caelum-api-gateway', image: 'caelum/api:v2.1', status: 'Up 4 hours', ports: '0.0.0.0:4000->4000/tcp', state: 'running', created: '4 hours ago' },
        { id: 'c-38da12bc90fa', name: 'caelum-postgres-db', image: 'postgres:15-alpine', status: 'Up 4 hours', ports: '0.0.0.0:5432->5432/tcp', state: 'running', created: '4 hours ago' },
        { id: 'c-77df90e3cd22', name: 'caelum-redis-cache', image: 'redis:7.0-alpine', status: 'Exited (137) 20 mins ago', ports: '', state: 'exited', created: '1 day ago' }
      ];
      setContainers(mockContainers);
      setSelectedId(mockContainers[0].id);
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

  useEffect(() => {
    if (initialSubPath && initialSubPath !== activeTab) {
      setActiveTab(initialSubPath);
    }
  }, [initialSubPath]);

  const selectTab = (tabId: string) => {
    setActiveTab(tabId);
    if (onPathChange) {
      onPathChange(tabId);
    }
  };

  return (
    <div className="flex-grow flex bg-[#0c0c0e] text-slate-100 min-h-0 select-text font-sans h-full">
      {/* Side Navigation Bar */}
      <div className="w-1/4 bg-[#0f0f12] border-r border-neutral-850 p-3 space-y-4 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5 px-3 py-2 border-b border-neutral-850 mb-3">
            <Database className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="font-extrabold text-xs text-slate-200 block">Docker Hub</span>
              <span className={`text-[8px] uppercase font-bold font-mono ${error ? 'text-amber-500 font-extrabold animate-pulse' : 'text-cyan-400'}`}>
                {error ? 'Simulated Offline' : 'Engine: Active'}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => selectTab(t.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === t.id 
                    ? 'bg-cyan-500/10 text-cyan-400' 
                    : 'hover:bg-neutral-900 text-slate-400'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={fetchContainers}
          className="w-full py-1.5 border border-neutral-850 hover:bg-neutral-900 transition-colors text-slate-400 hover:text-slate-200 text-[10px] font-bold rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Containers</span>
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#0c0c0e]">
        {error && (
          <div className="mx-5 mt-5 p-3 bg-amber-950/20 border border-amber-500/20 rounded-2xl flex items-center justify-between text-xs text-amber-400 shadow-sm font-sans">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-4.5 h-4.5 text-amber-500 flex-shrink-0" />
              <span className="font-semibold text-amber-300">Cloud not connected. Running in simulation mode.</span>
            </div>
            <button 
              onClick={fetchContainers}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-lg cursor-pointer transition-all border border-amber-500/30"
            >
              Retry
            </button>
          </div>
        )}
        {activeTab === 'containers' && (
          <div className="flex-1 flex min-h-0">
            {/* Sidebar list inside panel */}
            <div className="w-1/2 border-r border-neutral-850 flex flex-col min-h-0">
              <div className="p-3 border-b border-neutral-850">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Containers</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {containers.map(c => {
                  const isRunning = c.state === 'running';
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        selectedId === c.id 
                          ? 'bg-blue-600/10 border-blue-500/30' 
                          : 'bg-neutral-900/40 border-neutral-850 hover:border-neutral-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs truncate max-w-[110px]">{c.name}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          isRunning ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {c.state}
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-450 font-mono mt-1 truncate">{c.image}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Container logs / controls */}
            <div className="flex-1 flex flex-col min-h-0">
              {selectedId ? (
                <>
                  {(() => {
                    const c = containers.find(item => item.id === selectedId);
                    if (!c) return null;
                    const isRunning = c.state === 'running';
                    return (
                      <div className="p-4 border-b border-neutral-850 bg-[#0f0f12] flex items-center justify-between flex-shrink-0">
                        <div className="truncate max-w-[130px]">
                          <h3 className="text-xs font-bold text-slate-200 truncate">{c.name}</h3>
                          <span className="text-[9px] font-mono text-slate-450 truncate block mt-0.5">ID: {c.id}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleAction(c.id, 'start')}
                            disabled={isRunning || actionLoading}
                            className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/25 border border-green-500/30 text-green-400 disabled:opacity-30 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            onClick={() => handleAction(c.id, 'stop')}
                            disabled={!isRunning || actionLoading}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 disabled:opacity-30 cursor-pointer"
                          >
                            <Square className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            onClick={() => handleAction(c.id, 'restart')}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 cursor-pointer"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex-1 flex flex-col min-h-0 bg-[#08080a] p-3 font-mono text-xs">
                    <pre className="flex-grow overflow-auto text-[10px] leading-relaxed text-slate-350 p-2 bg-black/45 rounded-lg border border-neutral-900 whitespace-pre-wrap select-all">
                      {logs || 'No logs registered.'}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="flex-grow flex items-center justify-center text-slate-500 text-xs font-bold">
                  Select a container to manage.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="p-4 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Local Images</h4>
            <div className="space-y-2 text-xs font-mono bg-neutral-900/40 border border-neutral-850 p-3 rounded-2xl">
              <div className="flex justify-between items-center text-slate-450 border-b border-neutral-850 pb-2">
                <span>Repository</span>
                <span>Tag</span>
                <span>Size</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>caelum/ai-core</span>
                <span>latest</span>
                <span>512 MB</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>node</span>
                <span>18-alpine</span>
                <span>180 MB</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'networks' && (
          <div className="p-4 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Docker Networks</h4>
            <div className="space-y-2 text-xs font-mono bg-neutral-900/40 border border-neutral-850 p-3 rounded-2xl">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-bold">bridge</span>
                <span>bridge</span>
                <span>local</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-bold">caelum-net</span>
                <span>overlay</span>
                <span>swarm</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'volumes' && (
          <div className="p-4 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Storage Volumes</h4>
            <div className="space-y-2 text-xs font-mono bg-neutral-900/40 border border-neutral-850 p-3 rounded-2xl text-slate-300">
              <div>caelum-postgres-data (local)</div>
              <div>caelum-redis-cache (local)</div>
            </div>
          </div>
        )}

        {activeTab === 'compose' && (
          <div className="p-4 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Docker Compose Configuration</h4>
            <pre className="p-3 bg-black/45 border border-neutral-900 rounded-2xl text-[10px] text-slate-350 font-mono overflow-auto leading-relaxed">
{`version: '3.8'
services:
  caelum-api:
    image: caelum/ai-core:latest
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
    networks:
      - caelum-net`}
            </pre>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="flex-1 flex flex-col min-h-0 p-3 font-mono text-[10px] leading-relaxed text-slate-350 bg-[#08080a]">
            <span className="text-slate-450 uppercase font-bold tracking-wider mb-2 block border-b border-neutral-900 pb-1.5">Engine logs</span>
            <pre className="flex-1 overflow-auto whitespace-pre-wrap select-all">
{`[info] info: Docker Daemon started successfully.
[info] info: Swarm cluster node initialized on port 2377.
[info] info: API connection established from client.`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
