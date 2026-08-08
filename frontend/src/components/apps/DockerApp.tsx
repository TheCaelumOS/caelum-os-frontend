"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Play, Square, RotateCw, Trash2, Database, RefreshCw, AlertCircle } from 'lucide-react';

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

  const [images, setImages] = useState<any[]>([]);
  const [networks, setNetworks] = useState<any[]>([]);
  const [volumes, setVolumes] = useState<any[]>([]);
  const [daemonLogs, setDaemonLogs] = useState<string>('');
  const [engineStatus, setEngineStatus] = useState<{ connected: boolean; version?: string; error?: string } | null>(null);

  const tabs = [
    { id: 'containers', name: 'Containers' },
    { id: 'images', name: 'Images' },
    { id: 'networks', name: 'Networks' },
    { id: 'volumes', name: 'Volumes' },
    { id: 'compose', name: 'Docker Compose' },
    { id: 'logs', name: 'Daemon Logs' },
  ];

  const checkStatus = async () => {
    try {
      const data = await apiRequest('/docker/status');
      setEngineStatus(data);
      if (data && !data.connected) {
        setError(data.error || 'Docker Engine is unreachable.');
      } else {
        setError(null);
      }
    } catch (err: any) {
      setEngineStatus({ connected: false, error: 'Cannot reach backend server.' });
      setError('Cannot reach backend server.');
    }
  };

  const fetchContainers = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/docker/containers');
      setContainers(data || []);
      if (data && data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (e: any) {
      console.error('Failed to fetch containers:', e);
      setContainers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/docker/images');
      setImages(data || []);
    } catch (e) {
      console.error('Failed to fetch images:', e);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNetworks = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/docker/networks');
      setNetworks(data || []);
    } catch (e) {
      console.error('Failed to fetch networks:', e);
      setNetworks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolumes = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/docker/volumes');
      setVolumes(data || []);
    } catch (e) {
      console.error('Failed to fetch volumes:', e);
      setVolumes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDaemonLogs = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/docker/daemon-logs');
      setDaemonLogs(data || 'No logs received.');
    } catch (e) {
      console.error('Failed to fetch daemon logs:', e);
      setDaemonLogs('Error fetching daemon event logs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (id: string) => {
    try {
      const data = await apiRequest(`/docker/container/${id}/logs`);
      setLogs(data.logs || 'No logs registered.');
    } catch (e) {
      console.error(e);
      setLogs('Error fetching container stdout logs.');
    }
  };

  const handleAction = async (id: string, action: 'start' | 'stop' | 'restart' | 'remove') => {
    setActionLoading(true);
    try {
      await apiRequest(`/docker/container/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      if (action === 'remove') {
        if (selectedId === id) {
          setSelectedId('');
          setLogs('');
        }
      }
      await fetchContainers();
      if (action !== 'remove') {
        await fetchLogs(id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  useEffect(() => {
    if (activeTab === 'containers') {
      fetchContainers();
    } else if (activeTab === 'images') {
      fetchImages();
    } else if (activeTab === 'networks') {
      fetchNetworks();
    } else if (activeTab === 'volumes') {
      fetchVolumes();
    } else if (activeTab === 'logs') {
      fetchDaemonLogs();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedId && activeTab === 'containers') {
      fetchLogs(selectedId);
    }
  }, [selectedId, activeTab]);

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
              <span className={`text-[8px] uppercase font-bold font-mono ${(!engineStatus || !engineStatus.connected) ? 'text-red-500 font-extrabold animate-pulse' : 'text-cyan-400'}`}>
                {(!engineStatus || !engineStatus.connected) ? 'Engine: Offline' : `Engine: Connected (${engineStatus.version})`}
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
          onClick={() => {
            checkStatus();
            if (activeTab === 'containers') fetchContainers();
            else if (activeTab === 'images') fetchImages();
            else if (activeTab === 'networks') fetchNetworks();
            else if (activeTab === 'volumes') fetchVolumes();
            else if (activeTab === 'logs') fetchDaemonLogs();
          }}
          className="w-full py-1.5 border border-neutral-850 hover:bg-neutral-900 transition-colors text-slate-400 hover:text-slate-200 text-[10px] font-bold rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#0c0c0e]">
        {engineStatus && !engineStatus.connected && (
          <div className="mx-5 mt-5 p-3 bg-red-950/20 border border-red-500/20 rounded-2xl flex items-center justify-between text-xs text-red-400 shadow-sm font-sans">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-4.5 h-4.5 text-red-500 flex-shrink-0" />
              <span className="font-semibold text-red-300">Docker Daemon disconnected: {engineStatus.error}</span>
            </div>
            <button 
              onClick={() => { checkStatus(); fetchContainers(); }}
              className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded-lg cursor-pointer transition-all border border-red-500/30"
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
                {containers.length === 0 ? (
                  <div className="text-xs text-slate-500 font-bold p-4 text-center">
                    No containers running or stopped.
                  </div>
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
                        <div className="text-[9px] text-slate-400 font-mono mt-1 truncate">{c.image}</div>
                      </div>
                    );
                  })
                )}
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
                          <span className="text-[9px] font-mono text-slate-400 truncate block mt-0.5">ID: {c.id}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleAction(c.id, 'start')}
                            disabled={isRunning || actionLoading}
                            className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/25 border border-green-500/30 text-green-400 disabled:opacity-30 cursor-pointer"
                            title="Start"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            onClick={() => handleAction(c.id, 'stop')}
                            disabled={!isRunning || actionLoading}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 disabled:opacity-30 cursor-pointer"
                            title="Stop"
                          >
                            <Square className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            onClick={() => handleAction(c.id, 'restart')}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 cursor-pointer"
                            title="Restart"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAction(c.id, 'remove')}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/25 border border-red-500/30 text-red-500 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex-1 flex flex-col min-h-0 bg-[#08080a] p-3 font-mono text-xs">
                    <pre className="flex-grow overflow-auto text-[10px] leading-relaxed text-slate-300 p-2 bg-black/45 rounded-lg border border-neutral-900 whitespace-pre-wrap select-all">
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
            {images.length === 0 ? (
              <div className="text-xs text-slate-500 font-bold p-4 bg-neutral-900/20 border border-neutral-850 rounded-2xl">
                No local Docker images found.
              </div>
            ) : (
              <div className="space-y-2 text-xs font-mono bg-neutral-900/40 border border-neutral-850 p-3 rounded-2xl">
                <div className="flex justify-between items-center text-slate-450 border-b border-neutral-850 pb-2">
                  <span className="w-1/3 truncate">Repository</span>
                  <span className="w-1/4 truncate">Tag</span>
                  <span className="w-1/4 truncate">Image ID</span>
                  <span className="w-1/6 text-right">Size</span>
                </div>
                {images.map(img => (
                  <div key={img.id} className="flex justify-between items-center text-slate-300 py-1.5 border-b border-neutral-900 last:border-b-0">
                    <span className="w-1/3 truncate font-bold text-slate-200">{img.repository}</span>
                    <span className="w-1/4 truncate">{img.tag}</span>
                    <span className="w-1/4 truncate text-slate-500">{img.id}</span>
                    <span className="w-1/6 text-right text-cyan-400">{img.size}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'networks' && (
          <div className="p-4 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Docker Networks</h4>
            {networks.length === 0 ? (
              <div className="text-xs text-slate-500 font-bold p-4 bg-neutral-900/20 border border-neutral-850 rounded-2xl">
                No Docker networks found.
              </div>
            ) : (
              <div className="space-y-2 text-xs font-mono bg-neutral-900/40 border border-neutral-850 p-3 rounded-2xl">
                <div className="flex justify-between items-center text-slate-450 border-b border-neutral-850 pb-2">
                  <span className="w-1/3 truncate">Name</span>
                  <span className="w-1/3 truncate">Driver</span>
                  <span className="w-1/3 truncate">Scope</span>
                </div>
                {networks.map(net => (
                  <div key={net.id} className="flex justify-between items-center text-slate-300 py-1.5 border-b border-neutral-900 last:border-b-0">
                    <span className="w-1/3 truncate font-bold text-slate-200">{net.name}</span>
                    <span className="w-1/3 truncate">{net.driver}</span>
                    <span className="w-1/3 truncate text-slate-400">{net.scope}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'volumes' && (
          <div className="p-4 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Storage Volumes</h4>
            {volumes.length === 0 ? (
              <div className="text-xs text-slate-500 font-bold p-4 bg-neutral-900/20 border border-neutral-850 rounded-2xl">
                No storage volumes found.
              </div>
            ) : (
              <div className="space-y-2 text-xs font-mono bg-neutral-900/40 border border-neutral-850 p-3 rounded-2xl text-slate-300">
                {volumes.map((vol, idx) => (
                  <div key={idx} className="py-1.5 border-b border-neutral-900 last:border-b-0 flex justify-between">
                    <span className="font-bold text-slate-200">{vol.name}</span>
                    <span className="text-slate-450">({vol.driver})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'compose' && (
          <div className="p-4 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Docker Compose Configuration</h4>
            <pre className="p-3 bg-black/45 border border-neutral-900 rounded-2xl text-[10px] text-slate-300 font-mono overflow-auto leading-relaxed">
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
            <span className="text-slate-400 uppercase font-bold tracking-wider mb-2 block border-b border-neutral-900 pb-1.5">Engine logs</span>
            <pre className="flex-1 overflow-auto whitespace-pre-wrap select-all text-slate-300">
              {daemonLogs}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
