"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Cloud, RefreshCw, LayoutGrid, Server, HardDrive } from 'lucide-react';

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

export default function AzureApp() {
  const [vms, setVms] = useState<VM[]>([]);
  const [storageAccounts, setStorageAccounts] = useState<StorageAcct[]>([]);
  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState<'vms' | 'storage' | 'rgs'>('vms');

  const fetchResources = async () => {
    setLoading(true);
    try {
      const [vmData, storageData, rgData] = await Promise.all([
        apiRequest('/azure/vms'),
        apiRequest('/azure/storage'),
        apiRequest('/azure/resources'),
      ]);
      setVms(vmData);
      setStorageAccounts(storageData);
      setResourceGroups(rgData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-[#f0f4f8] text-slate-800 min-h-0 select-text">
      {/* Header bar */}
      <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-2 text-blue-600">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-xs block text-slate-800 font-sans">Azure Dashboard</span>
            <span className="text-[9px] font-bold text-blue-500 uppercase font-mono">Subscription Active</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setTab('vms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${tab === 'vms' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Virtual Machines ({vms.length})
          </button>
          <button 
            onClick={() => setTab('storage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${tab === 'storage' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Storage Accounts ({storageAccounts.length})
          </button>
          <button 
            onClick={() => setTab('rgs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${tab === 'rgs' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Resource Groups ({resourceGroups.length})
          </button>
        </div>
        <button 
          onClick={fetchResources}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content panel */}
      <div className="flex-grow overflow-y-auto p-4 min-h-0 bg-[#f4f7f6]">
        {loading && vms.length === 0 ? (
          <div className="text-center py-20 text-xs text-slate-400 font-bold">Querying Azure Active Directory...</div>
        ) : (
          <>
            {tab === 'vms' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vms.map(vm => (
                  <div key={vm.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <Server className="w-5 h-5 text-blue-600" />
                        <span className="font-extrabold text-xs text-slate-700">{vm.name}</span>
                      </div>
                      <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${
                        vm.status === 'VM running' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {vm.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-medium">
                      <div>Resource Group: <span className="text-slate-700 font-bold font-mono">{vm.resourceGroup}</span></div>
                      <div>Size: <span className="text-slate-700 font-bold font-mono">{vm.size}</span></div>
                      <div className="col-span-2 truncate">ID: <span className="text-slate-600 font-bold font-mono text-[9px]">{vm.id}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'storage' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storageAccounts.map(sa => (
                  <div key={sa.name} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <HardDrive className="w-5 h-5 text-cyan-600" />
                        <span className="font-extrabold text-xs text-slate-700">{sa.name}</span>
                      </div>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 uppercase">
                        {sa.status}
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

            {tab === 'rgs' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {resourceGroups.map(rg => (
                  <div key={rg.name} className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm flex items-center space-x-3.5">
                    <div className="bg-blue-600/10 border border-blue-500/25 rounded-xl p-2.5 text-blue-600">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block truncate max-w-[130px]">{rg.name}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">Location: {rg.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
