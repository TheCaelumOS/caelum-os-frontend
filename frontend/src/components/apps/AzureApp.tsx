"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Cloud, RefreshCw, LayoutGrid, Server, HardDrive, AlertCircle, Key, Network, AppWindow, Database, CheckCircle, XCircle, LogOut } from 'lucide-react';

interface Subscription {
  subscriptionId: string;
  displayName: string;
  state: string;
}

interface VM {
  id: string;
  name: string;
  resourceGroup: string;
  size: string;
  status: string;
  location: string;
}

interface StorageAcct {
  name: string;
  resourceGroup: string;
  type: string;
  status: string;
  location: string;
}

interface ResourceGroup {
  name: string;
  status: string;
  location: string;
}

interface VNet {
  name: string;
  resourceGroup: string;
  addressSpace: string;
  status: string;
  location: string;
}

interface Nsg {
  name: string;
  resourceGroup: string;
  status: string;
  location: string;
}

interface PublicIp {
  name: string;
  resourceGroup: string;
  ipAddress: string;
  status: string;
  location: string;
}

interface AppService {
  name: string;
  resourceGroup: string;
  state: string;
  defaultHostName: string;
  location: string;
}

interface SqlDb {
  name: string;
  serverName: string;
  resourceGroup: string;
  status: string;
  location: string;
}

interface KeyVault {
  name: string;
  resourceGroup: string;
  location: string;
}

interface Registry {
  name: string;
  resourceGroup: string;
  loginServer: string;
  status: string;
  location: string;
}

interface AzureAppProps {
  initialSubPath?: string;
  onPathChange?: (subpath: string) => void;
}

export default function AzureApp({ initialSubPath = '', onPathChange }: AzureAppProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [rgs, setRgs] = useState<ResourceGroup[]>([]);
  const [vms, setVms] = useState<VM[]>([]);
  const [storage, setStorage] = useState<StorageAcct[]>([]);
  const [vnets, setVnets] = useState<VNet[]>([]);
  const [nsgs, setNsgs] = useState<Nsg[]>([]);
  const [publicIps, setPublicIps] = useState<PublicIp[]>([]);
  const [appServices, setAppServices] = useState<AppService[]>([]);
  const [sqlDbs, setSqlDbs] = useState<SqlDb[]>([]);
  const [vaults, setVaults] = useState<KeyVault[]>([]);
  const [registries, setRegistries] = useState<Registry[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Never');

  // Wizard States
  const [authMethod, setAuthMethod] = useState<'cli' | 'servicePrincipal'>('cli');
  const [clientId, setClientId] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [tenantId, setTenantId] = useState<string>('');
  const [subscriptionId, setSubscriptionId] = useState<string>('');
  const [connectLoading, setConnectLoading] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>(initialSubPath || 'sub');

  const tabs = [
    { id: 'sub', name: 'Subscription' },
    { id: 'rgs', name: 'Resource Groups' },
    { id: 'vms', name: 'Virtual Machines' },
    { id: 'storage', name: 'Storage Accounts' },
    { id: 'network', name: 'Networking' },
    { id: 'apps', name: 'App Services & ACR' },
    { id: 'db', name: 'Databases & Vaults' },
  ];

  const fetchResources = async (isOnLoad = false) => {
    setLoading(true);
    if (isOnLoad) {
      setError(null);
    }

    try {
      const health = await apiRequest('/azure/health');
      if (health && health.connected) {
        setConnected(true);
        setError(null);

        const [
          subData,
          rgData,
          vmData,
          storageData,
          vnetData,
          nsgData,
          ipData,
          appData,
          dbData,
          vaultData,
          registryData
        ] = await Promise.all([
          apiRequest('/azure/subscription'),
          apiRequest('/azure/resource-groups'),
          apiRequest('/azure/virtual-machines'),
          apiRequest('/azure/storage-accounts'),
          apiRequest('/azure/virtual-networks'),
          apiRequest('/azure/network-security-groups'),
          apiRequest('/azure/public-ips'),
          apiRequest('/azure/app-services'),
          apiRequest('/azure/sql-databases'),
          apiRequest('/azure/key-vaults'),
          apiRequest('/azure/container-registries')
        ]);

        setSubscription(subData);
        setRgs(rgData || []);
        setVms(vmData || []);
        setStorage(storageData || []);
        setVnets(vnetData || []);
        setNsgs(nsgData || []);
        setPublicIps(ipData || []);
        setAppServices(appData || []);
        setSqlDbs(dbData || []);
        setVaults(vaultData || []);
        setRegistries(registryData || []);
        setLastRefreshed(new Date().toLocaleTimeString());
      } else {
        setConnected(false);
        if (!isOnLoad) {
          setError(health?.reason || 'Azure account not connected.');
        }
        clearAllData();
      }
    } catch (e: any) {
      setConnected(false);
      if (!isOnLoad) {
        setError('Connection failed. Please ensure the backend is running.');
      }
      clearAllData();
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/azure/connect', {
        method: 'POST',
        body: JSON.stringify({
          authMethod,
          clientId: authMethod === 'servicePrincipal' ? clientId : undefined,
          clientSecret: authMethod === 'servicePrincipal' ? clientSecret : undefined,
          tenantId: authMethod === 'servicePrincipal' ? tenantId : undefined,
          subscriptionId: subscriptionId || undefined
        })
      });

      if (res && res.connected) {
        setConnected(true);
        await fetchResources();
      } else {
        setError(res?.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection attempt failed.');
    } finally {
      setConnectLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await apiRequest('/azure/disconnect', { method: 'POST' });
      setConnected(false);
      clearAllData();
    } catch (err: any) {
      setError('Failed to disconnect Azure account.');
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = () => {
    setSubscription(null);
    setRgs([]);
    setVms([]);
    setStorage([]);
    setVnets([]);
    setNsgs([]);
    setPublicIps([]);
    setAppServices([]);
    setSqlDbs([]);
    setVaults([]);
    setRegistries([]);
  };

  useEffect(() => {
    fetchResources(true);
  }, []);

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
    <div className="flex-grow flex bg-[#f0f4f8] text-slate-800 min-h-0 select-text font-sans h-full">
      {/* Side Navigation Bar */}
      <div className="w-1/4 bg-white border-r border-slate-200 p-3 space-y-4 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5 px-3 py-2 border-b border-slate-100 mb-3">
            <Cloud className="w-5 h-5 text-blue-600 animate-pulse" />
            <div>
              <span className="font-extrabold text-xs text-slate-800 block">Azure Console</span>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-amber-500'}`} />
                <span className={`text-[8px] uppercase font-bold font-mono ${connected ? 'text-green-600' : 'text-amber-600'}`}>
                  {connected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => selectTab(t.id)}
                disabled={!connected}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !connected 
                    ? 'opacity-40 cursor-not-allowed text-slate-400' 
                    : activeTab === t.id 
                      ? 'bg-blue-600/10 text-blue-600' 
                      : 'hover:bg-slate-100 text-slate-655'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {connected && (
            <>
              <div className="px-3 py-1 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[7.5px] uppercase font-bold text-slate-400 block">Last Refreshed</span>
                <span className="text-[9px] font-mono text-slate-600 font-bold block mt-0.5">{lastRefreshed}</span>
              </div>
              <button
                onClick={() => fetchResources(false)}
                className="w-full py-1.5 border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800 text-[10px] font-bold rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
              <button
                onClick={handleDisconnect}
                className="w-full py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 transition-colors text-[10px] font-bold rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Azure</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-grow overflow-y-auto p-5 min-h-0 bg-[#f4f7f6]">
        {loading && subscription === null ? (
          <div className="text-center py-20 text-xs text-slate-400 font-bold flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span>Verifying Azure Account connection...</span>
          </div>
        ) : !connected ? (
          /* Connection Setup Wizard */
          <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center justify-center p-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
                <Cloud className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-base text-slate-800">Connect Azure Account</h3>
              <p className="text-xs text-slate-450 px-4">
                Connect your account to access and view real-time subscriptions, virtual machines, and storage.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Authentication Method</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-1">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('cli')}
                    className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                      authMethod === 'cli' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Azure CLI (Dev)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMethod('servicePrincipal')}
                    className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                      authMethod === 'servicePrincipal' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Service Principal
                  </button>
                </div>
              </div>

              {authMethod === 'cli' ? (
                <div className="bg-slate-50 border border-slate-150/60 rounded-2xl p-3.5 text-xs text-slate-500 space-y-2">
                  <p className="font-bold text-slate-700">Azure CLI Credentials (Development Mode)</p>
                  <p>
                    Ensures connection to your local backend server session using the authenticated Azure CLI profile.
                  </p>
                  <p>
                    Ensure you have run <code className="bg-slate-200 px-1 py-0.5 rounded font-mono font-bold text-[10px]">az login</code> locally.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-450 uppercase block">Tenant ID</label>
                    <input
                      type="text"
                      required
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      placeholder="00000000-0000-0000-0000-000000000000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-450 uppercase block">Client (Application) ID</label>
                    <input
                      type="text"
                      required
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="00000000-0000-0000-0000-000000000000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-455 uppercase block">Client Secret</label>
                    <input
                      type="password"
                      required
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      placeholder="••••••••••••••••••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-450 uppercase block">
                  Subscription ID <span className="text-[8.5px] text-slate-400 capitalize">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={subscriptionId}
                  onChange={(e) => setSubscriptionId(e.target.value)}
                  placeholder="Auto-discover if left blank"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={connectLoading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {connectLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <span>Connect Azure Account</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Connected Live Metrics Console Dashboard */
          <>
            {/* Connection Status Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-xl border border-green-200/50 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Connection Status</span>
                  <span className="text-xs font-extrabold text-slate-800">Connected to Live Subscription</span>
                </div>
              </div>
              {subscription && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Account</span>
                  <span className="text-xs font-extrabold text-blue-600 block">{subscription.displayName}</span>
                </div>
              )}
            </div>

            {/* Resource Counters / Metrics Dashboard Card */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Resource Groups</span>
                  <span className="text-2xl font-extrabold text-slate-700 mt-1 block">{rgs.length}</span>
                </div>
                <LayoutGrid className="w-7 h-7 text-blue-500 bg-blue-50 p-1.5 rounded-xl" />
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Virtual Machines</span>
                  <span className="text-2xl font-extrabold text-slate-700 mt-1 block">{vms.length}</span>
                </div>
                <Server className="w-7 h-7 text-green-500 bg-green-50 p-1.5 rounded-xl" />
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Storage Accounts</span>
                  <span className="text-2xl font-extrabold text-slate-700 mt-1 block">{storage.length}</span>
                </div>
                <HardDrive className="w-7 h-7 text-cyan-500 bg-cyan-50 p-1.5 rounded-xl" />
              </div>
            </div>

            {activeTab === 'sub' && subscription && (
              <div className="space-y-4 font-sans">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Azure Subscription Info</h4>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 max-w-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-450 uppercase block font-bold">Subscription Name</span>
                      <span className="text-sm font-extrabold text-slate-700">{subscription.displayName}</span>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 uppercase font-mono">
                      {subscription.state}
                    </span>
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-[10px] text-slate-455 uppercase block font-bold">Subscription ID</span>
                    <span className="text-xs font-bold font-mono text-slate-600 block break-all">{subscription.subscriptionId}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rgs' && (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Resource Groups</h4>
                {rgs.length === 0 ? (
                  <div className="bg-white border border-slate-250/60 rounded-2xl p-8 text-center text-xs text-slate-400 font-bold shadow-sm animate-pulse">
                    No Resource Groups found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rgs.map(rg => (
                      <div key={rg.name} className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm flex items-center space-x-3.5">
                        <div className="bg-blue-650/10 border border-blue-500/25 rounded-xl p-2.5 text-blue-600">
                          <LayoutGrid className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 block truncate max-w-[200px]">{rg.name}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">Region: {rg.location} | Status: {rg.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'vms' && (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Virtual Machines</h4>
                {vms.length === 0 ? (
                  <div className="bg-white border border-slate-250/60 rounded-2xl p-8 text-center text-xs text-slate-400 font-bold shadow-sm animate-pulse">
                    No Virtual Machines found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {vms.map(vm => (
                      <div key={vm.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <Server className="w-5 h-5 text-blue-600" />
                            <span className="font-extrabold text-xs text-slate-700">{vm.name}</span>
                          </div>
                          <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${
                            vm.status === 'Running' || vm.status === 'Succeeded' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {vm.status || 'Unknown'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-medium">
                          <div>Resource Group: <span className="text-slate-700 font-bold font-mono">{vm.resourceGroup}</span></div>
                          <div>Size: <span className="text-slate-700 font-bold font-mono">{vm.size || 'N/A'}</span></div>
                          <div>Region: <span className="text-slate-700 font-bold font-mono">{vm.location}</span></div>
                          <div className="col-span-2 truncate">ID: <span className="text-slate-600 font-bold font-mono text-[9px]">{vm.id}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'storage' && (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Storage Accounts</h4>
                {storage.length === 0 ? (
                  <div className="bg-white border border-slate-250/60 rounded-2xl p-8 text-center text-xs text-slate-400 font-bold shadow-sm animate-pulse">
                    No Storage Accounts found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {storage.map(sa => (
                      <div key={sa.name} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <HardDrive className="w-5 h-5 text-cyan-600" />
                            <span className="font-extrabold text-xs text-slate-700">{sa.name}</span>
                          </div>
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 uppercase font-mono">
                            {sa.status || 'Available'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-medium">
                          <div>Resource Group: <span className="text-slate-700 font-bold font-mono">{sa.resourceGroup}</span></div>
                          <div>Type: <span className="text-slate-700 font-bold font-mono">{sa.type}</span></div>
                          <div>Location: <span className="text-slate-700 font-bold font-mono">{sa.location}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'network' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Virtual Networks (VNET)</h4>
                  {vnets.length === 0 ? (
                    <div className="bg-white border border-slate-250/60 rounded-2xl p-6 text-center text-xs text-slate-400 font-bold shadow-sm">
                      No Virtual Networks found
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {vnets.map(vn => (
                        <div key={vn.name} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 font-mono text-xs">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <span className="font-bold text-slate-700">{vn.name}</span>
                            <span className="text-slate-455 text-[10px]">Address Space: {vn.addressSpace}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                            <div>Resource Group: <span className="font-bold text-slate-700">{vn.resourceGroup}</span></div>
                            <div>Location: <span className="font-bold text-slate-700">{vn.location}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Network Security Groups (NSG)</h4>
                    {nsgs.length === 0 ? (
                      <div className="bg-white border border-slate-250/60 rounded-2xl p-6 text-center text-xs text-slate-400 font-bold shadow-sm font-sans">
                        No Network Security Groups found
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                        {nsgs.map(nsg => (
                          <div key={nsg.name} className="flex justify-between items-center text-xs font-mono border-b border-slate-50 pb-2 last:border-b-0 last:pb-0">
                            <div>
                              <span className="font-bold text-slate-700 block">{nsg.name}</span>
                              <span className="text-[9px] text-slate-400">{nsg.resourceGroup}</span>
                            </div>
                            <span className="text-[9px] font-extrabold text-slate-500">{nsg.location}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Public IP Addresses</h4>
                    {publicIps.length === 0 ? (
                      <div className="bg-white border border-slate-250/60 rounded-2xl p-6 text-center text-xs text-slate-400 font-bold shadow-sm font-sans">
                        No Public IPs found
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                        {publicIps.map(ip => (
                          <div key={ip.name} className="flex justify-between items-center text-xs font-mono border-b border-slate-50 pb-2 last:border-b-0 last:pb-0">
                            <div>
                              <span className="font-bold text-slate-700 block">{ip.name}</span>
                              <span className="text-[10px] text-blue-600 font-extrabold">{ip.ipAddress}</span>
                            </div>
                            <span className="text-[9px] text-slate-400">{ip.resourceGroup}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'apps' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">App Services (Web Apps)</h4>
                  {appServices.length === 0 ? (
                    <div className="bg-white border border-slate-250/60 rounded-2xl p-8 text-center text-xs text-slate-400 font-bold shadow-sm animate-pulse">
                      No App Services found
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {appServices.map(app => (
                        <div key={app.name} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <AppWindow className="w-5 h-5 text-indigo-500" />
                              <span className="font-bold text-xs text-slate-700">{app.name}</span>
                            </div>
                            <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-green-50 text-green-600 uppercase border border-green-200">
                              {app.state}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-455 font-mono space-y-1">
                            <div className="truncate">URL: <a href={`https://${app.defaultHostName}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{app.defaultHostName}</a></div>
                            <div>RG: <span className="text-slate-655 font-bold">{app.resourceGroup}</span> | Region: <span className="text-slate-655 font-bold">{app.location}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Container Registries (ACR)</h4>
                  {registries.length === 0 ? (
                    <div className="bg-white border border-slate-250/60 rounded-2xl p-6 text-center text-xs text-slate-400 font-bold shadow-sm font-sans animate-pulse">
                      No Container Registries found
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                      {registries.map(reg => (
                        <div key={reg.name} className="flex justify-between items-center text-xs font-mono border-b border-slate-50 pb-2 last:border-b-0 last:pb-0">
                          <div>
                            <span className="font-bold text-slate-700 block">{reg.name}</span>
                            <span className="text-[10px] text-slate-400">{reg.loginServer}</span>
                          </div>
                          <span className="text-[9px] font-extrabold text-slate-500">{reg.location}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'db' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">SQL Databases</h4>
                  {sqlDbs.length === 0 ? (
                    <div className="bg-white border border-slate-250/60 rounded-2xl p-8 text-center text-xs text-slate-400 font-bold shadow-sm font-sans animate-pulse">
                      No SQL Databases found
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                      {sqlDbs.map(db => (
                        <div key={db.name} className="flex justify-between items-center text-xs font-mono border-b border-slate-50 pb-2 last:border-b-0 last:pb-0">
                          <div>
                            <span className="font-extrabold text-slate-800 block flex items-center"><Database className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> {db.name}</span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">Server: {db.serverName}</span>
                          </div>
                          <span className="text-[9px] font-extrabold text-green-600">{db.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Key Vaults</h4>
                  {vaults.length === 0 ? (
                    <div className="bg-white border border-slate-250/60 rounded-2xl p-8 text-center text-xs text-slate-400 font-bold shadow-sm font-sans animate-pulse">
                      No Key Vaults found
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                      {vaults.map(kv => (
                        <div key={kv.name} className="flex justify-between items-center text-xs font-mono border-b border-slate-50 pb-2 last:border-b-0 last:pb-0">
                          <div className="flex items-center space-x-2.5">
                            <div className="p-1.5 bg-yellow-500/10 border border-yellow-500/25 rounded-lg text-yellow-600">
                              <Key className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-800 block">{kv.name}</span>
                              <span className="text-[9px] text-slate-400">{kv.resourceGroup}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-extrabold text-slate-500">{kv.location}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
