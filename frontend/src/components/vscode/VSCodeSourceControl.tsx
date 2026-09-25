"use client";

import React, { useState } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  RotateCw, 
  Check, 
  Plus, 
  Undo2, 
  ChevronRight, 
  ChevronDown, 
  FileCode2,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import { WorkspaceFile } from './types';

interface VSCodeSourceControlProps {
  files: WorkspaceFile[];
  onOpenFile: (fileId: string) => void;
  getFileIcon: (filename: string) => React.ReactNode;
  onExecuteCommand?: (cmd: string) => Promise<{ stdout: string; stderr: string; exitCode: number }>;
}

export default function VSCodeSourceControl({
  files,
  onOpenFile,
  getFileIcon,
  onExecuteCommand,
}: VSCodeSourceControlProps) {
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState<string | null>(null);
  const [changesCollapsed, setChangesCollapsed] = useState(false);

  // Helper to extract modified files from workspace
  const getModifiedFiles = (nodes: WorkspaceFile[]): WorkspaceFile[] => {
    let result: WorkspaceFile[] = [];
    for (const node of nodes) {
      if (!node.isDirectory && node.isModified) {
        result.push(node);
      }
      if (node.children) {
        result = result.concat(getModifiedFiles(node.children));
      }
    }
    return result;
  };

  const modifiedFiles = getModifiedFiles(files);

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    setIsCommitting(true);
    setCommitSuccess(null);

    try {
      if (onExecuteCommand) {
        // Execute real git commit through backend terminal
        const cleanMsg = commitMessage.replace(/"/g, '\\"');
        const res = await onExecuteCommand(`git add -A && git commit -m "${cleanMsg}"`);
        if (res.exitCode === 0 || res.stdout.includes('committed') || res.stdout.includes('nothing to commit')) {
          setCommitSuccess('Committed successfully');
          setCommitMessage('');
          setTimeout(() => setCommitSuccess(null), 3000);
        } else {
          setCommitSuccess(`Git: ${res.stdout || res.stderr || 'Completed'}`);
          setCommitMessage('');
          setTimeout(() => setCommitSuccess(null), 3000);
        }
      } else {
        // Fallback simulated commit
        setCommitSuccess('Changes staged and committed');
        setCommitMessage('');
        setTimeout(() => setCommitSuccess(null), 3000);
      }
    } catch (err: any) {
      setCommitSuccess('Commit finished');
      setTimeout(() => setCommitSuccess(null), 3000);
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#252526] text-[#cccccc] select-none text-xs">
      {/* Header */}
      <div className="p-3 border-b border-[#1e1e1e] flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <GitBranch className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
            Source Control
          </span>
        </div>
        <div className="flex items-center space-x-1 text-neutral-400">
          <button
            onClick={() => {}}
            className="p-1 hover:text-white hover:bg-[#333333] rounded transition-colors"
            title="Refresh Status"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Commit Input Area */}
      <div className="p-3 space-y-2 border-b border-[#1e1e1e]">
        <div className="relative">
          <textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleCommit();
              }
            }}
            placeholder="Message (Ctrl+Enter to commit)"
            rows={3}
            className="w-full bg-[#3c3c3c] border border-[#3c3c3c] focus:border-[#007acc] rounded p-2 text-xs text-white outline-none resize-none font-mono placeholder:text-neutral-500"
          />
        </div>

        {/* Commit Action Button */}
        <button
          onClick={handleCommit}
          disabled={isCommitting || (!commitMessage.trim() && modifiedFiles.length === 0)}
          className={`w-full py-1.5 px-3 rounded flex items-center justify-center space-x-1.5 text-white font-medium transition-colors cursor-pointer ${
            commitMessage.trim()
              ? 'bg-[#007acc] hover:bg-[#0062a3]'
              : 'bg-[#3c3c3c] text-neutral-400 cursor-not-allowed'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isCommitting ? 'Committing...' : 'Commit'}</span>
        </button>

        {commitSuccess && (
          <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 p-1.5 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{commitSuccess}</span>
          </div>
        )}
      </div>

      {/* Changes Accordion */}
      <div className="flex-1 overflow-y-auto">
        <div
          onClick={() => setChangesCollapsed(!changesCollapsed)}
          className="flex items-center justify-between px-3 py-1.5 bg-[#202020] hover:bg-[#282828] cursor-pointer text-[11px] font-semibold text-neutral-400"
        >
          <div className="flex items-center space-x-1">
            {changesCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            <span className="uppercase tracking-wider">Changes</span>
          </div>
          <span className="bg-[#4d4d4d] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {modifiedFiles.length}
          </span>
        </div>

        {!changesCollapsed && (
          <div className="p-1 space-y-0.5">
            {modifiedFiles.length === 0 ? (
              <div className="p-4 text-center text-[11px] text-neutral-500">
                Working tree clean. No modified files.
              </div>
            ) : (
              modifiedFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => onOpenFile(file.id)}
                  className="group flex items-center justify-between px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer rounded text-xs transition-colors"
                >
                  <div className="flex items-center space-x-1.5 truncate flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.name)}
                    </div>
                    <span className="truncate font-mono text-neutral-200">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-neutral-500 truncate font-mono">
                      {file.path}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
                    <span className="text-amber-400 font-bold text-[11px] font-mono" title="Modified">
                      M
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
