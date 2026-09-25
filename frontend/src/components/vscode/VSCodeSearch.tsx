"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronRight, 
  ChevronDown, 
  CaseSensitive, 
  WholeWord, 
  Regex, 
  RefreshCw, 
  X,
  FileCode2,
  Replace
} from 'lucide-react';
import { WorkspaceFile } from './types';

interface SearchResultMatch {
  file: WorkspaceFile;
  line: number;
  text: string;
  matchIndex: number;
}

interface VSCodeSearchProps {
  files: WorkspaceFile[];
  onOpenFile: (fileId: string) => void;
  getFileIcon: (filename: string) => React.ReactNode;
}

export default function VSCodeSearch({
  files,
  onOpenFile,
  getFileIcon,
}: VSCodeSearchProps) {
  const [query, setQuery] = useState('');
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [isMatchWholeWord, setIsMatchWholeWord] = useState(false);
  const [isRegex, setIsRegex] = useState(false);
  const [collapsedFiles, setCollapsedFiles] = useState<Record<string, boolean>>({});

  // Helper to extract all flat files from tree
  const flattenFiles = (nodes: WorkspaceFile[]): WorkspaceFile[] => {
    let result: WorkspaceFile[] = [];
    for (const node of nodes) {
      if (!node.isDirectory) {
        result.push(node);
      }
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenFiles(node.children));
      }
    }
    return result;
  };

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const allFiles = flattenFiles(files);
    const results: { file: WorkspaceFile; matches: SearchResultMatch[] }[] = [];

    let regex: RegExp;
    try {
      let pattern = query;
      if (!isRegex) {
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      if (isMatchWholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      regex = new RegExp(pattern, isCaseSensitive ? 'g' : 'gi');
    } catch {
      return [];
    }

    for (const file of allFiles) {
      if (!file.content) continue;
      const lines = file.content.split('\n');
      const fileMatches: SearchResultMatch[] = [];

      lines.forEach((lineText, idx) => {
        regex.lastIndex = 0;
        let match;
        if ((match = regex.exec(lineText)) !== null) {
          fileMatches.push({
            file,
            line: idx + 1,
            text: lineText.trim(),
            matchIndex: match.index,
          });
        }
      });

      if (fileMatches.length > 0) {
        results.push({
          file,
          matches: fileMatches,
        });
      }
    }

    return results;
  }, [files, query, isCaseSensitive, isMatchWholeWord, isRegex]);

  const totalMatchesCount = searchResults.reduce((acc, curr) => acc + curr.matches.length, 0);

  const toggleFileCollapse = (fileId: string) => {
    setCollapsedFiles(prev => ({ ...prev, [fileId]: !prev[fileId] }));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#252526] text-[#cccccc] select-none text-xs">
      {/* Header */}
      <div className="p-3 border-b border-[#1e1e1e] flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
          Search
        </span>
        <button
          onClick={() => setQuery('')}
          className="p-1 hover:text-white hover:bg-[#333333] rounded transition-colors text-neutral-400"
          title="Clear Search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Input Box */}
      <div className="p-3 space-y-2 border-b border-[#1e1e1e]">
        <div className="relative flex items-center bg-[#3c3c3c] border border-[#3c3c3c] focus-within:border-[#007acc] rounded">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full bg-transparent px-2.5 py-1.5 text-xs text-white outline-none pr-16 font-mono placeholder:text-neutral-500"
          />
          <div className="absolute right-1 flex items-center space-x-0.5 text-neutral-400">
            <button
              onClick={() => setIsCaseSensitive(!isCaseSensitive)}
              className={`p-1 rounded hover:bg-[#505050] transition-colors ${
                isCaseSensitive ? 'bg-[#094771] text-white' : ''
              }`}
              title="Match Case (Alt+C)"
            >
              <CaseSensitive className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsMatchWholeWord(!isMatchWholeWord)}
              className={`p-1 rounded hover:bg-[#505050] transition-colors ${
                isMatchWholeWord ? 'bg-[#094771] text-white' : ''
              }`}
              title="Match Whole Word (Alt+W)"
            >
              <WholeWord className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsRegex(!isRegex)}
              className={`p-1 rounded hover:bg-[#505050] transition-colors ${
                isRegex ? 'bg-[#094771] text-white' : ''
              }`}
              title="Use Regular Expression (Alt+R)"
            >
              <Regex className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Results summary */}
        {query && (
          <div className="text-[11px] text-neutral-400 px-0.5">
            {totalMatchesCount > 0 ? (
              <span>
                {totalMatchesCount} result{totalMatchesCount !== 1 ? 's' : ''} in {searchResults.length} file{searchResults.length !== 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-amber-400/90">No results found</span>
            )}
          </div>
        )}
      </div>

      {/* Results Tree */}
      <div className="flex-1 overflow-y-auto p-1 space-y-1">
        {searchResults.map(({ file, matches }) => {
          const isCollapsed = collapsedFiles[file.id];

          return (
            <div key={file.id} className="text-xs">
              {/* File header */}
              <div
                onClick={() => toggleFileCollapse(file.id)}
                className="flex items-center space-x-1.5 px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer rounded text-neutral-300 font-medium"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                )}
                <div className="flex-shrink-0">
                  {getFileIcon(file.name)}
                </div>
                <span className="truncate font-mono">{file.name}</span>
                <span className="text-[10px] text-neutral-500 truncate flex-1 font-mono">
                  {file.path}
                </span>
                <span className="bg-[#4d4d4d] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {matches.length}
                </span>
              </div>

              {/* Match lines */}
              {!isCollapsed && (
                <div className="pl-6 space-y-0.5 mt-0.5">
                  {matches.map((match, mIdx) => (
                    <div
                      key={mIdx}
                      onClick={() => onOpenFile(file.id)}
                      className="flex items-center space-x-2 px-2 py-1 hover:bg-[#37373d] cursor-pointer rounded font-mono text-[11px] text-neutral-300 transition-colors"
                    >
                      <span className="text-sky-400 text-[10px] flex-shrink-0 w-6 text-right">
                        {match.line}:
                      </span>
                      <span className="truncate text-neutral-300">
                        {match.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
