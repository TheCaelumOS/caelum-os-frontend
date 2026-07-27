"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Folder, FileCode, FileText, FileJson, ArrowLeft, ArrowRight, Search, ChevronRight, HardDrive, RefreshCw, AlertCircle, Plus, Trash2, Edit } from 'lucide-react';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: string;
}

export default function NautilusApp() {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [history, setHistory] = useState<string[]>(['/']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchVal, setSearchVal] = useState<string>('');

  const fetchFiles = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`/filesystem/list?path=${encodeURIComponent(path)}`);
      setFiles(data);
    } catch (e: any) {
      console.error(e);
      setError('Unable to access sandbox filesystem.');
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(path);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      setHistoryIndex(idx);
      setCurrentPath(history[idx]);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      setHistoryIndex(idx);
      setCurrentPath(history[idx]);
    }
  };

  const handleMkdir = async () => {
    const name = prompt('Enter new folder name:');
    if (!name) return;
    try {
      const folderPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
      await apiRequest('/filesystem/mkdir', {
        method: 'POST',
        body: JSON.stringify({ path: folderPath }),
      });
      fetchFiles(currentPath);
    } catch (e: any) {
      alert(`Failed to create directory: ${e.message}`);
    }
  };

  const handleDelete = async (itemPath: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await apiRequest('/filesystem/delete', {
        method: 'POST',
        body: JSON.stringify({ path: itemPath }),
      });
      fetchFiles(currentPath);
    } catch (e: any) {
      alert(`Failed to delete: ${e.message}`);
    }
  };

  const handleRename = async (itemPath: string, oldName: string) => {
    const newName = prompt('Enter new name:', oldName);
    if (!newName || newName === oldName) return;
    try {
      const parts = itemPath.split('/');
      parts[parts.length - 1] = newName;
      const destination = parts.join('/');
      await apiRequest('/filesystem/move', {
        method: 'POST',
        body: JSON.stringify({ path: itemPath, destination }),
      });
      fetchFiles(currentPath);
    } catch (e: any) {
      alert(`Failed to rename: ${e.message}`);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const getIcon = (item: FileItem) => {
    if (item.isDirectory) return <Folder className="w-10 h-10 text-orange-500 fill-orange-500/10" />;
    const ext = item.name.split('.').pop()?.toLowerCase();
    if (ext === 'json') return <FileJson className="w-10 h-10 text-indigo-450" />;
    if (ext === 'tfstate') return <FileCode className="w-10 h-10 text-purple-500" />;
    if (ext === 'md' || ext === 'txt') return <FileText className="w-10 h-10 text-slate-500" />;
    return <FileCode className="w-10 h-10 text-amber-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-[#eae6df] text-slate-800 font-sans h-full select-none">
      {/* 1. Nautilus Toolbar Header */}
      <div className="h-11 bg-[#eae6df] border-b border-[#c1beb5] px-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3 text-slate-600 flex-1">
          {/* Navigation Arrows */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button 
              onClick={handleBack}
              disabled={historyIndex === 0}
              className="p-1 rounded hover:bg-slate-350/60 disabled:opacity-20 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleForward}
              disabled={historyIndex === history.length - 1}
              className="p-1 rounded hover:bg-slate-350/60 disabled:opacity-20 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Folder Path Trail */}
          <div className="flex items-center space-x-1 text-xs text-slate-600 font-bold bg-[#dfdbd2] border border-[#c1beb5] px-2.5 py-1 rounded-md shadow-sm truncate max-w-md">
            <span>{currentPath}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <button 
              onClick={handleMkdir}
              className="p-1.5 rounded hover:bg-slate-350/60 text-slate-700 cursor-pointer"
              title="Create New Folder"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => fetchFiles(currentPath)}
              className="p-1.5 rounded hover:bg-slate-350/60 text-slate-700 cursor-pointer"
              title="Refresh Files"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search Input bar */}
        <div className="relative w-44 sm:w-56 flex-shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search directory..."
            className="w-full bg-[#f4f2ee] border border-[#c1beb5] rounded-md pl-8 pr-2.5 py-1 text-xs outline-none focus:border-slate-500 focus:bg-white text-slate-800"
          />
        </div>
      </div>

      {/* 2. Main Files Grid Workspace */}
      <div className="flex-grow flex min-h-0">
        {/* Left Sidebar Locations list */}
        <div className="w-1/4 bg-[#f4f2ee] border-r border-[#c1beb5] p-3 space-y-4 flex-shrink-0">
          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">System Locations</span>
          <div className="space-y-1 text-xs text-slate-700">
            <button
              onClick={() => navigateTo('/')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg font-bold cursor-pointer transition-colors ${
                currentPath === '/' ? 'bg-[#c9c5ba] text-slate-900' : 'hover:bg-slate-300/40'
              }`}
            >
              <HardDrive className="w-4.5 h-4.5 text-slate-500" />
              <span>Root Sandbox</span>
            </button>
            <button
              onClick={() => navigateTo('/GitHub Repos')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg font-bold cursor-pointer transition-colors ${
                currentPath === '/GitHub Repos' ? 'bg-[#c9c5ba] text-slate-900' : 'hover:bg-slate-300/40'
              }`}
            >
              <HardDrive className="w-4.5 h-4.5 text-slate-500" />
              <span>GitHub Repos</span>
            </button>
            <button
              onClick={() => navigateTo('/S3 Buckets')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg font-bold cursor-pointer transition-colors ${
                currentPath === '/S3 Buckets' ? 'bg-[#c9c5ba] text-slate-900' : 'hover:bg-slate-300/40'
              }`}
            >
              <HardDrive className="w-4.5 h-4.5 text-slate-500" />
              <span>S3 Buckets</span>
            </button>
            <button
              onClick={() => navigateTo('/Terraform States')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg font-bold cursor-pointer transition-colors ${
                currentPath === '/Terraform States' ? 'bg-[#c9c5ba] text-slate-900' : 'hover:bg-slate-300/40'
              }`}
            >
              <HardDrive className="w-4.5 h-4.5 text-slate-500" />
              <span>Terraform States</span>
            </button>
          </div>
        </div>

        {/* Right workspace view */}
        <div className="flex-grow bg-[#fcfbfa] overflow-y-auto p-5 select-text">
          {error ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <div className="space-y-1">
                <span className="font-bold text-xs text-slate-700 block">Filesystem Error</span>
                <span className="text-[10px] text-slate-400 block">{error}</span>
              </div>
              <button
                onClick={() => fetchFiles(currentPath)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer border border-[#c1beb5]"
              >
                Retry
              </button>
            </div>
          ) : loading && files.length === 0 ? (
            <div className="text-center py-20 text-xs text-slate-400 font-bold">Accessing sandbox...</div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-20 text-xs text-slate-400 font-bold">This folder is empty.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
              {filteredFiles.map(file => (
                <div
                  key={file.path}
                  onDoubleClick={() => file.isDirectory ? navigateTo(file.path) : null}
                  className="flex flex-col items-center p-3 rounded-2xl border border-transparent hover:bg-slate-200/40 hover:border-slate-300/50 transition-all text-center group relative"
                >
                  <div className="mb-2.5 group-hover:scale-105 transition-transform">
                    {getIcon(file)}
                  </div>
                  <span className="text-xs font-bold text-slate-700 tracking-tight break-all max-w-[95px] line-clamp-2">
                    {file.name}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1 font-mono leading-none">
                    {file.isDirectory ? 'Folder' : formatSize(file.size)}
                  </span>

                  {/* Actions buttons shown on hover */}
                  <div className="absolute right-1 top-1 bg-white border border-[#c1beb5] rounded-lg shadow-sm flex items-center divide-x divide-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleRename(file.path, file.name)}
                      className="p-1 hover:bg-slate-50 cursor-pointer text-slate-650"
                      title="Rename"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(file.path)}
                      className="p-1 hover:bg-red-50 text-red-650 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
