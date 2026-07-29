"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Cloud, RefreshCw, Folder, Server, Database, Play, AlertCircle, ShieldAlert, Cpu, HardDrive } from 'lucide-react';

interface Bucket {
  Name: string;
  CreationDate: string;
}

interface Instance {
  id: string;
  name: string;
  type: string;
  state: string;
  ip: string;
  zone: string;
}

interface DbInstance {
  name: string;
  class: string;
  engine: string;
  version: string;
  status: string;
  size: string;
}

interface AwsAppProps {
  initialSubPath?: string;
  onPathChange?: (subpath: string) => void;
}

export default function AwsApp({ initialSubPath = '', onPathChange }: AwsAppProps) {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [databases, setDatabases] = useState<DbInstance[]>([]);
  const [connected, setConnected] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tabs mapping
  const [activeTab, setActiveTab] = useState<string>(initialSubPath || 'ec2');

  const tabs = [
    { id: 'ec2', name: 'EC2 Instances' },
    { id: 's3', name: 'S3 Buckets' },
    { id: 'rds', name: 'RDS Databases' },
    { id: 'lambda', name: 'Lambda Functions' },
    { id: 'vpc', name: 'VPCs & Subnets' },
    { id: 'iam', name: 'IAM Security' },
    { id: 'cloudwatch', name: 'CloudWatch Alarms' },
    { id: 'billing', name: 'Billing Reports' },
  ];

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s3, ec2, rds] = await Promise.all([
        apiRequest('/aws/s3'),
        apiRequest('/aws/ec2'),
        apiRequest('/aws/rds'),
      ]);
      setBuckets(s3);
      setInstances(ec2);
      setDatabases(rds);
      setConnected(true);
    } catch (err: any) {
      console.warn('Backend server unreachable. Using fallback offline simulation mode.', err);
      setError('Backend is unavailable. Please start the backend server.');
      setBuckets([
        { Name: 'caelum-production-static', CreationDate: new Date().toISOString() },
        { Name: 'caelum-user-backups', CreationDate: new Date().toISOString() },
        { Name: 'caelum-raw-logs-s3', CreationDate: new Date().toISOString() }
      ]);
      setInstances([
        { id: 'i-0a8b9c1d2e3f4g', name: 'caelum-api-gateway', type: 't3.medium', state: 'running', ip: '54.210.45.19', zone: 'us-east-1a' },
        { id: 'i-9f8e7d6c5b4a3c', name: 'caelum-worker-nodes', type: 't3.xlarge', state: 'running', ip: '3.90.12.87', zone: 'us-east-1b' }
      ]);
      setDatabases([
        { name: 'postgre-rds', class: 'db.r6g.large', engine: 'postgres', version: '15.4', status: 'available', size: '100 GB' }
      ]);
      setConnected(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    await fetchResources();
  };

  useEffect(() => {
    fetchResources();
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
    <div className="flex-grow flex bg-slate-50 text-slate-800 min-h-0 select-text font-sans h-full">
      {/* Side Navigation Bar */}
      <div className="w-1/4 bg-white border-r border-slate-200 p-3 space-y-4 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5 px-3 py-2 border-b border-slate-100 mb-3">
            <Cloud className="w-5 h-5 text-[#ff9900]" />
            <div>
              <span className="font-extrabold text-xs text-slate-800 block">AWS Manager</span>
              <span className={`text-[8px] uppercase font-bold font-mono ${error ? 'text-amber-600 font-extrabold animate-pulse' : 'text-green-500'}`}>
                {error ? 'Simulated Offline' : 'Connected'}
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
                    ? 'bg-[#ff9900]/10 text-[#ff9900]' 
                    : 'hover:bg-slate-100 text-slate-650'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={fetchResources}
          className="w-full py-1.5 border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800 text-[10px] font-bold rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Console</span>
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto p-5 min-h-0">
        {error && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-850 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-4.5 h-4.5 text-amber-600 flex-shrink-0" />
              <span className="font-semibold text-amber-900">Cloud not connected. Running in simulation mode.</span>
            </div>
            <button 
              onClick={fetchResources}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
            >
              Retry
            </button>
          </div>
        )}
        {activeTab === 'ec2' && (
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Instances list</h4>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {instances.map(ins => (
                <div key={ins.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Server className="w-4.5 h-4.5 text-indigo-500" />
                      <span className="font-extrabold text-xs text-slate-700">{ins.name}</span>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 uppercase font-mono">
                      {ins.state}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-medium">
                    <div>Instance ID: <span className="text-slate-700 font-bold font-mono">{ins.id}</span></div>
                    <div>Type: <span className="text-slate-700 font-bold font-mono">{ins.type}</span></div>
                    <div>IPv4: <span className="text-slate-700 font-bold font-mono">{ins.ip}</span></div>
                    <div>Zone: <span className="text-slate-700 font-bold font-mono">{ins.zone}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 's3' && (
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Buckets list</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {buckets.map(b => (
                <div key={b.Name} className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm flex items-center space-x-3.5">
                  <div className="bg-[#ff9900]/10 border border-[#ff9900]/25 rounded-xl p-2.5 text-[#ff9900]">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-800 block truncate max-w-[170px]">{b.Name}</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">Created: {new Date(b.CreationDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rds' && (
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Database nodes</h4>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {databases.map(db => (
                <div key={db.name} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Database className="w-5 h-5 text-amber-500" />
                      <span className="font-extrabold text-xs text-slate-700">{db.name}</span>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 uppercase font-mono">
                      {db.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-medium">
                    <div>Engine: <span className="text-slate-700 font-bold font-mono capitalize">{db.engine} v{db.version}</span></div>
                    <div>Class: <span className="text-slate-700 font-bold font-mono">{db.class}</span></div>
                    <div>Disk size: <span className="text-slate-700 font-bold font-mono">{db.size}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'lambda' && (
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Lambda Functions</h4>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[10px] font-bold text-slate-400">
                <span>Function Name</span>
                <span>Runtime</span>
                <span>Last Modified</span>
              </div>
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex justify-between items-center font-mono">
                  <span className="font-bold">caelum-api-authorizer</span>
                  <span>NodeJS 18.x</span>
                  <span>2 hours ago</span>
                </div>
                <div className="flex justify-between items-center font-mono">
                  <span className="font-bold">caelum-s3-image-resizer</span>
                  <span>Python 3.11</span>
                  <span>1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vpc' && (
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">VPCs & Subnets</h4>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center space-x-3 text-slate-800 border-b border-slate-100 pb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold text-xs">V</div>
                <div>
                  <span className="font-extrabold text-xs block">caelum-production-vpc</span>
                  <span className="text-[9px] font-mono text-slate-400">CIDR: 10.0.0.0/16</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-500 font-mono mt-2">
                <div>Public Subnet A: <span className="font-bold text-slate-700">10.0.1.0/24</span></div>
                <div>Private Subnet A: <span className="font-bold text-slate-700">10.0.10.0/24</span></div>
                <div>Public Subnet B: <span className="font-bold text-slate-700">10.0.2.0/24</span></div>
                <div>Private Subnet B: <span className="font-bold text-slate-700">10.0.20.0/24</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'iam' && (
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">IAM Policies</h4>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[10px] font-bold text-slate-400">
                <span>Role Name</span>
                <span>Permissions Boundary</span>
              </div>
              <div className="space-y-2.5 text-xs text-slate-700 font-mono">
                <div className="flex justify-between items-center">
                  <span className="font-bold">CaelumECSExecutionRole</span>
                  <span className="text-purple-600 font-bold">AWSReservedPolicy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">CaelumS3BackupRole</span>
                  <span className="text-purple-600 font-bold">CustomS3ReadOnly</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cloudwatch' && (
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">CloudWatch Alerts</h4>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center p-2.5 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex items-center space-x-2 text-red-600">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-xs font-bold font-mono">High-CPU-Utilization-Alarm</span>
                </div>
                <span className="text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded font-mono">ALARM</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-green-50 border border-green-100 rounded-xl">
                <div className="flex items-center space-x-2 text-green-600">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-xs font-bold font-mono">Database-Storage-Free-Space</span>
                </div>
                <span className="text-[9px] bg-green-600 text-white font-bold px-1.5 py-0.5 rounded font-mono">OK</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Cost Management</h4>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Current Month Spending:</span>
                <span className="text-sm font-extrabold text-slate-800 font-mono">$184.20</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-2">
                <span className="text-xs font-bold text-slate-500">Forecasted Charges:</span>
                <span className="text-sm font-extrabold text-slate-800 font-mono">$242.00</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
