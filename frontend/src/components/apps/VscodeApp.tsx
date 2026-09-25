"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  WorkspaceFile, 
  EditorTab, 
  ActivityBarTab, 
  BottomPanelTab, 
  DiagnosticProblem 
} from '../vscode/types';
import { 
  getDefaultWorkspace, 
  findFileInTree, 
  updateFileContentInTree, 
  addFileToTree, 
  deleteFileFromTree, 
  getLanguageFromPath
} from '../vscode/workspaceUtils';
import { getFileIcon } from '../vscode/fileIcons';
import VSCodeActivityBar from '../vscode/VSCodeActivityBar';
import VSCodeExplorer from '../vscode/VSCodeExplorer';
import VSCodeSearch from '../vscode/VSCodeSearch';
import VSCodeSourceControl from '../vscode/VSCodeSourceControl';
import VSCodeRunDebug from '../vscode/VSCodeRunDebug';
import VSCodeExtensions from '../vscode/VSCodeExtensions';
import VSCodeTabs from '../vscode/VSCodeTabs';
import VSCodeEditor from '../vscode/VSCodeEditor';
import VSCodeBottomPanel from '../vscode/VSCodeBottomPanel';
import VSCodeStatusBar from '../vscode/VSCodeStatusBar';
import { apiRequest } from '../../lib/api';

export default function VscodeApp() {
  // Workspace File System
  const [files, setFiles] = useState<WorkspaceFile[]>(() => getDefaultWorkspace());
  const [workspaceName, setWorkspaceName] = useState<string>('CAELUMOS');

  // Activity Bar Navigation
  const [activityTab, setActivityTab] = useState<ActivityBarTab>('explorer');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Editor Tabs
  const [tabs, setTabs] = useState<EditorTab[]>([
    {
      id: 'tab-readme',
      fileId: 'root-readme',
      name: 'README.md',
      path: '/README.md',
      language: 'markdown',
      isModified: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string | null>('tab-readme');
  const [activeContent, setActiveContent] = useState<string>(() => {
    const defaultWorkspace = getDefaultWorkspace();
    return defaultWorkspace[0]?.content || '';
  });

  // Editor State
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });
  const [problems, setProblems] = useState<DiagnosticProblem[]>([]);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Bottom Panel State
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState<boolean>(false);
  const [bottomPanelTab, setBottomPanelTab] = useState<BottomPanelTab>('terminal');
  const [isBottomPanelMaximized, setIsBottomPanelMaximized] = useState<boolean>(false);
  const [externalCommand, setExternalCommand] = useState<string | null>(null);

  // Find currently active tab and file objects
  const activeTab = tabs.find((t) => t.id === activeTabId) || null;
  const activeFile = activeTab ? findFileInTree(files, activeTab.fileId) : null;

  // Modified file count for activity bar badge
  const countModifiedFiles = (nodes: WorkspaceFile[]): number => {
    let count = 0;
    for (const node of nodes) {
      if (!node.isDirectory && node.isModified) count++;
      if (node.children) count += countModifiedFiles(node.children);
    }
    return count;
  };
  const modifiedBadgeCount = countModifiedFiles(files);

  // Switch or Open a file in the editor
  const handleOpenFile = useCallback((fileId: string) => {
    const file = findFileInTree(files, fileId);
    if (!file || file.isDirectory) return;

    // Check if tab already exists
    const existingTab = tabs.find((t) => t.fileId === file.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      setActiveContent(file.content);
    } else {
      const newTabId = `tab-${file.id}-${Date.now()}`;
      const newTab: EditorTab = {
        id: newTabId,
        fileId: file.id,
        name: file.name,
        path: file.path,
        language: file.language || getLanguageFromPath(file.name),
        isModified: !!file.isModified,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTabId);
      setActiveContent(file.content);
    }
  }, [files, tabs]);

  // Select Tab
  const handleSelectTab = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;
    setActiveTabId(tab.id);
    const file = findFileInTree(files, tab.fileId);
    if (file) {
      setActiveContent(file.content);
    }
  };

  // Close Tab
  const handleCloseTab = (tabId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const tabIndex = tabs.findIndex((t) => t.id === tabId);
    if (tabIndex === -1) return;

    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        const nextTab = newTabs[Math.max(0, tabIndex - 1)];
        setActiveTabId(nextTab.id);
        const file = findFileInTree(files, nextTab.fileId);
        if (file) setActiveContent(file.content);
      } else {
        setActiveTabId(null);
        setActiveContent('');
      }
    }
  };

  // Close All Tabs
  const handleCloseAllTabs = () => {
    setTabs([]);
    setActiveTabId(null);
    setActiveContent('');
  };

  // Content change in Monaco
  const handleContentChange = (newContent: string) => {
    setActiveContent(newContent);
    if (!activeTab) return;

    // Mark tab as modified
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTab.id ? { ...t, isModified: true } : t))
    );

    // Update file content in file tree
    setFiles((prev) => updateFileContentInTree(prev, activeTab.fileId, newContent, true));
  };

  // Save current file (Ctrl+S)
  const handleSave = async () => {
    if (!activeTab || !activeFile) return;

    // Clear modified flag
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTab.id ? { ...t, isModified: false } : t))
    );
    setFiles((prev) => updateFileContentInTree(prev, activeTab.fileId, activeContent, false));

    // If local file handle exists (File System Access API), write to disk
    if (activeFile.handle && typeof activeFile.handle.createWritable === 'function') {
      try {
        const writable = await activeFile.handle.createWritable();
        await writable.write(activeContent);
        await writable.close();
      } catch (err) {
        console.warn('[VSCode] Error saving to FileSystemFileHandle:', err);
      }
    } else {
      // Attempt backend filesystem save if path exists
      try {
        await apiRequest('/filesystem/write', {
          method: 'POST',
          body: JSON.stringify({
            path: activeFile.path,
            content: activeContent,
          }),
        }).catch(() => {});
      } catch {}
    }

    setSaveToast(`Saved ${activeFile.name}`);
    setTimeout(() => setSaveToast(null), 2500);
  };

  // Create new file
  const handleCreateFile = (parentPath: string, name: string) => {
    const cleanParent = parentPath === '/' ? '' : parentPath;
    const filePath = `${cleanParent}/${name}`;
    const newFile: WorkspaceFile = {
      id: `file-${Date.now()}`,
      name,
      path: filePath,
      content: '',
      language: getLanguageFromPath(name),
      isModified: false,
    };
    setFiles((prev) => addFileToTree(prev, parentPath, newFile));
    handleOpenFile(newFile.id);
  };

  // Create new folder
  const handleCreateFolder = (parentPath: string, name: string) => {
    const cleanParent = parentPath === '/' ? '' : parentPath;
    const folderPath = `${cleanParent}/${name}`;
    const newFolder: WorkspaceFile = {
      id: `folder-${Date.now()}`,
      name,
      path: folderPath,
      isDirectory: true,
      content: '',
      language: '',
      children: [],
    };
    setFiles((prev) => addFileToTree(prev, parentPath, newFolder));
  };

  // Delete file or folder
  const handleDeleteFile = (fileId: string) => {
    // Close tab if open
    const tabToClose = tabs.find((t) => t.fileId === fileId);
    if (tabToClose) {
      handleCloseTab(tabToClose.id);
    }
    setFiles((prev) => deleteFileFromTree(prev, fileId));
  };

  // Open Local Folder via Browser File System Access API
  const handleOpenLocalFolder = async () => {
    if (typeof window === 'undefined' || !(window as any).showDirectoryPicker) {
      alert('The File System Access API is not supported in this browser. You can still use the CaelumOS Sandbox.');
      return;
    }

    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      setWorkspaceName(dirHandle.name.toUpperCase());

      // Helper to read directory recursively
      const readDirRecursively = async (
        handle: any,
        currentPath: string
      ): Promise<WorkspaceFile[]> => {
        const entries: WorkspaceFile[] = [];
        for await (const entry of handle.values()) {
          const entryPath = `${currentPath}/${entry.name}`;
          if (entry.kind === 'directory') {
            // Ignore node_modules and .git by default for performance
            if (entry.name === 'node_modules' || entry.name === '.git') continue;
            const children = await readDirRecursively(entry, entryPath);
            entries.push({
              id: `dir-${entryPath}`,
              name: entry.name,
              path: entryPath,
              isDirectory: true,
              content: '',
              language: '',
              children,
              handle: entry,
            });
          } else if (entry.kind === 'file') {
            const file = await entry.getFile();
            const text = await file.text();
            entries.push({
              id: `file-${entryPath}`,
              name: entry.name,
              path: entryPath,
              isDirectory: false,
              content: text,
              language: getLanguageFromPath(entry.name),
              handle: entry,
            });
          }
        }
        return entries;
      };

      const localFiles = await readDirRecursively(dirHandle, `/${dirHandle.name}`);
      setFiles(localFiles);
      setTabs([]);
      setActiveTabId(null);
      setActiveContent('');

      // Open first available file if any
      const findFirstFile = (nodes: WorkspaceFile[]): WorkspaceFile | null => {
        for (const n of nodes) {
          if (!n.isDirectory) return n;
          if (n.children) {
            const found = findFirstFile(n.children);
            if (found) return found;
          }
        }
        return null;
      };

      const firstFile = findFirstFile(localFiles);
      if (firstFile) {
        handleOpenFile(firstFile.id);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to open local directory:', err);
      }
    }
  };

  // Load CaelumOS Default Sandbox Workspace
  const handleOpenSandbox = () => {
    setFiles(getDefaultWorkspace());
    setWorkspaceName('CAELUMOS');
    setTabs([
      {
        id: 'tab-readme',
        fileId: 'root-readme',
        name: 'README.md',
        path: '/README.md',
        language: 'markdown',
        isModified: false,
      },
    ]);
    setActiveTabId('tab-readme');
    const defaultWs = getDefaultWorkspace();
    setActiveContent(defaultWs[0]?.content || '');
  };

  // Execute command from Run & Debug or Terminal
  const handleRunCommand = (cmd: string) => {
    setBottomPanelTab('terminal');
    setIsBottomPanelOpen(true);
    setExternalCommand(cmd);
  };

  // Keyboard shortcut listener for Save (Ctrl+S), Terminal (Ctrl+`), and Sidebar (Ctrl+B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setIsBottomPanelOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        if (activeTabId) {
          e.preventDefault();
          handleCloseTab(activeTabId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, activeTab, activeFile, activeContent]);

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#1e1e1e] text-[#cccccc] font-sans overflow-hidden select-none">
      {/* Save Notification Toast */}
      {saveToast && (
        <div className="absolute top-10 right-4 z-50 bg-[#007acc] text-white text-xs px-3 py-1.5 rounded-lg shadow-2xl flex items-center space-x-2 animate-in fade-in duration-150">
          <span>✔ {saveToast}</span>
        </div>
      )}

      {/* Main Horizontal Workspace: Activity Bar + Sidebar + Editor */}
      <div className="flex-1 flex min-h-0 relative">
        {/* 1. Left Activity Bar */}
        <VSCodeActivityBar
          activeTab={activityTab}
          onTabChange={(tab) => {
            if (activityTab === tab && isSidebarOpen) {
              setIsSidebarOpen(false);
            } else {
              setActivityTab(tab);
              setIsSidebarOpen(true);
            }
          }}
          modifiedCount={modifiedBadgeCount}
        />

        {/* 2. Primary Collapsible Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 sm:w-72 bg-[#252526] border-r border-[#1e1e1e] flex flex-col min-h-0 flex-shrink-0 z-10 transition-all">
            {activityTab === 'explorer' && (
              <VSCodeExplorer
                files={files}
                activeFileId={activeFile?.id}
                workspaceName={workspaceName}
                onSelectFile={(f) => handleOpenFile(f.id)}
                onCreateFile={handleCreateFile}
                onCreateFolder={handleCreateFolder}
                onDeleteFile={handleDeleteFile}
                onOpenLocalFolder={handleOpenLocalFolder}
                onOpenSandbox={handleOpenSandbox}
                onRefresh={() => {}}
              />
            )}

            {activityTab === 'search' && (
              <VSCodeSearch
                files={files}
                onOpenFile={handleOpenFile}
                getFileIcon={getFileIcon}
              />
            )}

            {activityTab === 'git' && (
              <VSCodeSourceControl
                files={files}
                onOpenFile={handleOpenFile}
                getFileIcon={getFileIcon}
                onExecuteCommand={async (cmd) => {
                  return await apiRequest('/terminal/execute', {
                    method: 'POST',
                    body: JSON.stringify({ command: cmd }),
                  });
                }}
              />
            )}

            {activityTab === 'debug' && (
              <VSCodeRunDebug
                activeTab={activeTab}
                activeFile={activeFile}
                onRunCommand={handleRunCommand}
              />
            )}

            {activityTab === 'extensions' && (
              <VSCodeExtensions />
            )}

            {activityTab === 'settings' && (
              <div className="flex-1 p-4 space-y-4 text-xs">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                  Editor Settings
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-neutral-300 font-medium block mb-1">Editor Font Size</label>
                    <input
                      type="number"
                      defaultValue={13}
                      className="bg-[#3c3c3c] border border-[#3c3c3c] text-white px-2 py-1 rounded w-20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-300 font-medium block mb-1">Word Wrap</label>
                    <select
                      defaultValue="on"
                      className="bg-[#3c3c3c] border border-[#3c3c3c] text-white px-2 py-1 rounded w-full outline-none"
                    >
                      <option value="on">on</option>
                      <option value="off">off</option>
                      <option value="wordWrapColumn">wordWrapColumn</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-neutral-300 font-medium block mb-1">Theme</label>
                    <select
                      defaultValue="vs-dark"
                      className="bg-[#3c3c3c] border border-[#3c3c3c] text-white px-2 py-1 rounded w-full outline-none"
                    >
                      <option value="vs-dark">Dark+ (default dark)</option>
                      <option value="vs-light">Light+ (default light)</option>
                      <option value="hc-black">High Contrast</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* 3. Editor & Bottom Panel Container */}
        <main className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e] relative">
          {/* Tabs Strip */}
          {tabs.length > 0 && (
            <VSCodeTabs
              tabs={tabs}
              activeTabId={activeTabId}
              onSelectTab={handleSelectTab}
              onCloseTab={(id, e) => handleCloseTab(id, e)}
              onCloseAllTabs={handleCloseAllTabs}
              getFileIcon={getFileIcon}
            />
          )}

          {/* Monaco Editor / Welcome Screen */}
          <VSCodeEditor
            activeTab={activeTab}
            activeFile={activeFile}
            content={activeContent}
            onChange={handleContentChange}
            onSave={handleSave}
            onCursorChange={(line, col) => setCursorPos({ line, col })}
            onDiagnosticsChange={(newProblems) => setProblems(newProblems)}
            onNewFile={() => handleCreateFile('/', 'untitled.ts')}
            onOpenDirectory={handleOpenLocalFolder}
            onOpenSandbox={handleOpenSandbox}
            onOpenTerminal={() => {
              setBottomPanelTab('terminal');
              setIsBottomPanelOpen(true);
            }}
          />

          {/* Bottom Panel (Terminal, Problems, Output, Debug Console) */}
          {isBottomPanelOpen && (
            <VSCodeBottomPanel
              activeTab={bottomPanelTab}
              onSelectTab={(t) => setBottomPanelTab(t)}
              onClose={() => setIsBottomPanelOpen(false)}
              isMaximized={isBottomPanelMaximized}
              onToggleMaximize={() => setIsBottomPanelMaximized((prev) => !prev)}
              problems={problems}
              onProblemClick={(p) => {
                // Find file in tree and open it
                const file = files.find((f) => f.name === p.file || f.path.includes(p.file));
                if (file) handleOpenFile(file.id);
              }}
              externalCommand={externalCommand}
              onClearExternalCommand={() => setExternalCommand(null)}
            />
          )}
        </main>
      </div>

      {/* 4. Bottom Status Bar */}
      <VSCodeStatusBar
        cursorPos={cursorPos}
        activeLanguage={activeTab?.language || 'plaintext'}
        problems={problems}
        isBottomPanelOpen={isBottomPanelOpen}
        onToggleBottomPanel={() => setIsBottomPanelOpen((prev) => !prev)}
        onSelectTab={(tab) => {
          setBottomPanelTab(tab);
          setIsBottomPanelOpen(true);
        }}
      />
    </div>
  );
}
