"use client";

import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  FilePlus,
  FolderPlus,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit2,
  Upload,
  HardDrive,
} from 'lucide-react';
import { WorkspaceFile } from './types';

interface VSCodeExplorerProps {
  files: WorkspaceFile[];
  activeFileId?: string;
  workspaceName?: string;
  onSelectFile: (file: WorkspaceFile) => void;
  onCreateFile: (parentPath: string, name: string) => void;
  onCreateFolder: (parentPath: string, name: string) => void;
  onDeleteFile: (fileId: string) => void;
  onOpenLocalFolder?: () => void;
  onOpenSandbox?: () => void;
  onRefresh?: () => void;
}

function getFileIcon(fileName: string, language?: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) {
    return <span className="text-blue-400 font-bold text-[10px] w-4 text-center">TS</span>;
  }
  if (lower.endsWith('.js') || lower.endsWith('.jsx')) {
    return <span className="text-yellow-400 font-bold text-[10px] w-4 text-center">JS</span>;
  }
  if (lower.endsWith('.py')) {
    return <span className="text-sky-400 font-bold text-[10px] w-4 text-center">PY</span>;
  }
  if (lower.endsWith('.json')) {
    return <FileJson className="w-3.5 h-3.5 text-amber-400" />;
  }
  if (lower.endsWith('.md')) {
    return <FileText className="w-3.5 h-3.5 text-slate-300" />;
  }
  if (lower.endsWith('.yml') || lower.endsWith('.yaml')) {
    return <span className="text-red-400 font-bold text-[10px] w-4 text-center">YML</span>;
  }
  if (lower.endsWith('.tf') || lower.endsWith('.tfvars')) {
    return <span className="text-purple-400 font-bold text-[10px] w-4 text-center">TF</span>;
  }
  if (lower.includes('docker')) {
    return <span className="text-sky-400 font-bold text-[10px] w-4 text-center">🐳</span>;
  }
  return <FileCode className="w-3.5 h-3.5 text-neutral-400" />;
}

export default function VSCodeExplorer({
  files,
  activeFileId,
  workspaceName = 'CAELUMOS',
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
  onOpenLocalFolder,
  onOpenSandbox,
  onRefresh,
}: VSCodeExplorerProps) {
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [showNewFileInput, setShowNewFileInput] = useState<{ parentPath: string; isDir: boolean } | null>(null);
  const [newItemName, setNewItemName] = useState<string>('');

  const toggleFolder = (path: string) => {
    setCollapsedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !showNewFileInput) return;

    if (showNewFileInput.isDir) {
      onCreateFolder(showNewFileInput.parentPath, newItemName.trim());
    } else {
      onCreateFile(showNewFileInput.parentPath, newItemName.trim());
    }

    setNewItemName('');
    setShowNewFileInput(null);
  };

  const renderTree = (items: WorkspaceFile[], depth = 0) => {
    return items.map((item) => {
      const isDir = item.isDirectory;
      const isCollapsed = collapsedFolders[item.path];
      const isSelected = activeFileId === item.id;

      if (isDir) {
        return (
          <div key={item.id} className="select-none">
            <div
              onClick={() => toggleFolder(item.path)}
              className="flex items-center justify-between py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer group text-xs text-neutral-300"
              style={{ paddingLeft: `${depth * 14 + 8}px` }}
            >
              <div className="flex items-center space-x-1.5 truncate">
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                )}
                {isCollapsed ? (
                  <Folder className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                ) : (
                  <FolderOpen className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                )}
                <span className="truncate">{item.name}</span>
              </div>

              {/* Hover quick add inside folder */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 text-neutral-400">
                <button
                  type="button"
                  title="New File in Folder"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCollapsedFolders(prev => ({ ...prev, [item.path]: false }));
                    setShowNewFileInput({ parentPath: item.path, isDir: false });
                  }}
                  className="hover:text-white p-0.5"
                >
                  <FilePlus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Folder Children */}
            {!isCollapsed && item.children && (
              <div>{renderTree(item.children, depth + 1)}</div>
            )}
          </div>
        );
      }

      // File item
      return (
        <div
          key={item.id}
          onClick={() => onSelectFile(item)}
          className={`flex items-center justify-between py-1 px-2 cursor-pointer text-xs group select-none ${
            isSelected
              ? 'bg-[#37373d] text-white'
              : 'hover:bg-[#2a2d2e] text-neutral-300 hover:text-white'
          }`}
          style={{ paddingLeft: `${depth * 14 + 20}px` }}
        >
          <div className="flex items-center space-x-2 truncate">
            {getFileIcon(item.name, item.language)}
            <span className="truncate">{item.name}</span>
            {item.isModified && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 inline-block" />
            )}
          </div>

          <button
            type="button"
            title="Delete File"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete ${item.name}?`)) onDeleteFile(item.id);
            }}
            className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 p-0.5 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      );
    });
  };

  return (
    <div className="w-60 bg-[#1e1e1e] border-r border-[#2b2b2b] flex flex-col h-full select-none flex-shrink-0 text-slate-300">
      {/* Explorer Header */}
      <div className="px-3 py-2 border-b border-[#2b2b2b] flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-400">
        <span>Explorer</span>
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            title="New File (Root)"
            onClick={() => setShowNewFileInput({ parentPath: '/', isDir: false })}
            className="hover:text-white cursor-pointer p-0.5"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="New Folder (Root)"
            onClick={() => setShowNewFileInput({ parentPath: '/', isDir: true })}
            className="hover:text-white cursor-pointer p-0.5"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          {onRefresh && (
            <button
              type="button"
              title="Refresh Explorer"
              onClick={onRefresh}
              className="hover:text-white cursor-pointer p-0.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Workspace Section Header */}
      <div className="px-3 py-1.5 bg-[#252526] text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider flex items-center justify-between border-b border-[#2b2b2b]">
        <div className="flex items-center space-x-1 truncate">
          <ChevronDown className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{workspaceName}</span>
        </div>
      </div>

      {/* New File / Folder Input Form */}
      {showNewFileInput && (
        <form onSubmit={handleCreateSubmit} className="p-2 border-b border-[#2b2b2b] bg-[#252526]">
          <div className="flex items-center space-x-1.5">
            {showNewFileInput.isDir ? (
              <Folder className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <FileCode className="w-3.5 h-3.5 text-blue-400" />
            )}
            <input
              type="text"
              autoFocus
              placeholder={showNewFileInput.isDir ? 'Folder name...' : 'File name...'}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setShowNewFileInput(null);
              }}
              className="flex-1 px-1.5 py-0.5 bg-[#3c3c3c] border border-[#007acc] text-xs text-white outline-none rounded"
            />
          </div>
        </form>
      )}

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto py-1">
        {renderTree(files)}
      </div>

      {/* Workspace Quick Openers at Bottom */}
      <div className="p-2 border-t border-[#2b2b2b] bg-[#181818] space-y-1">
        {onOpenLocalFolder && (
          <button
            type="button"
            onClick={onOpenLocalFolder}
            className="w-full py-1.5 px-2.5 rounded bg-[#252526] hover:bg-[#2d2d2d] text-neutral-300 hover:text-white text-[11px] font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer border border-[#333]"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>Open Local Folder...</span>
          </button>
        )}

        {onOpenSandbox && (
          <button
            type="button"
            onClick={onOpenSandbox}
            className="w-full py-1.5 px-2.5 rounded bg-[#252526] hover:bg-[#2d2d2d] text-neutral-300 hover:text-white text-[11px] font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer border border-[#333]"
          >
            <HardDrive className="w-3.5 h-3.5 text-orange-400" />
            <span>Open CaelumOS Sandbox</span>
          </button>
        )}
      </div>
    </div>
  );
}
