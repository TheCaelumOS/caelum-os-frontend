"use client";

import React, { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FileCode2, FolderOpen, Terminal, Sparkles, Plus, GitBranch } from 'lucide-react';
import { WorkspaceFile, EditorTab, DiagnosticProblem } from './types';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e1e] text-slate-400 text-xs font-mono">
        <div className="flex items-center space-x-2.5">
          <div className="w-4 h-4 border-2 border-[#007acc] border-t-transparent rounded-full animate-spin" />
          <span>Initializing Caelum Monaco Engine...</span>
        </div>
      </div>
    ),
  }
);

interface VSCodeEditorProps {
  activeTab: EditorTab | null;
  activeFile: WorkspaceFile | null;
  content: string;
  onChange: (newContent: string) => void;
  onSave: () => void;
  onCursorChange: (line: number, col: number) => void;
  onDiagnosticsChange?: (problems: DiagnosticProblem[]) => void;
  onNewFile: () => void;
  onOpenDirectory: () => void;
  onOpenSandbox: () => void;
  onOpenTerminal: () => void;
}

export default function VSCodeEditor({
  activeTab,
  activeFile,
  content,
  onChange,
  onSave,
  onCursorChange,
  onDiagnosticsChange,
  onNewFile,
  onOpenDirectory,
  onOpenSandbox,
  onOpenTerminal,
}: VSCodeEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Track cursor movement
    editor.onDidChangeCursorPosition((e: any) => {
      onCursorChange(e.position.lineNumber, e.position.column);
    });

    // Handle Ctrl+S / Cmd+S save command inside Monaco
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave();
    });

    // Listen to Monaco markers (diagnostics/errors/warnings)
    if (onDiagnosticsChange) {
      monaco.editor.onDidChangeMarkers(() => {
        const markers = monaco.editor.getModelMarkers({});
        const problems: DiagnosticProblem[] = markers.map((m: any, idx: number) => ({
          id: `marker-${idx}`,
          file: m.resource?.path || 'current',
          line: m.startLineNumber,
          column: m.startColumn,
          message: m.message,
          severity: m.severity === 8 ? 'error' : m.severity === 4 ? 'warning' : 'info',
          source: m.source || 'monaco-linter',
        }));
        onDiagnosticsChange(problems);
      });
    }

    // Set initial cursor
    const pos = editor.getPosition();
    if (pos) {
      onCursorChange(pos.lineNumber, pos.column);
    }
  };

  // If no file/tab is open, render the authentic VS Code Welcome page
  if (!activeTab || !activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#1e1e1e] text-[#cccccc] select-none p-8 overflow-y-auto">
        <div className="max-w-xl w-full space-y-8">
          {/* Logo & Headline */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#007acc]/10 border border-[#007acc]/30 mb-2">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#007acc]">
                <path d="M23.98 6.55L21.3 3.86c-.19-.19-.51-.19-.7 0L14.72 9.5 8.04 3.52c-.19-.19-.51-.19-.7 0L.1 10.64c-.19.19-.19.51 0 .7l2.69 2.69c.19.19.51.19.7 0l5.73-5.73 6.7 6c.19.19.51.19.7 0l7.1-7.1c.19-.2.19-.52-.04-.65z" />
              </svg>
            </div>
            <h1 className="text-2xl font-light text-white tracking-wide">
              Visual Studio Code <span className="text-xs text-sky-400 font-mono bg-sky-950/60 border border-sky-600/30 px-2 py-0.5 rounded-full ml-1">CaelumOS</span>
            </h1>
            <p className="text-xs text-neutral-400">
              Editing evolved. Full native development environment running inside CaelumOS.
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Start Section */}
            <div className="bg-[#252526] border border-[#333333] rounded-xl p-4 space-y-3">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                Start
              </div>

              <button
                onClick={onNewFile}
                className="w-full text-left flex items-center space-x-2.5 text-neutral-300 hover:text-white hover:bg-[#333333] p-2 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-sky-400" />
                <span className="font-medium">New File...</span>
              </button>

              <button
                onClick={onOpenDirectory}
                className="w-full text-left flex items-center space-x-2.5 text-neutral-300 hover:text-white hover:bg-[#333333] p-2 rounded-lg transition-colors cursor-pointer"
              >
                <FolderOpen className="w-4 h-4 text-amber-400" />
                <span className="font-medium">Open Local Folder...</span>
              </button>

              <button
                onClick={onOpenSandbox}
                className="w-full text-left flex items-center space-x-2.5 text-neutral-300 hover:text-white hover:bg-[#333333] p-2 rounded-lg transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-medium">Load CaelumOS Workspace</span>
              </button>

              <button
                onClick={onOpenTerminal}
                className="w-full text-left flex items-center space-x-2.5 text-neutral-300 hover:text-white hover:bg-[#333333] p-2 rounded-lg transition-colors cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-medium">Open Terminal Panel</span>
              </button>
            </div>

            {/* Shortcuts & Reference */}
            <div className="bg-[#252526] border border-[#333333] rounded-xl p-4 space-y-3">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                Keyboard Shortcuts
              </div>

              <div className="space-y-2 text-[11.5px]">
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Save File</span>
                  <span className="font-mono bg-[#1e1e1e] border border-neutral-700 px-1.5 py-0.5 rounded text-[10px] text-neutral-400">Ctrl+S</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Command Palette</span>
                  <span className="font-mono bg-[#1e1e1e] border border-neutral-700 px-1.5 py-0.5 rounded text-[10px] text-neutral-400">F1 / Ctrl+Shift+P</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Toggle Terminal</span>
                  <span className="font-mono bg-[#1e1e1e] border border-neutral-700 px-1.5 py-0.5 rounded text-[10px] text-neutral-400">Ctrl+`</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Find in File</span>
                  <span className="font-mono bg-[#1e1e1e] border border-neutral-700 px-1.5 py-0.5 rounded text-[10px] text-neutral-400">Ctrl+F</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Close Editor Tab</span>
                  <span className="font-mono bg-[#1e1e1e] border border-neutral-700 px-1.5 py-0.5 rounded text-[10px] text-neutral-400">Ctrl+W</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tip */}
          <div className="text-center text-[11px] text-neutral-500">
            Click any file in the Explorer on the left to start editing.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e] relative">
      {/* Breadcrumb Bar */}
      <div className="h-6 bg-[#1e1e1e] border-b border-[#252526] px-4 flex items-center space-x-1.5 text-[11px] font-mono text-[#858585] select-none flex-shrink-0">
        <span>workspace</span>
        <span>›</span>
        {activeTab.path.split('/').filter(Boolean).map((part, index, arr) => (
          <React.Fragment key={index}>
            <span className={index === arr.length - 1 ? 'text-[#cccccc] font-medium' : ''}>
              {part}
            </span>
            {index < arr.length - 1 && <span>›</span>}
          </React.Fragment>
        ))}
        {activeTab.isModified && (
          <span className="ml-2 text-[10px] text-amber-400 italic">● unsaved</span>
        )}
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 min-h-0 w-full relative">
        <MonacoEditor
          path={activeTab.path}
          language={activeTab.language}
          value={content}
          theme="vs-dark"
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', 'Courier New', monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: true,
            minimap: {
              enabled: true,
              maxColumn: 80,
              renderCharacters: false,
            },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            renderWhitespace: 'selection',
            bracketPairColorization: {
              enabled: true,
            },
            formatOnPaste: true,
            padding: {
              top: 8,
              bottom: 8,
            },
          }}
        />
      </div>
    </div>
  );
}
