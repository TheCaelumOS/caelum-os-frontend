"use client";

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, Shield, ChevronDown, Cpu, Server, HardDrive, Network } from 'lucide-react';

export default function BrowserApp() {
  const [activeTab, setActiveTab] = useState<'aws' | 'docs'>('aws');
  const [urlInput, setUrlInput] = useState('https://console.aws.amazon.com/ec2/home?region=us-east-1');

  const handleTabChange = (tab: 'aws' | 'docs') => {
    setActiveTab(tab);
    if (tab === 'aws') {
      setUrlInput('https://console.aws.amazon.com/ec2/home?region=us-east-1');
    } else {
      setUrlInput('https://docs.caelum-os.internal/architecture/overview');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f0f0f0] text-slate-800 font-sans h-full select-none">
      
      {/* 1. Browser Navigation & Tabs Header */}
      <div className="bg-[#dfdbd2] border-b border-[#c1beb5] px-3 pt-2 flex flex-col space-y-1.5">
        {/* Tabs Bar */}
        <div className="flex items-center space-x-1 text-xs">
          <button
            onClick={() => handleTabChange('aws')}
            className={`px-4 py-1.5 rounded-t-lg font-medium flex items-center space-x-1.5 border-t border-x transition-colors cursor-pointer ${
              activeTab === 'aws'
                ? 'bg-[#eae6df] border-[#c1beb5] text-slate-800 font-bold'
                : 'bg-[#cfcbc2]/50 border-transparent text-slate-600 hover:bg-[#cfcbc2]'
            }`}
          >
            {/* AWS Small Logo */}
            <svg viewBox="0 0 32 32" className="w-3.5 h-3.5 flex-shrink-0">
              <path fill="#FF9900" d="M25 21.2c-3.1 2.2-7.5 3.3-11.8 3.3-6 0-11-2.2-13.8-5.6-.4-.5 0-1.1.5-.8 4.3 2.3 9.6 3.6 15 3.6 4.4 0 9.2-.9 12.6-2.8.7-.4 1.1.3.4.8z"/>
              <path fill="#FF9900" d="M26 19.4c-.3-.4-1.1-.1-1.5.1-.4.3-.3 1.1.1 1.4.7.4 1.5 1 1.6.4.3-.4-.9-1.5-.9-1.9z"/>
            </svg>
            <span>AWS Console</span>
          </button>

          <button
            onClick={() => handleTabChange('docs')}
            className={`px-4 py-1.5 rounded-t-lg font-medium flex items-center space-x-1.5 border-t border-x transition-colors cursor-pointer ${
              activeTab === 'docs'
                ? 'bg-[#eae6df] border-[#c1beb5] text-slate-800 font-bold'
                : 'bg-[#cfcbc2]/50 border-transparent text-slate-600 hover:bg-[#cfcbc2]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>CaelumOS Docs</span>
          </button>
        </div>

        {/* Navigation / Address Bar */}
        <div className="flex items-center space-x-2 pb-2">
          {/* Navigation Controls */}
          <div className="flex items-center space-x-1 text-slate-600">
            <button className="p-1 rounded hover:bg-slate-350/50 cursor-pointer"><ArrowLeft className="w-4 h-4" /></button>
            <button className="p-1 rounded hover:bg-slate-350/50 cursor-pointer"><ArrowRight className="w-4 h-4" /></button>
            <button className="p-1 rounded hover:bg-slate-350/50 cursor-pointer"><RotateCw className="w-3.5 h-3.5" /></button>
            <button className="p-1 rounded hover:bg-slate-350/50 cursor-pointer"><Home className="w-3.5 h-3.5" /></button>
          </div>

          {/* URL Input Box */}
          <div className="flex-1 bg-white border border-[#c1beb5] rounded-md px-3 py-1 flex items-center space-x-2 text-xs shadow-inner">
            <span className="text-emerald-600 font-semibold select-none">🔒</span>
            <input
              type="text"
              readOnly
              value={urlInput}
              className="flex-1 bg-transparent outline-none text-slate-700 w-full"
            />
          </div>
        </div>
      </div>

      {/* 2. Web Body Area */}
      <div className="flex-1 bg-white overflow-hidden flex flex-col">
        {activeTab === 'aws' ? (
          
          /* AWS MANAGEMENT CONSOLE MOCKUP */
          <div className="flex-1 flex flex-col overflow-hidden text-xs text-slate-800 select-text">
            {/* Top AWS Menu Banner */}
            <div className="h-9 bg-[#232f3e] text-white flex items-center justify-between px-3 select-none flex-shrink-0">
              <div className="flex items-center space-x-4">
                {/* AWS Icon */}
                <span className="font-extrabold text-[13px] tracking-tight flex items-center space-x-1">
                  <span className="text-orange-400">aws</span>
                  <span className="text-white/60 font-light text-[10px] ml-1">console</span>
                </span>
                {/* Search Bar */}
                <div className="bg-[#1f2d3d] border border-slate-600 rounded-md px-2.5 py-0.5 flex items-center space-x-2 text-[10px] w-64">
                  <Search className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-400">Search Services...</span>
                </div>
              </div>

              {/* AWS Session info */}
              <div className="flex items-center space-x-3 text-[10px] text-slate-300">
                <span className="hover:text-white cursor-pointer flex items-center">
                  <span>N. Virginia</span>
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                </span>
                <span className="h-3 w-[1px] bg-slate-600" />
                <span className="font-semibold text-slate-100">CaelumOS-Core (1284-9024)</span>
              </div>
            </div>

            {/* AWS Workspace Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* AWS Left Sidebar */}
              <div className="w-44 bg-[#f2f2f2] border-r border-slate-200 flex flex-col p-2.5 space-y-1.5 select-none flex-shrink-0">
                <span className="font-bold text-[10px] text-slate-500 uppercase tracking-widest px-2 mb-1.5">EC2 Dashboard</span>
                <span className="px-2 py-1 bg-slate-300/40 rounded font-semibold text-slate-900 border-l-2 border-orange-500">EC2 Home</span>
                <span className="px-2 py-1 hover:bg-slate-200 rounded text-slate-700 cursor-pointer">Instances (Running)</span>
                <span className="px-2 py-1 hover:bg-slate-200 rounded text-slate-700 cursor-pointer">Security Groups</span>
                <span className="px-2 py-1 hover:bg-slate-200 rounded text-slate-700 cursor-pointer">Load Balancers</span>
                <span className="px-2 py-1 hover:bg-slate-200 rounded text-slate-700 cursor-pointer">Target Groups</span>
              </div>

              {/* AWS Main Dashboard Portal */}
              <div className="flex-1 p-5 overflow-y-auto bg-slate-50 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h2 className="text-sm font-bold text-slate-900">EC2 Resource Summary (us-east-1)</h2>
                  <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase">
                    All Services Operational
                  </span>
                </div>

                {/* AWS Resources grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Running Instances</span>
                      <Server className="w-4 h-4 text-orange-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-950">3 / 4</p>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                      Healthy
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Volume Snapshots</span>
                      <HardDrive className="w-4 h-4 text-orange-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-950">12</p>
                    <span className="text-[9px] text-slate-400">AWS-GP3 Storage</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Security Groups</span>
                      <Shield className="w-4 h-4 text-orange-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-950">5 Active</p>
                    <span className="text-[9px] text-purple-600 font-semibold uppercase">IAM Guard Active</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Elastic Load Balancers</span>
                      <Network className="w-4 h-4 text-orange-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-950">1 Online</p>
                    <span className="text-[9px] text-emerald-600 font-semibold uppercase flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                      ALB Active
                    </span>
                  </div>
                </div>

                {/* Alarm health */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900">CloudWatch Alarms Active</h4>
                    <p className="text-slate-500 text-[11px]">No active metrics alarms currently violating configuration thresholds.</p>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200 font-bold">
                    0 ALARMS
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          
          /* CAELUM OS DOCUMENTATION MOCKUP */
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50 text-slate-800 leading-relaxed max-w-3xl mx-auto space-y-6 select-text text-[11px] sm:text-xs">
            <div className="border-b border-slate-200 pb-3 space-y-1">
              <span className="text-purple-600 font-bold uppercase tracking-wider text-[9px]">CaelumOS Core Architecture</span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-950">AI Orchestrator Overview</h1>
            </div>

            <div className="space-y-3.5">
              <p>
                Welcome to the official internal documentation for <strong>CaelumOS</strong>: the specialized Web Desktop Operating System configured specifically to manage massive, multi-cloud clusters and AI agent deployment pipelines.
              </p>
              
              <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-xl p-4 space-y-1 text-slate-700">
                <h4 className="font-bold text-purple-950 text-xs">Core Paradigm</h4>
                <p className="text-[10px]">
                  CaelumOS replaces complex infrastructure dashboard navigation with a unified Web Desktop interface, wrapping interactive shells (AI Terminal) and Terraform metrics directly inside lightweight Gnome window frames.
                </p>
              </div>

              <h3 className="text-xs font-bold text-slate-950 pt-2 border-b border-slate-100 pb-1 flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 text-purple-600" />
                <span>AI Terminal Integration Protocol</span>
              </h3>
              <p>
                Every deployment command issued inside the AI Terminal (e.g. <code>deploy AWS microservice cluster</code>) triggers a background task query mapping to CaelumOS state. The AI core interprets the prompt, designs infrastructure configs, and streams compiling Terraform scripts directly on your screen.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
