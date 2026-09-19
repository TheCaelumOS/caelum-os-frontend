'use client';

import React from 'react';
import { 
  Cloud, 
  Server, 
  HardDrive, 
  Network, 
  Database, 
  Key, 
  AppWindow, 
  CheckCircle2, 
  ShieldCheck,
  Lock,
  ArrowRight
} from 'lucide-react';
import { AzureLogo, AwsLogo } from './Logos';

export default function CloudProvidersSection() {
  const azureResources = [
    { name: "Virtual Machines (Compute)", desc: "ARM compute instances, hardware sizes, and real-time power states." },
    { name: "Resource Groups", desc: "Hierarchy tree and multi-region geographic distribution." },
    { name: "Storage Accounts & Blobs", desc: "Storage containers, access tiers, and redundancy tracking." },
    { name: "Virtual Networks & NSGs", desc: "Address spaces, subnet mappings, security group rules, and public IPs." },
    { name: "App Services & ACR", desc: "Web app deployments, default hostnames, and Azure Container Registries." },
    { name: "SQL Databases & Key Vaults", desc: "Managed SQL server inventory and Key Vault secret containers." }
  ];

  const awsResources = [
    { name: "EC2 Elastic Compute", desc: "Instance types, public/private IP addresses, state transitions, and regions." },
    { name: "S3 Object Storage", desc: "Buckets discovery, creation timestamps, and storage status." },
    { name: "RDS Relational Databases", desc: "PostgreSQL, MySQL, and Aurora database engines and endpoints." },
    { name: "AWS STS Identity", desc: "Caller identity resolution, Account ID, and ARN verification." }
  ];

  return (
    <section id="cloud-providers" className="py-24 bg-white border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider">
            <Cloud className="w-3.5 h-3.5 text-blue-600" />
            <span>Multi-Cloud Telemetry</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            AWS + Azure Integration
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Direct, authenticated cloud provider clients powered by official SDKs. Inspect infrastructure across both hyperscalers without navigating multiple browser portals.
          </p>
        </div>

        {/* Cloud Providers Grid */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Azure Panel */}
          <div className="p-8 rounded-2xl bg-slate-50/70 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-[#0078d4]/10 border border-[#0078d4]/20 text-[#0078d4]">
                  <AzureLogo className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-mono">Microsoft Azure ARM Client</h3>
                  <span className="text-xs text-slate-500 font-mono">SDK: @azure/arm-* (11 Resource Types)</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                Live SDK
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Connects directly via Service Principal (<code className="text-slate-800 font-mono font-semibold">ClientSecretCredential</code>) or your local Azure CLI developer profile (<code className="text-slate-800 font-mono font-semibold">DefaultAzureCredential</code>) to inspect live Azure infrastructure.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {azureResources.map((res) => (
                <div key={res.name} className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-900 block font-mono">{res.name}</span>
                  <span className="text-[11px] text-slate-500 leading-snug block">{res.desc}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-200">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-blue-600" /> AES-256 Encrypted Credentials</span>
              <span>NestJS Backend Managed</span>
            </div>
          </div>

          {/* AWS Panel */}
          <div className="p-8 rounded-2xl bg-slate-50/70 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-[#232f3e]/10 border border-[#232f3e]/20 text-[#232f3e]">
                  <AwsLogo className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-mono">Amazon Web Services v3 Client</h3>
                  <span className="text-xs text-slate-500 font-mono">SDK: @aws-sdk/client-*</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                Live SDK
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Authenticates using AWS Access Key / Secret Key pairs or STS session tokens, communicating with AWS REST endpoints to provide real-time compute, storage, and database inventory.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {awsResources.map((res) => (
                <div key={res.name} className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-900 block font-mono">{res.name}</span>
                  <span className="text-[11px] text-slate-500 leading-snug block">{res.desc}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-200">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-blue-600" /> STS Identity Verification</span>
              <span>NestJS Backend Managed</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}