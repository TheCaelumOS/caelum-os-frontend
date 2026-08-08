"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Cloud, RefreshCw, Folder, Server, Database, Play, AlertCircle, ShieldAlert, Cpu, HardDrive, Network, Key, Landmark, Activity, CreditCard, LogOut, CheckCircle } from 'lucide-react';

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

interface LambdaFunction {
  name: string;
  runtime: string;
  handler: string;
  codeSize: string;
  lastModified: string;
}

interface Vpc {
  id: string;
  cidrBlock: string;
  state: string;
  name: string;
}

interface Subnet {
  id: string;
  vpcId: string;
  cidrBlock: string;
  state: string;
  name: string;
  zone: string;
}

interface SecurityGroup {
  id: string;
  name: string;
  vpcId: string;
  description: string;
}

interface IamUser {
  username: string;
  userId: string;
  arn: string;
  createDate: string;
}

interface CloudWatchAlarm {
  name: string;
  state: string;
  metric: string;
  namespace: string;
  threshold: number;
}

interface BillingReport {
  start: string;
  end: string;
  amount: string;
  unit: string;
}

interface AwsAppProps {
  initialSubPath?: string;
  onPathChange?: (subpath: string) => void;
}

export default function AwsApp({ initialSubPath = '', onPathChange }: AwsAppProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Never');

  // Connection metadata
  const [accountId, setAccountId] = useState<string>('');
  const [connectedRegion, setConnectedRegion] = useState<string>('');
  const [authType, setAuthType] = useState<string>('');

  // Resource lists
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [databases, setDatabases] = useState<DbInstance[]>([]);
  const [lambdas, setLambdas] = useState<LambdaFunction[]>([]);
  const [vpcs, setVpcs] = useState<Vpc[]>([]);
  const [subnets, setSubnets] = useState<Subnet[]>([]);
  const [securityGroups, setSecurityGroups] = useState<SecurityGroup[]>([]);
  const [iamUsers, setIamUsers] = useState<IamUser[]>([]);
  const [alarms, setAlarms] = useState<CloudWatchAlarm[]>([]);
  const [billing, setBilling] = useState<BillingReport[]>([]);

  // Wizard form states
  const [authMethod, setAuthMethod] = useState<'cli' | 'iamUser'>('cli');
  const [accessKeyId, setAccessKeyId] = useState<string>('');
  const [secretAccessKey, setSecretAccessKey] = useState<string>('');
  const [region, setRegion] = useState<string>('us-east-1');
  const [connectLoading, setConnectLoading] = useState<boolean>(false);

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

  const fetchResources = async (isOnLoad = false) => {
    setLoading(true);
    if (isOnLoad) {
      setError(null);
    }

    try {
      const health = await apiRequest('/aws/health');
      if (health && health.connected) {
        setConnected(true);
        setAccountId(health.accountId);
        setConnectedRegion(health.region);
        setAuthType(health.authentication);
        setError(null);

        const [
          ec2Data,
          s3Data,
          rdsData,
          lambdaData,
          vpcData,
          subnetData,
          sgData,
          iamData,
          cwData,
          billData
        ] = await Promise.all([
          apiRequest('/aws/ec2'),
          apiRequest('/aws/s3'),
          apiRequest('/aws/rds'),
          apiRequest('/aws/lambda'),
          apiRequest('/aws/vpc'),
          apiRequest('/aws/subnets'),
          apiRequest('/aws/security-groups'),
          apiRequest('/aws/iam'),
          apiRequest('/aws/cloudwatch'),
          apiRequest('/aws/billing')
        ]);

        setInstances(ec2Data || []);
        setBuckets(s3Data || []);
        setDatabases(rdsData || []);
        setLambdas(lambdaData || []);
        setVpcs(vpcData || []);
        setSubnets(subnetData || []);
        setSecurityGroups(sgData || []);
        setIamUsers(iamData || []);
        setAlarms(cwData || []);
        setBilling(billData || []);
        setLastRefreshed(new Date().toLocaleTimeString());
      } else {
        setConnected(false);
        if (!isOnLoad) {
          setError(health?.reason || 'AWS account not connected.');
        }
        clearAllData();
      }
    } catch (e: any) {
      setConnected(false);
      if (!isOnLoad) {
        setError('Connection failed. Please verify that the backend is active.');
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
      const res = await apiRequest('/aws/connect', {
        method: 'POST',
        body: JSON.stringify({
          authMethod,
          accessKeyId: authMethod === 'iamUser' ? accessKeyId : undefined,
          secretAccessKey: authMethod === 'iamUser' ? secretAccessKey : undefined,
          region: region || 'us-east-1'
        })
      });

      if (res && res.connected) {
        setConnected(true);
        await fetchResources();
      } else {
        setError(res?.message || 'Authentication failed. Please verify Access Key credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'AWS Connection attempt failed.');
    } finally {
      setConnectLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await apiRequest('/aws/disconnect', { method: 'POST' });
      setConnected(false);
      clearAllData();
    } catch (err: any) {
      setError('Failed to disconnect AWS account.');
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = () => {
    setBuckets([]);
    setInstances([]);
    setDatabases([]);
    setLambdas([]);
    setVpcs([]);
    setSubnets([]);
    setSecurityGroups([]);
    setIamUsers([]);
    setAlarms([]);
    setBilling([]);
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
    <div className="flex-grow flex bg-[#f5f7f8] text-slate-800 min-h-0 select-text font-sans h-full">
      {/* Side Navigation Bar */}
      <div className="w-1/4 bg-white border-r border-slate-200 p-3 space-y-4 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5 px-3 py-2 border-b border-slate-100 mb-3">
            <Cloud className="w-5 h-5 text-amber-500 animate-pulse" />
            <div>
              <span className="font-extrabold text-xs text-slate-800 block">AWS Console</span>
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
                      ? 'bg-amber-500/10 text-amber-600' 
                      : 'hover:bg-slate-100 text-slate-650'
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
                <span>Disconnect AWS</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-grow overflow-y-auto p-5 min-h-0 bg-[#f8fafc]">
        {loading && !connected ? (
          <div className="text-center py-20 text-xs text-slate-400 font-bold flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
            <span>Verifying AWS Account connection...</span>
          </div>
        ) : !connected ? (
          /* Connection Setup Wizard */
          <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center justify-center p-3 bg-amber-50 border border-amber-100 rounded-2xl text-amber-500">
                <Cloud className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-base text-slate-800">Connect AWS Account</h3>
              <p className="text-xs text-slate-450 px-4">
                Connect your account to access and list real S3 buckets, EC2 servers, RDS clusters, and VPCs.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-xs text-red-800 font-medium">
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
                    className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      authMethod === 'cli' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    AWS CLI (Dev)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMethod('iamUser')}
                    className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      authMethod === 'iamUser' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    IAM User Key
                  </button>
                </div>
              </div>

              {authMethod === 'cli' ? (
                <div className="bg-slate-50 border border-slate-150/60 rounded-2xl p-3.5 text-xs text-slate-500 space-y-2">
                  <p className="font-bold text-slate-700">AWS Shared Configuration (Default Credential Chain)</p>
                  <p>
                    Ensures connection to your local backend server session using the active AWS CLI credentials profile.
                  </p>
                  <p>
                    Ensure you have run <code className="bg-slate-200 px-1 py-0.5 rounded font-mono font-bold text-[10px]">aws configure</code> locally.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-450 uppercase block">Access Key ID</label>
                    <input
                      type="text"
                      required
                      value={accessKeyId}
                      onChange={(e) => setAccessKeyId(e.target.value)}
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-455 uppercase block">Secret Access Key</label>
                    <input
                      type="password"
                      required
                      value={secretAccessKey}
                      onChange={(e) => setSecretAccessKey(e.target.value)}
                      placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-450 uppercase block">Default Region</label>
                <input
                  type="text"
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="us-east-1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={connectLoading}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {connectLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Identity...</span>
                  </>
                ) : (
                  <span>Connect AWS Account</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Connected Live Dashboard */
          <>
            {/* Connection Status Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-xl border border-green-200/50 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">AWS Connection</span>
                  <span className="text-xs font-extrabold text-slate-800">Connected to Live Account ({authType})</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Account / Region</span>
                <span className="text-xs font-extrabold text-amber-600 block font-mono">{accountId} ({connectedRegion})</span>
              </div>
            </div>

            {/* Resources Counters / Metrics Card */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">EC2 Instances</span>
                  <span className="text-2xl font-extrabold text-slate-700 mt-1 block">{instances.length}</span>
                </div>
                <Server className="w-7 h-7 text-blue-500 bg-blue-50 p-1.5 rounded-xl" />
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">S3 Buckets</span>
                  <span className="text-2xl font-extrabold text-slate-700 mt-1 block">{buckets.length}</span>
                </div>
                <Folder className="w-7 h-7 text-amber-500 bg-amber-50 p-1.5 rounded-xl" />
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">RDS Databases</span>
                  <span className="text-2xl font-extrabold text-slate-700 mt-1 block">{databases.length}</span>
                </div>
                <Database className="w-7 h-7 text-indigo-500 bg-indigo-50 p-1.5 rounded-xl" />
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Lambdas</span>
                  <span className="text-2xl font-extrabold text-slate-700 mt-1 block">{lambdas.length}</span>
                </div>
                <Cpu className="w-7 h-7 text-purple-500 bg-purple-50 p-1.5 rounded-xl" />
              </div>
            </div>

            {activeTab === 'ec2' && (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">EC2 Server Instances</h4>
                {instances.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400 font-bold shadow-sm">
                    No resources found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {instances.map(ins => (
                      <div key={ins.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <Server className="w-5 h-5 text-amber-500" />
                            <span className="font-extrabold text-xs text-slate-700">{ins.name}</span>
                          </div>
                          <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${
                            ins.state === 'running' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {ins.state}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-medium">
                          <div>Type: <span className="text-slate-700 font-bold font-mono">{ins.type}</span></div>
                          <div>Zone: <span className="text-slate-700 font-bold font-mono">{ins.zone}</span></div>
                          <div>IP Address: <span className="text-slate-700 font-bold font-mono">{ins.ip}</span></div>
                          <div className="col-span-2 truncate">Instance ID: <span className="text-slate-655 font-bold font-mono text-[9px]">{ins.id}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 's3' && (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">S3 Storage Buckets</h4>
                {buckets.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400 font-bold shadow-sm">
                    No resources found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {buckets.map(b => (
                      <div key={b.Name} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center space-x-3.5">
                        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-2.5 text-amber-500">
                          <Folder className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 block truncate max-w-[200px]">{b.Name}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">Created: {new Date(b.CreationDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rds' && (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">RDS Database Clusters</h4>
                {databases.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400 font-bold shadow-sm">
                    No resources found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {databases.map(db => (
                      <div key={db.name} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <Database className="w-5 h-5 text-indigo-500" />
                            <span className="font-extrabold text-xs text-slate-700">{db.name}</span>
                          </div>
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 uppercase font-mono">
                            {db.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-medium">
                          <div>Class: <span className="text-slate-700 font-bold font-mono">{db.class}</span></div>
                          <div>Engine: <span className="text-slate-700 font-bold font-mono">{db.engine} (v{db.version})</span></div>
                          <div>Size: <span className="text-slate-700 font-bold font-mono">{db.size}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'lambda' && (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Lambda Serverless Functions</h4>
                {lambdas.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400 font-bold shadow-sm">
                    No resources found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {lambdas.map(fn => (
                      <div key={fn.name} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                        <div className="flex items-center space-x-2.5">
                          <Cpu className="w-5 h-5 text-purple-500" />
                          <span className="font-extrabold text-xs text-slate-700">{fn.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-medium">
                          <div>Runtime: <span className="text-slate-700 font-bold font-mono">{fn.runtime}</span></div>
                          <div>Size: <span className="text-slate-700 font-bold font-mono">{fn.codeSize}</span></div>
                          <div className="col-span-2 truncate">Handler: <span className="text-slate-655 font-bold font-mono">{fn.handler}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'vpc' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Virtual Private Clouds (VPC)</h4>
                  {vpcs.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400 font-bold shadow-sm">
                      No resources found
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {vpcs.map(vpc => (
                        <div key={vpc.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 font-mono text-xs">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <span className="font-bold text-slate-700">{vpc.name}</span>
                            <span className="text-slate-450 text-[10px]">CIDR Block: {vpc.cidrBlock}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                            <div>ID: <span className="font-bold text-slate-750">{vpc.id}</span></div>
                            <div>State: <span className="font-bold text-slate-750">{vpc.state}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Subnets</h4>
                    {subnets.length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400 font-bold shadow-sm">
                        No resources found
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                        {subnets.map(sub => (
                          <div key={sub.id} className="flex justify-between items-center text-xs font-mono border-b border-slate-50 pb-2 last:border-b-0 last:pb-0">
                            <div>
                              <span className="font-bold text-slate-700 block">{sub.name}</span>
                              <span className="text-[9px] text-slate-400">CIDR: {sub.cidrBlock} | VPC: {sub.vpcId}</span>
                            </div>
                            <span className="text-[9px] font-extrabold text-slate-500">{sub.zone}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Security Groups</h4>
                    {securityGroups.length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400 font-bold shadow-sm">
                        No resources found
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                        {securityGroups.map(sg => (
                          <div key={sg.id} className="flex justify-between items-center text-xs font-mono border-b border-slate-50 pb-2 last:border-b-0 last:pb-0">
                            <div>
                              <span className="font-bold text-slate-700 block">{sg.name}</span>
                              <span className="text-[9px] text-slate-400">ID: {sg.id} | VPC: {sg.vpcId}</span>
                            </div>
                            <span className="text-[9px] text-slate-400 truncate max-w-[120px]">{sg.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'iam' && (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">IAM Users & Access Security</h4>
                {iamUsers.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400 font-bold shadow-sm">
                    No resources found
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 font-mono text-xs">
                    {iamUsers.map(user => (
                      <div key={user.userId} className="flex flex-col space-y-1.5 border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-700 flex items-center"><Key className="w-3.5 h-3.5 mr-1.5 text-amber-500" /> {user.username}</span>
                          <span className="text-[9px] text-slate-450">Created: {new Date(user.createDate).toLocaleDateString()}</span>
                        </div>
                        <div className="text-[9px] text-slate-400 truncate">ARN: {user.arn}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cloudwatch' && (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">CloudWatch Metric Alarms</h4>
                {alarms.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400 font-bold shadow-sm">
                    No resources found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {alarms.map(alarm => (
                      <div key={alarm.name} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-xs text-slate-700 truncate max-w-[200px]">{alarm.name}</span>
                          <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded border ${
                            alarm.state === 'OK' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {alarm.state}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          <div>Metric: <span className="text-slate-700 font-bold font-mono">{alarm.metric}</span></div>
                          <div>Namespace: <span className="text-slate-700 font-bold font-mono">{alarm.namespace}</span></div>
                          <div>Threshold: <span className="text-slate-700 font-bold font-mono">&gt;= {alarm.threshold}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-4 font-sans">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Monthly Billing Details</h4>
                {billing.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400 font-bold shadow-sm">
                    No resources found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {billing.map((bill, index) => (
                      <div key={index} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[8px] text-slate-400 uppercase font-extrabold tracking-wider block">Reporting Period</span>
                          <span className="text-[10px] font-bold font-mono text-slate-600 block">{bill.start} to {bill.end}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] text-slate-400 uppercase font-extrabold tracking-wider block">Estimated Charge</span>
                          <span className="text-lg font-black text-slate-800 mt-0.5 block">${bill.amount} {bill.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
