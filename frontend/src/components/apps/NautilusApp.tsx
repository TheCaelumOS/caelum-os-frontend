"use client";

import React, { useState } from 'react';
import { Folder, FileCode, FileText, FileJson, ArrowLeft, ArrowRight, Search, ChevronRight, HardDrive, GitBranch, Binary, Globe } from 'lucide-react';

interface FileItem {
  name: string;
  type: 'folder' | 'json' | 'text' | 'tfstate' | 'code';
  size: string;
  modified: string;
}

export default function NautilusApp() {
  const [activeDir, setActiveDir] = useState<'s3' | 'github' | 'terraform'>('s3');
  const [searchVal, setSearchVal] = useState('');

  // S3 Buckets files list
  const s3Files: FileItem[] = [
    { name: "caelum-prod-assets-bucket", type: 'folder', size: '14 items', modified: '2 hours ago' },
    { name: "database-backups-replica-s3", type: 'folder', size: '256 items', modified: '1 day ago' },
    { name: "iam-policy-rules.json", type: 'json', size: '4.2 KB', modified: '3 hours ago' },
    { name: "cdn-cache-settings.xml", type: 'code', size: '2.1 KB', modified: '12 mins ago' }
  ];

  // GitHub Repos files list
  const githubFiles: FileItem[] = [
    { name: "caelum-ai-kernel", type: 'folder', size: '84 files', modified: 'Just now' },
    { name: "infrastructure-as-code-tf", type: 'folder', size: '12 files', modified: '3 hours ago' },
    { name: "README.md", type: 'text', size: '1.4 KB', modified: 'Yesterday' },
    { name: "package.json", type: 'json', size: '1.8 KB', modified: 'Yesterday' }
  ];

  // Terraform States files list
  const tfFiles: FileItem[] = [
    { name: "production-vpc.tfstate", type: 'tfstate', size: '452 KB', modified: '1 hour ago' },
    { name: "ecs-fargate-cluster.tfstate", type: 'tfstate', size: '185 KB', modified: '10 mins ago' },
    { name: "secrets-key-vault.tfstate", type: 'tfstate', size: '12 KB', modified: '3 hours ago' },
    { name: "variables.tf", type: 'code', size: '1.5 KB', modified: '5 mins ago' }
  ];

  const getFiles = () => {
    if (activeDir === 's3') return s3Files;
    if (activeDir === 'github') return githubFiles;
    return tfFiles;
  };

  const getPath = () => {
    if (activeDir === 's3') return 'Home > S3 Buckets';
    if (activeDir === 'github') return 'Home > GitHub Repos';
    return 'Home > Terraform States';
  };

  const getIcon = (type: string) => {
    if (type === 'folder') return <Folder className="w-10 h-10 text-orange-500 fill-orange-500/10" />;
    if (type === 'json') return <FileJson className="w-10 h-10 text-indigo-400" />;
    if (type === 'text') return <FileText className="w-10 h-10 text-slate-400" />;
    if (type === 'tfstate') return <Binary className="w-10 h-10 text-purple-400" />;
    return <FileCode className="w-10 h-10 text-amber-500" />;
  };

  const filteredFiles = getFiles().filter(file => 
    file.name.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-[#eae6df] text-slate-800 font-sans h-full select-none">
      
      {/* 1. Nautilus Toolbar Header */}
      <div className="h-10 bg-[#eae6df] border-b border-[#c1beb5] px-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3 text-slate-600">
          {/* Navigation Arrows */}
          <div className="flex items-center space-x-1">
            <button className="p-1 rounded hover:bg-slate-300/60 cursor-pointer"><ArrowLeft className="w-4 h-4" /></button>
            <button className="p-1 rounded hover:bg-slate-300/60 cursor-pointer"><ArrowRight className="w-4 h-4" /></button>
          </div>

          {/* Folder Path Trail */}
          <div className="flex items-center space-x-1 text-xs text-slate-600 font-bold bg-[#dfdbd2] border border-[#c1beb5] px-2.5 py-1 rounded-md shadow-sm">
            <span>{getPath()}</span>
          </div>
        </div>

        {/* Right Search Input */}
        <div className="bg-[#dfdbd2] border border-[#c1beb5] rounded-md px-2.5 py-1 flex items-center space-x-1.5 text-xs w-44">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search folders..."
            className="bg-transparent outline-none w-full text-slate-700"
          />
        </div>
      </div>

      {/* 2. Left Sidebar & File Grid Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Nautilus Left Sidebar */}
        <div className="w-48 bg-[#eae6df] border-r border-[#c1beb5] p-2 flex flex-col space-y-1 select-none flex-shrink-0 text-xs">
          
          <span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest px-3.5 mb-1.5">Asset Explorer</span>
          
          <button
            onClick={() => setActiveDir('s3')}
            className={`px-3.5 py-2 rounded-lg flex items-center space-x-2 text-left font-bold cursor-pointer ${
              activeDir === 's3'
                ? 'bg-[#e95420] text-white shadow-md'
                : 'text-slate-700 hover:bg-[#dfdbd2]'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>S3 Buckets</span>
          </button>

          <button
            onClick={() => setActiveDir('github')}
            className={`px-3.5 py-2 rounded-lg flex items-center space-x-2 text-left font-bold cursor-pointer ${
              activeDir === 'github'
                ? 'bg-[#e95420] text-white shadow-md'
                : 'text-slate-700 hover:bg-[#dfdbd2]'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>GitHub Repos</span>
          </button>

          <button
            onClick={() => setActiveDir('terraform')}
            className={`px-3.5 py-2 rounded-lg flex items-center space-x-2 text-left font-bold cursor-pointer ${
              activeDir === 'terraform'
                ? 'bg-[#e95420] text-white shadow-md'
                : 'text-slate-700 hover:bg-[#dfdbd2]'
            }`}
          >
            <Binary className="w-4 h-4" />
            <span>Terraform States</span>
          </button>

          <div className="h-[1px] bg-slate-300 my-2" />
          
          <div className="px-3.5 py-2 text-[10px] text-slate-400 space-y-1 select-none leading-none">
            <div>Root node storage:</div>
            <div className="font-mono text-[9px] text-slate-500 font-bold mt-1">12.4 GB / 120 GB</div>
          </div>
        </div>

        {/* File Explorer Content Grid */}
        <div className="flex-1 bg-white p-4 overflow-y-auto">
          {filteredFiles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {filteredFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-[#f0f0f0] border border-transparent hover:border-[#c1beb5]/40 transition-all text-center select-text cursor-pointer group"
                >
                  <div className="group-hover:scale-105 transition-transform duration-200 mb-2">
                    {getIcon(file.type)}
                  </div>
                  <span className="text-xs font-bold text-slate-800 break-all px-1">
                    {file.name}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1">
                    {file.size}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <span className="text-xl">📁</span>
              <span className="text-xs font-bold mt-2">No matching files found</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
