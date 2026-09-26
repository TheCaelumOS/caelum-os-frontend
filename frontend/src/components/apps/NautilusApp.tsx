"use client";

import React, { useState, useEffect, useRef } from 'react';
import { apiRequest, API_BASE, getStoredToken } from '../../lib/api';
import { 
  Folder, 
  FileCode, 
  FileText, 
  FileJson, 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  HardDrive, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Scissors, 
  Copy, 
  Clipboard, 
  Edit3, 
  Files, 
  Terminal as TerminalIcon, 
  ExternalLink, 
  Info, 
  Shield, 
  Lock, 
  User, 
  Clock, 
  Check, 
  X, 
  ChevronRight, 
  FilePlus, 
  FolderPlus, 
  RotateCcw,
  Monitor,
  Code2,
  Globe,
  Upload,
  Download,
  Eye,
  Save,
  Image as ImageIcon,
  Film
} from 'lucide-react';
import { VscodeLogo, TerminalLogo, FirefoxLogo } from '../icons/RealBrandLogos';

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: string;
  created?: string;
  permissions?: string;
  owner?: string;
  group?: string;
  defaultApp?: 'vscode' | 'terminal' | 'browser' | 'text-editor';
  sha256?: string;
}

interface ClipboardItem {
  item: FileItem;
  operation: 'cut' | 'copy';
  sourcePath: string;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  item: FileItem | null; // null represents background context menu
}

interface QuotaState {
  usedBytes: number;
  quotaBytes: number;
  freeBytes: number;
  usedPercent: number;
  usedFormatted: string;
  freeFormatted: string;
  quotaFormatted: string;
}

interface PreviewState {
  file: FileItem;
  content: string;
  loading: boolean;
  saving: boolean;
}

interface NautilusAppProps {
  onOpenApp?: (appId: string, param?: string) => void;
}

const SIDEBAR_LOCATIONS = [
  { id: '/', label: 'Home Sandbox', icon: HardDrive },
  { id: '/Desktop', label: 'Desktop', icon: Monitor },
  { id: '/Documents', label: 'Documents', icon: FileText },
  { id: '/Downloads', label: 'Downloads', icon: Download },
  { id: '/Pictures', label: 'Pictures', icon: ImageIcon },
  { id: '/Projects', label: 'Projects', icon: Code2 },
  { id: '/Videos', label: 'Videos', icon: Film },
];

export default function NautilusApp({ onOpenApp }: NautilusAppProps) {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [history, setHistory] = useState<string[]>(['/']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchVal, setSearchVal] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [quota, setQuota] = useState<QuotaState | null>(null);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick In-App Viewer / Editor Modal State
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);

  // Clipboard State for Cut / Copy / Paste
  const [clipboard, setClipboard] = useState<ClipboardItem | null>(null);

  // Right-Click Context Menu State
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    item: null
  });

  // Open With Submenu hover state
  const [showOpenWithSubmenu, setShowOpenWithSubmenu] = useState(false);
  const [showNewDocSubmenu, setShowNewDocSubmenu] = useState(false);

  // Modals
  const [propertiesItem, setPropertiesItem] = useState<FileItem | null>(null);
  const [propertiesTab, setPropertiesTab] = useState<'general' | 'permissions' | 'security' | 'openwith'>('general');
  const [renameItem, setRenameItem] = useState<FileItem | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');
  const [createModal, setCreateModal] = useState<{ open: boolean; type: 'folder' | 'file'; templateName?: string } | null>(null);
  const [createName, setCreateName] = useState<string>('');

  // Toast notifications (e.g., "Moved to Trash" with Undo)
  const [toast, setToast] = useState<{ message: string; undoAction?: () => void } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch quota breakdown
  const fetchQuota = async () => {
    try {
      const data = await apiRequest('/filesystem/quota');
      if (data && typeof data.usedBytes === 'number') {
        setQuota(data);
      }
    } catch {}
  };

  // Fetch files for current directory from backend
  const loadDirectory = async (path: string) => {
    setLoading(true);
    try {
      const data = await apiRequest(`/filesystem/list?path=${encodeURIComponent(path)}`);
      if (Array.isArray(data)) {
        setFiles(data);
        await fetchQuota();
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('API directory fetch failed:', err);
    }

    setFiles([]);
    setLoading(false);
  };

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  // Close context menu on any global click or escape key
  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu(prev => ({ ...prev, visible: false }));
      setShowOpenWithSubmenu(false);
      setShowNewDocSubmenu(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(prev => ({ ...prev, visible: false }));
        setShowOpenWithSubmenu(false);
        setShowNewDocSubmenu(false);
        setPropertiesItem(null);
        setRenameItem(null);
        setCreateModal(null);
        setPreviewState(null);
      }
      // Shortcut Ctrl+C (Copy)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedItem) {
        handleCopy(selectedItem);
      }
      // Shortcut Ctrl+X (Cut)
      if ((e.ctrlKey || e.metaKey) && e.key === 'x' && selectedItem) {
        handleCut(selectedItem);
      }
      // Shortcut Ctrl+V (Paste)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard) {
        handlePaste();
      }
      // Shortcut F2 (Rename)
      if (e.key === 'F2' && selectedItem) {
        triggerRename(selectedItem);
      }
      // Shortcut Delete
      if (e.key === 'Delete' && selectedItem) {
        handleMoveToTrash(selectedItem);
      }
      // Shortcut Ctrl+D (Duplicate)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedItem) {
        e.preventDefault();
        handleDuplicate(selectedItem);
      }
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedItem, clipboard, currentPath]);

  // Navigation handlers
  const navigateTo = (path: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(path);
    setSelectedItem(null);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      setHistoryIndex(idx);
      setCurrentPath(history[idx]);
      setSelectedItem(null);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      setHistoryIndex(idx);
      setCurrentPath(history[idx]);
      setSelectedItem(null);
    }
  };

  // Right-Click Context Menu Trigger for Items
  const handleItemContextMenu = (e: React.MouseEvent, item: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItem(item);
    
    let x = e.clientX;
    let y = e.clientY;
    if (typeof window !== 'undefined') {
      if (x + 230 > window.innerWidth) x = window.innerWidth - 240;
      if (y + 360 > window.innerHeight) y = window.innerHeight - 370;
    }

    setContextMenu({
      visible: true,
      x,
      y,
      item
    });
    setShowOpenWithSubmenu(false);
    setShowNewDocSubmenu(false);
  };

  // Right-Click Context Menu Trigger for Folder Background
  const handleBackgroundContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedItem(null);

    let x = e.clientX;
    let y = e.clientY;
    if (typeof window !== 'undefined') {
      if (x + 230 > window.innerWidth) x = window.innerWidth - 240;
      if (y + 320 > window.innerHeight) y = window.innerHeight - 330;
    }

    setContextMenu({
      visible: true,
      x,
      y,
      item: null
    });
    setShowOpenWithSubmenu(false);
    setShowNewDocSubmenu(false);
  };

  // ==========================================
  // REAL FILE MANAGEMENT ACTIONS
  // ==========================================

  // 1. Cut
  const handleCut = (item: FileItem) => {
    setClipboard({ item, operation: 'cut', sourcePath: currentPath });
    setContextMenu(prev => ({ ...prev, visible: false }));
    showToast(`Cut "${item.name}". Paste into destination.`);
  };

  // 2. Copy
  const handleCopy = (item: FileItem) => {
    setClipboard({ item, operation: 'copy', sourcePath: currentPath });
    setContextMenu(prev => ({ ...prev, visible: false }));
    showToast(`Copied "${item.name}" to clipboard.`);
  };

  // 3. Paste
  const handlePaste = async (targetPath = currentPath) => {
    if (!clipboard) return;
    setContextMenu(prev => ({ ...prev, visible: false }));

    const { item, operation } = clipboard;
    let newName = item.name;
    let counter = 1;
    while (files.some(f => f.name === newName)) {
      const ext = item.name.includes('.') ? item.name.slice(item.name.lastIndexOf('.')) : '';
      const base = item.name.includes('.') ? item.name.slice(0, item.name.lastIndexOf('.')) : item.name;
      newName = `${base} (copy${counter > 1 ? ` ${counter}` : ''})${ext}`;
      counter++;
    }

    const destPath = targetPath === '/' ? `/${newName}` : `${targetPath}/${newName}`;

    try {
      if (operation === 'cut') {
        await apiRequest('/filesystem/move', {
          method: 'POST',
          body: JSON.stringify({ source: item.path, destination: destPath })
        });
        setClipboard(null);
        showToast(`Moved "${item.name}" to ${targetPath === '/' ? 'Home Sandbox' : targetPath}.`);
      } else {
        await apiRequest('/filesystem/copy', {
          method: 'POST',
          body: JSON.stringify({ source: item.path, destination: destPath })
        });
        showToast(`Copied "${newName}" into ${targetPath === '/' ? 'Home Sandbox' : targetPath}.`);
      }
      await loadDirectory(currentPath);
    } catch (err: any) {
      showToast(`Operation failed: ${err.message || 'Error'}`);
    }
  };

  // 4. Duplicate
  const handleDuplicate = async (item: FileItem) => {
    setContextMenu(prev => ({ ...prev, visible: false }));

    const ext = item.name.includes('.') ? item.name.slice(item.name.lastIndexOf('.')) : '';
    const base = item.name.includes('.') ? item.name.slice(0, item.name.lastIndexOf('.')) : item.name;
    let newName = `${base} (copy)${ext}`;
    let counter = 1;
    while (files.some(f => f.name === newName)) {
      counter++;
      newName = `${base} (copy ${counter})${ext}`;
    }

    const destPath = currentPath === '/' ? `/${newName}` : `${currentPath}/${newName}`;

    try {
      await apiRequest('/filesystem/copy', {
        method: 'POST',
        body: JSON.stringify({ source: item.path, destination: destPath })
      });
      showToast(`Duplicated "${item.name}" as "${newName}".`);
      await loadDirectory(currentPath);
    } catch (err: any) {
      showToast(`Duplication failed: ${err.message || 'Error'}`);
    }
  };

  // 5. Rename
  const triggerRename = (item: FileItem) => {
    setContextMenu(prev => ({ ...prev, visible: false }));
    setRenameItem(item);
    setRenameValue(item.name);
  };

  const confirmRename = async () => {
    if (!renameItem || !renameValue.trim() || renameValue === renameItem.name) {
      setRenameItem(null);
      return;
    }

    const newName = renameValue.trim();
    const newPath = currentPath === '/' ? `/${newName}` : `${currentPath}/${newName}`;

    try {
      await apiRequest('/filesystem/move', {
        method: 'POST',
        body: JSON.stringify({ source: renameItem.path, destination: newPath })
      });
      showToast(`Renamed to "${newName}".`);
      await loadDirectory(currentPath);
    } catch (err: any) {
      showToast(`Rename failed: ${err.message || 'Error'}`);
    }

    setRenameItem(null);
  };

  // 6. Delete File or Folder
  const handleMoveToTrash = async (item: FileItem) => {
    setContextMenu(prev => ({ ...prev, visible: false }));

    try {
      await apiRequest('/filesystem/delete', {
        method: 'POST',
        body: JSON.stringify({ path: item.path })
      });
      showToast(`"${item.name}" deleted from filesystem.`);
      await loadDirectory(currentPath);
    } catch (err: any) {
      showToast(`Delete failed: ${err.message || 'Error'}`);
    }
  };

  // 7. Creation of New Folders & Files
  const confirmCreate = async () => {
    if (!createModal || !createName.trim()) {
      setCreateModal(null);
      return;
    }

    const name = createName.trim();
    const isDir = createModal.type === 'folder';
    const filePath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;

    try {
      if (isDir) {
        await apiRequest('/filesystem/mkdir', {
          method: 'POST',
          body: JSON.stringify({ path: filePath })
        });
      } else {
        const initialContent = 
          name.endsWith('.sh') ? '#!/bin/bash\n# CaelumOS Shell Script\necho "Hello from CaelumOS"\n' :
          name.endsWith('.json') ? '{\n  "version": "1.0.0"\n}\n' :
          name.endsWith('.md') ? '# New Document\nCreated in CaelumOS.\n' :
          '# Created in CaelumOS\n';

        await apiRequest('/filesystem/write', {
          method: 'POST',
          body: JSON.stringify({ path: filePath, content: initialContent })
        });
      }
      showToast(`Created ${isDir ? 'folder' : 'file'} "${name}".`);
      await loadDirectory(currentPath);
    } catch (err: any) {
      showToast(`Creation failed: ${err.message || 'Error'}`);
    }

    setCreateModal(null);
  };

  // 8. File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast(`Uploading "${file.name}"...`);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await apiRequest(`/filesystem/upload?path=${encodeURIComponent(currentPath)}`, {
        method: 'POST',
        body: formData,
      });
      showToast(`Uploaded "${file.name}" successfully.`);
      await loadDirectory(currentPath);
    } catch (err: any) {
      showToast(`Upload failed: ${err.message || 'Error'}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 9. File Download
  const handleDownloadFile = async (item: FileItem) => {
    setContextMenu(prev => ({ ...prev, visible: false }));
    try {
      const token = getStoredToken();
      const res = await fetch(`${API_BASE}/filesystem/download?path=${encodeURIComponent(item.path)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast(`Downloaded "${item.name}".`);
    } catch {
      showToast(`Failed to download "${item.name}".`);
    }
  };

  // 10. Open in Quick Viewer / Editor Modal
  const handleOpenPreview = async (item: FileItem) => {
    if (item.isDirectory) return;
    setPreviewState({ file: item, content: '', loading: true, saving: false });
    try {
      const res = await apiRequest(`/filesystem/read?path=${encodeURIComponent(item.path)}`);
      setPreviewState({ file: item, content: res?.content || '', loading: false, saving: false });
    } catch {
      setPreviewState({ file: item, content: '# Could not read file content', loading: false, saving: false });
    }
  };

  const handleSavePreview = async () => {
    if (!previewState) return;
    setPreviewState(prev => prev ? { ...prev, saving: true } : null);
    try {
      await apiRequest('/filesystem/write', {
        method: 'POST',
        body: JSON.stringify({ path: previewState.file.path, content: previewState.content })
      });
      showToast(`Saved "${previewState.file.name}".`);
      await loadDirectory(currentPath);
    } catch {
      showToast(`Failed to save "${previewState.file.name}".`);
    } finally {
      setPreviewState(prev => prev ? { ...prev, saving: false } : null);
    }
  };

  // Open item with default application or navigate
  const handleOpenItem = (item: FileItem) => {
    setContextMenu(prev => ({ ...prev, visible: false }));
    if (item.isDirectory) {
      navigateTo(item.path);
      return;
    }

    if (onOpenApp && (item.name.endsWith('.sh') || item.name.endsWith('.py') || item.name.endsWith('.ts') || item.name.endsWith('.json'))) {
      const app = item.defaultApp || (item.name.endsWith('.sh') ? 'terminal' : 'vscode');
      onOpenApp(app, item.path);
    } else {
      handleOpenPreview(item);
    }
  };

  // Open with specified application
  const handleOpenWithApp = (item: FileItem, appId: 'vscode' | 'terminal' | 'browser' | 'text-editor') => {
    setContextMenu(prev => ({ ...prev, visible: false }));
    if (appId === 'text-editor') {
      handleOpenPreview(item);
      return;
    }
    if (onOpenApp) {
      onOpenApp(appId, item.path);
    } else {
      showToast(`Opening "${item.name}" with ${appId.toUpperCase()}...`);
    }
  };

  // Open in Terminal from folder or background
  const handleOpenInTerminal = (folderPath: string) => {
    setContextMenu(prev => ({ ...prev, visible: false }));
    if (onOpenApp) {
      onOpenApp('terminal', folderPath);
    } else {
      showToast(`Terminal opened at ${folderPath}`);
    }
  };

  // Live Server Search
  const handleSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!searchVal.trim()) {
        loadDirectory(currentPath);
        return;
      }
      setLoading(true);
      try {
        const res = await apiRequest(`/filesystem/search?query=${encodeURIComponent(searchVal.trim())}&path=${encodeURIComponent(currentPath)}`);
        if (Array.isArray(res)) {
          setFiles(res);
        }
      } catch {}
      setLoading(false);
    }
  };

  // Helper toast notification
  const showToast = (message: string, undoAction?: () => void) => {
    setToast({ message, undoAction });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Icon selector
  const getIcon = (item: FileItem) => {
    if (item.isDirectory) return <Folder className="w-10 h-10 text-orange-500 fill-orange-500/15" />;
    const ext = item.name.split('.').pop()?.toLowerCase();
    if (ext === 'json') return <FileJson className="w-10 h-10 text-indigo-400" />;
    if (ext === 'tf' || ext === 'tfstate') return <FileCode className="w-10 h-10 text-purple-400" />;
    if (ext === 'sh' || ext === 'bash') return <TerminalIcon className="w-10 h-10 text-emerald-500" />;
    if (ext === 'md' || ext === 'txt') return <FileText className="w-10 h-10 text-slate-500" />;
    if (ext === 'html' || ext === 'svg') return <Globe className="w-10 h-10 text-blue-500" />;
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp') return <ImageIcon className="w-10 h-10 text-pink-500" />;
    if (ext === 'mp4' || ext === 'webm' || ext === 'mkv') return <Film className="w-10 h-10 text-violet-500" />;
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
    <div 
      ref={containerRef}
      onContextMenu={handleBackgroundContextMenu}
      className="flex-1 flex flex-col bg-[#eae6df] text-slate-800 font-sans h-full select-none relative overflow-hidden"
    >
      {/* Hidden File Upload Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      {/* 1. Nautilus Toolbar Header */}
      <div className="h-11 bg-[#eae6df] border-b border-[#c1beb5] px-3 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center space-x-3 text-slate-600 flex-1">
          {/* Navigation Arrows */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button 
              onClick={handleBack}
              disabled={historyIndex === 0}
              className="p-1 rounded hover:bg-slate-350/60 disabled:opacity-20 cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleForward}
              disabled={historyIndex === history.length - 1}
              className="p-1 rounded hover:bg-slate-350/60 disabled:opacity-20 cursor-pointer"
              title="Forward"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Folder Path Trail */}
          <div className="flex items-center space-x-1 text-xs text-slate-600 font-bold bg-[#dfdbd2] border border-[#c1beb5] px-2.5 py-1 rounded-md shadow-sm truncate max-w-md">
            <span>{currentPath === '/' ? 'Home Sandbox (/)' : `Home${currentPath}`}</span>
          </div>

          {/* Quick Toolbar Actions */}
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => {
                setCreateModal({ open: true, type: 'folder' });
                setCreateName('New Folder');
              }}
              className="p-1.5 rounded hover:bg-slate-350/60 text-slate-700 cursor-pointer flex items-center space-x-1 text-xs font-semibold"
              title="Create New Folder (Ctrl+Shift+N)"
            >
              <FolderPlus className="w-4 h-4 text-amber-600" />
            </button>
            <button 
              onClick={() => {
                setCreateModal({ open: true, type: 'file' });
                setCreateName('untitled.txt');
              }}
              className="p-1.5 rounded hover:bg-slate-350/60 text-slate-700 cursor-pointer flex items-center space-x-1 text-xs font-semibold"
              title="Create New Empty File"
            >
              <FilePlus className="w-4 h-4 text-sky-600" />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded hover:bg-slate-350/60 text-slate-700 cursor-pointer flex items-center space-x-1 text-xs font-semibold"
              title="Upload File"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
            </button>
            <button 
              onClick={() => loadDirectory(currentPath)}
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
            onKeyDown={handleSearchKeyDown}
            placeholder="Search folder (Enter)..."
            className="w-full bg-[#f4f2ee] border border-[#c1beb5] rounded-md pl-8 pr-2.5 py-1 text-xs outline-none focus:border-slate-500 focus:bg-white text-slate-800"
          />
        </div>
      </div>

      {/* 2. Main Files Grid Workspace */}
      <div className="flex-grow flex min-h-0">
        {/* Left Sidebar Locations list */}
        <div className="w-1/4 max-w-[190px] bg-[#f4f2ee] border-r border-[#c1beb5] p-3 space-y-4 flex-shrink-0">
          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">Locations</span>
          <div className="space-y-1 text-xs text-slate-700">
            {SIDEBAR_LOCATIONS.map(loc => {
              const IconComp = loc.icon;
              return (
                <button
                  key={loc.id}
                  onClick={() => navigateTo(loc.id)}
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg font-bold cursor-pointer transition-colors text-left truncate ${
                    currentPath === loc.id ? 'bg-[#c9c5ba] text-slate-900' : 'hover:bg-slate-300/40'
                  }`}
                >
                  <IconComp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{loc.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#c1beb5]/60 space-y-2">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Workspace Storage</span>
            <div className="text-[10px] text-slate-500 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Used:</span>
                <span className="font-bold text-slate-700">{quota?.usedFormatted || '0 B'}</span>
              </div>
              <div className="flex justify-between">
                <span>Free:</span>
                <span className="font-bold text-slate-700">{quota?.freeFormatted || '50 GB'}</span>
              </div>
              <div className="w-full bg-slate-300 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${Math.max(2, quota?.usedPercent || 2)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right workspace view */}
        <div 
          onClick={() => setSelectedItem(null)}
          className="flex-grow bg-[#fcfbfa] overflow-y-auto p-5 select-text relative"
        >
          {loading ? (
            <div className="flex items-center justify-center py-24 text-xs text-slate-400 font-bold space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
              <span>Loading files...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-24 text-xs text-slate-400 font-bold">
              This folder is empty. Right-click here to create a new folder, file, or upload.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-5">
              {filteredFiles.map(file => {
                const isSelected = selectedItem?.name === file.name;
                const isCut = clipboard?.item.name === file.name && clipboard.operation === 'cut';

                return (
                  <div
                    key={file.path}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(file);
                    }}
                    onDoubleClick={() => handleOpenItem(file)}
                    onContextMenu={(e) => handleItemContextMenu(e, file)}
                    className={`flex flex-col items-center p-3 rounded-2xl border transition-all text-center group cursor-pointer relative ${
                      isSelected 
                        ? 'bg-sky-100/70 border-sky-400 ring-1 ring-sky-400/40 shadow-sm' 
                        : 'border-transparent hover:bg-slate-200/50 hover:border-slate-300/60'
                    } ${isCut ? 'opacity-40 border-dashed border-sky-500' : ''}`}
                  >
                    <div className="mb-2 group-hover:scale-105 transition-transform duration-150">
                      {getIcon(file)}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 tracking-tight break-all max-w-[100px] line-clamp-2 leading-tight">
                      {file.name}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-1 font-mono leading-none">
                      {file.isDirectory ? 'Folder' : formatSize(file.size)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CUSTOM GNOME CONTEXT MENU (ITEM & BACKGROUND)                          */}
      {/* ========================================================================= */}
      {contextMenu.visible && (
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-56 bg-neutral-900/95 backdrop-blur-md text-slate-200 border border-neutral-700/80 rounded-xl shadow-2xl py-1 text-xs select-none animate-in fade-in duration-100"
        >
          {/* ITEM CONTEXT MENU */}
          {contextMenu.item ? (
            <div>
              {/* Open */}
              <div 
                onClick={() => handleOpenItem(contextMenu.item!)}
                className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center justify-between cursor-pointer font-semibold"
              >
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>Open</span>
                </div>
                <span className="text-[10px] opacity-60 font-mono">Enter</span>
              </div>

              {/* Preview / Edit Text */}
              {!contextMenu.item.isDirectory && (
                <div 
                  onClick={() => {
                    handleOpenPreview(contextMenu.item!);
                    setContextMenu(prev => ({ ...prev, visible: false }));
                  }}
                  className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>Preview / Quick Edit</span>
                </div>
              )}

              {/* Open With Submenu */}
              {!contextMenu.item.isDirectory && (
                <div 
                  onMouseEnter={() => setShowOpenWithSubmenu(true)}
                  onMouseLeave={() => setShowOpenWithSubmenu(false)}
                  className="relative px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-3.5 h-3.5 text-slate-400" />
                    <span>Open With</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />

                  {showOpenWithSubmenu && (
                    <div className="absolute left-full top-0 ml-1 w-48 bg-neutral-900 text-slate-200 border border-neutral-700 rounded-xl shadow-2xl py-1 text-xs">
                      <div 
                        onClick={() => handleOpenWithApp(contextMenu.item!, 'vscode')}
                        className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer"
                      >
                        <VscodeLogo className="w-3.5 h-3.5" />
                        <span>VS Code</span>
                      </div>
                      <div 
                        onClick={() => handleOpenWithApp(contextMenu.item!, 'terminal')}
                        className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer"
                      >
                        <TerminalLogo className="w-3.5 h-3.5" />
                        <span>Terminal</span>
                      </div>
                      <div 
                        onClick={() => handleOpenWithApp(contextMenu.item!, 'text-editor')}
                        className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Text Editor</span>
                      </div>
                      <div 
                        onClick={() => handleOpenWithApp(contextMenu.item!, 'browser')}
                        className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer"
                      >
                        <FirefoxLogo className="w-3.5 h-3.5" />
                        <span>Firefox</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Open in Terminal (for Folders) */}
              {contextMenu.item.isDirectory && (
                <div 
                  onClick={() => handleOpenInTerminal(contextMenu.item!.path)}
                  className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer"
                >
                  <TerminalLogo className="w-3.5 h-3.5" />
                  <span>Open in Terminal</span>
                </div>
              )}

              {/* Download File */}
              {!contextMenu.item.isDirectory && (
                <div 
                  onClick={() => handleDownloadFile(contextMenu.item!)}
                  className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer text-emerald-400"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </div>
              )}

              <div className="h-px bg-neutral-800 my-1 mx-2" />

              {/* Cut */}
              <div 
                onClick={() => handleCut(contextMenu.item!)}
                className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Scissors className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cut</span>
                </div>
                <span className="text-[10px] opacity-60 font-mono">Ctrl+X</span>
              </div>

              {/* Copy */}
              <div 
                onClick={() => handleCopy(contextMenu.item!)}
                className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy</span>
                </div>
                <span className="text-[10px] opacity-60 font-mono">Ctrl+C</span>
              </div>

              {/* Duplicate */}
              <div 
                onClick={() => handleDuplicate(contextMenu.item!)}
                className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Files className="w-3.5 h-3.5 text-slate-400" />
                  <span>Duplicate</span>
                </div>
                <span className="text-[10px] opacity-60 font-mono">Ctrl+D</span>
              </div>

              <div className="h-px bg-neutral-800 my-1 mx-2" />

              {/* Rename */}
              <div 
                onClick={() => triggerRename(contextMenu.item!)}
                className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Rename...</span>
                </div>
                <span className="text-[10px] opacity-60 font-mono">F2</span>
              </div>

              {/* Move to Trash */}
              <div 
                onClick={() => handleMoveToTrash(contextMenu.item!)}
                className="px-3 py-1.5 hover:bg-red-600 hover:text-white rounded-md mx-1 flex items-center justify-between cursor-pointer text-red-400"
              >
                <div className="flex items-center space-x-2">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </div>
                <span className="text-[10px] opacity-60 font-mono">Del</span>
              </div>

              <div className="h-px bg-neutral-800 my-1 mx-2" />

              {/* Properties */}
              <div 
                onClick={() => {
                  setPropertiesItem(contextMenu.item);
                  setPropertiesTab('general');
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Info className="w-3.5 h-3.5 text-sky-400" />
                  <span>Properties</span>
                </div>
                <span className="text-[10px] opacity-60 font-mono">Alt+Enter</span>
              </div>
            </div>
          ) : (
            /* BACKGROUND CONTEXT MENU */
            <div>
              {/* New Folder */}
              <div 
                onClick={() => {
                  setContextMenu(prev => ({ ...prev, visible: false }));
                  setCreateModal({ open: true, type: 'folder' });
                  setCreateName('New Folder');
                }}
                className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center justify-between cursor-pointer font-medium"
              >
                <div className="flex items-center space-x-2">
                  <FolderPlus className="w-3.5 h-3.5 text-amber-500" />
                  <span>New Folder</span>
                </div>
                <span className="text-[10px] opacity-60 font-mono">Ctrl+Shift+N</span>
              </div>

              {/* New Document Submenu */}
              <div 
                onMouseEnter={() => setShowNewDocSubmenu(true)}
                onMouseLeave={() => setShowNewDocSubmenu(false)}
                className="relative px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <FilePlus className="w-3.5 h-3.5 text-sky-400" />
                  <span>New Document</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />

                {showNewDocSubmenu && (
                  <div className="absolute left-full top-0 ml-1 w-48 bg-neutral-900 text-slate-200 border border-neutral-700 rounded-xl shadow-2xl py-1 text-xs">
                    <div 
                      onClick={() => {
                        setContextMenu(prev => ({ ...prev, visible: false }));
                        setCreateModal({ open: true, type: 'file' });
                        setCreateName('untitled.txt');
                      }}
                      className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Empty Document</span>
                    </div>
                    <div 
                      onClick={() => {
                        setContextMenu(prev => ({ ...prev, visible: false }));
                        setCreateModal({ open: true, type: 'file' });
                        setCreateName('script.sh');
                      }}
                      className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer"
                    >
                      <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Shell Script (.sh)</span>
                    </div>
                    <div 
                      onClick={() => {
                        setContextMenu(prev => ({ ...prev, visible: false }));
                        setCreateModal({ open: true, type: 'file' });
                        setCreateName('config.json');
                      }}
                      className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer"
                    >
                      <FileJson className="w-3.5 h-3.5 text-indigo-400" />
                      <span>JSON Config (.json)</span>
                    </div>
                    <div 
                      onClick={() => {
                        setContextMenu(prev => ({ ...prev, visible: false }));
                        setCreateModal({ open: true, type: 'file' });
                        setCreateName('notes.md');
                      }}
                      className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Markdown (.md)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload File */}
              <div 
                onClick={() => {
                  setContextMenu(prev => ({ ...prev, visible: false }));
                  fileInputRef.current?.click();
                }}
                className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer text-emerald-400 font-medium"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File Here...</span>
              </div>

              <div className="h-px bg-neutral-800 my-1 mx-2" />

              {/* Paste */}
              <div 
                onClick={() => clipboard && handlePaste()}
                className={`px-3 py-1.5 rounded-md mx-1 flex items-center justify-between ${
                  clipboard 
                    ? 'hover:bg-sky-600 hover:text-white cursor-pointer' 
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Clipboard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Paste</span>
                </div>
                <span className="text-[10px] opacity-60 font-mono">Ctrl+V</span>
              </div>

              {/* Select All */}
              <div 
                onClick={() => {
                  setContextMenu(prev => ({ ...prev, visible: false }));
                  if (files.length > 0) setSelectedItem(files[0]);
                }}
                className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center justify-between cursor-pointer"
              >
                <span>Select All</span>
                <span className="text-[10px] opacity-60 font-mono">Ctrl+A</span>
              </div>

              <div className="h-px bg-neutral-800 my-1 mx-2" />

              {/* Open in Terminal */}
              <div 
                onClick={() => handleOpenInTerminal(currentPath)}
                className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center space-x-2 cursor-pointer"
              >
                <TerminalLogo className="w-3.5 h-3.5" />
                <span>Open in Terminal</span>
              </div>

              <div className="h-px bg-neutral-800 my-1 mx-2" />

              {/* Folder Properties */}
              <div 
                onClick={() => {
                  setPropertiesItem({
                    name: currentPath === '/' ? 'Home Sandbox' : currentPath.split('/').pop() || 'Folder',
                    path: currentPath,
                    isDirectory: true,
                    size: files.reduce((acc, f) => acc + f.size, 0),
                    modified: new Date().toISOString().replace('T', ' ').slice(0, 16),
                    permissions: '0755',
                    owner: 'user',
                    group: 'caelum-users'
                  });
                  setPropertiesTab('general');
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className="px-3 py-1.5 hover:bg-sky-600 hover:text-white rounded-md mx-1 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Info className="w-3.5 h-3.5 text-sky-400" />
                  <span>Properties</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. QUICK IN-APP FILE VIEWER / TEXT EDITOR MODAL                           */}
      {/* ========================================================================= */}
      {previewState && (
        <div 
          onClick={() => setPreviewState(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl text-slate-200 overflow-hidden flex flex-col h-[520px] animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
              <div className="flex items-center space-x-2.5 truncate">
                <FileText className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span className="font-bold text-xs text-slate-200 truncate">{previewState.file.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">({formatSize(previewState.file.size)})</span>
              </div>
              <div className="flex items-center space-x-2">
                {onOpenApp && (
                  <button 
                    onClick={() => {
                      onOpenApp('vscode', previewState.file.path);
                      setPreviewState(null);
                    }}
                    className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-sky-400 text-xs font-semibold cursor-pointer flex items-center space-x-1"
                    title="Open in Visual Studio Code"
                  >
                    <VscodeLogo className="w-3.5 h-3.5" />
                    <span>VS Code</span>
                  </button>
                )}
                <button 
                  onClick={handleSavePreview}
                  disabled={previewState.saving || previewState.loading}
                  className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{previewState.saving ? 'Saving...' : 'Save'}</span>
                </button>
                <button 
                  onClick={() => setPreviewState(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editor Body */}
            <div className="flex-1 p-3 bg-neutral-950 overflow-hidden flex flex-col">
              {previewState.loading ? (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-bold space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                  <span>Loading file content...</span>
                </div>
              ) : (
                <textarea 
                  value={previewState.content}
                  onChange={(e) => setPreviewState({ ...previewState, content: e.target.value })}
                  className="flex-1 w-full bg-neutral-950 text-slate-100 font-mono text-xs p-3 outline-none resize-none border-0 leading-relaxed"
                  placeholder="File content..."
                  spellCheck={false}
                />
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>{previewState.file.path}</span>
              <span>Lines: {previewState.content.split('\n').length} | Chars: {previewState.content.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. GNOME PROPERTIES MODAL DIALOG                                          */}
      {/* ========================================================================= */}
      {propertiesItem && (
        <div 
          onClick={() => setPropertiesItem(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl text-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <div className="flex items-center space-x-3 truncate">
                {getIcon(propertiesItem)}
                <div className="truncate">
                  <span className="font-bold text-sm text-slate-100 block truncate">{propertiesItem.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Properties</span>
                </div>
              </div>
              <button 
                onClick={() => setPropertiesItem(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-neutral-800 bg-neutral-900/90 px-3 pt-2 text-xs font-semibold">
              {[
                { id: 'general', label: 'General' },
                { id: 'permissions', label: 'Permissions' },
                { id: 'security', label: 'Security' },
                { id: 'openwith', label: 'Open With' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setPropertiesTab(tab.id as any)}
                  className={`px-3.5 py-2 border-b-2 cursor-pointer transition-colors ${
                    propertiesTab === tab.id 
                      ? 'border-sky-500 text-sky-400 font-bold' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Body */}
            <div className="p-5 text-xs space-y-4 max-h-[380px] overflow-y-auto">
              {/* TAB 1: GENERAL */}
              {propertiesTab === 'general' && (
                <div className="space-y-3">
                  <div className="flex justify-between py-1.5 border-b border-neutral-800">
                    <span className="text-slate-400 font-medium">Type:</span>
                    <span className="text-slate-200 font-semibold font-mono">
                      {propertiesItem.isDirectory 
                        ? 'Folder (inode/directory)' 
                        : propertiesItem.name.endsWith('.json') ? 'JSON Configuration (application/json)'
                        : propertiesItem.name.endsWith('.sh') ? 'Shell Script (text/x-shellscript)'
                        : propertiesItem.name.endsWith('.tf') ? 'Terraform Manifest (text/x-terraform)'
                        : 'Plain Document (text/plain)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-800">
                    <span className="text-slate-400 font-medium">Size:</span>
                    <span className="text-slate-200 font-mono">
                      {formatSize(propertiesItem.size)} ({propertiesItem.size.toLocaleString()} bytes)
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-800">
                    <span className="text-slate-400 font-medium">Parent Location:</span>
                    <span className="text-slate-200 font-mono truncate max-w-[220px]">
                      {propertiesItem.path.slice(0, propertiesItem.path.lastIndexOf('/')) || '/'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-800">
                    <span className="text-slate-400 font-medium">Storage Volume:</span>
                    <span className="text-slate-200 font-mono">Caelum NVMe Persistent Storage</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-800">
                    <span className="text-slate-400 font-medium">Created:</span>
                    <span className="text-slate-200 font-mono">{propertiesItem.created || '2026-09-26 12:00'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-800">
                    <span className="text-slate-400 font-medium">Modified:</span>
                    <span className="text-slate-200 font-mono">{propertiesItem.modified}</span>
                  </div>
                </div>
              )}

              {/* TAB 2: PERMISSIONS */}
              {propertiesTab === 'permissions' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="w-3.5 h-3.5 text-orange-400" />
                        <span className="font-bold text-slate-200">Owner ({propertiesItem.owner || 'user'})</span>
                      </div>
                      <select className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-slate-200 text-xs font-mono outline-none">
                        <option>Read and write</option>
                        <option>Read-only</option>
                        <option>None</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                      <div className="flex items-center space-x-2">
                        <User className="w-3.5 h-3.5 text-sky-400" />
                        <span className="font-bold text-slate-200">Group ({propertiesItem.group || 'caelum-users'})</span>
                      </div>
                      <select className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-slate-200 text-xs font-mono outline-none">
                        <option>Read and write</option>
                        <option>Read-only</option>
                        <option>None</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-200">Others</span>
                      </div>
                      <select className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-slate-200 text-xs font-mono outline-none">
                        <option>None</option>
                        <option>Read-only</option>
                        <option>Read and write</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800 flex justify-between items-center text-[11px] font-mono">
                    <span className="text-slate-400">Numerical Octal Notation:</span>
                    <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {propertiesItem.permissions || (propertiesItem.isDirectory ? '0755' : '0644')}
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 3: SECURITY */}
              {propertiesTab === 'security' && (
                <div className="space-y-3 font-mono text-[11px]">
                  <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Tenant Isolation</span>
                    <span className="text-emerald-400 block break-all">
                      Strict user-scoped sandbox (Zero cross-user leakage)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Volume Encryption</span>
                    <span className="text-slate-200 block">AES-256 Encrypted Persistent Workspace Storage</span>
                  </div>
                </div>
              )}

              {/* TAB 4: OPEN WITH */}
              {propertiesTab === 'openwith' && (
                <div className="space-y-3">
                  <span className="text-xs text-slate-400 block">
                    Choose the application used to open this file format:
                  </span>
                  <div className="space-y-1.5">
                    {[
                      { id: 'vscode', name: 'Visual Studio Code', icon: VscodeLogo, desc: 'Advanced Source Code Editor' },
                      { id: 'terminal', name: 'Caelum Terminal', icon: TerminalLogo, desc: 'System Command Line Emulator' },
                      { id: 'text-editor', name: 'Caelum Text Editor', icon: FileText, desc: 'Built-in Document Editor' },
                      { id: 'browser', name: 'Firefox Web Browser', icon: FirefoxLogo, desc: 'HTML & Web Inspector' }
                    ].map(app => (
                      <div 
                        key={app.id}
                        onClick={() => {
                          const updated = { ...propertiesItem, defaultApp: app.id as any };
                          setPropertiesItem(updated);
                          showToast(`Default application set to ${app.name}.`);
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          propertiesItem.defaultApp === app.id
                            ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                            : 'bg-neutral-950/40 border-neutral-800 hover:border-neutral-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <app.icon className="w-4.5 h-4.5" />
                          <div>
                            <span className="font-bold text-xs block">{app.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{app.desc}</span>
                          </div>
                        </div>
                        {propertiesItem.defaultApp === app.id && (
                          <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-white">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950/60 flex justify-end">
              <button 
                onClick={() => setPropertiesItem(null)}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. RENAME MODAL DIALOG                                                    */}
      {/* ========================================================================= */}
      {renameItem && (
        <div 
          onClick={() => setRenameItem(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl text-slate-200 p-5 space-y-4 animate-in zoom-in-95 duration-100"
          >
            <div className="flex items-center space-x-2.5">
              <Edit3 className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-sm text-slate-100">Rename File or Folder</h3>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">New Name</label>
              <input 
                type="text"
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmRename();
                  if (e.key === 'Escape') setRenameItem(null);
                }}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button 
                onClick={() => setRenameItem(null)}
                className="px-3.5 py-1.5 rounded-xl border border-neutral-700 hover:bg-white/10 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRename}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. CREATION MODAL DIALOG                                                  */}
      {/* ========================================================================= */}
      {createModal && (
        <div 
          onClick={() => setCreateModal(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl text-slate-200 p-5 space-y-4 animate-in zoom-in-95 duration-100"
          >
            <div className="flex items-center space-x-2.5">
              {createModal.type === 'folder' ? (
                <FolderPlus className="w-5 h-5 text-amber-500" />
              ) : (
                <FilePlus className="w-5 h-5 text-sky-400" />
              )}
              <h3 className="font-bold text-sm text-slate-100">
                {createModal.type === 'folder' ? 'Create New Folder' : 'Create New Document'}
              </h3>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">
                {createModal.type === 'folder' ? 'Folder Name' : 'File Name with extension'}
              </label>
              <input 
                type="text"
                autoFocus
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmCreate();
                  if (e.key === 'Escape') setCreateModal(null);
                }}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button 
                onClick={() => setCreateModal(null)}
                className="px-3.5 py-1.5 rounded-xl border border-neutral-700 hover:bg-white/10 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmCreate}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. TOAST NOTIFICATION WITH UNDO                                           */}
      {/* ========================================================================= */}
      {toast && (
        <div className="absolute bottom-4 right-4 z-40 bg-neutral-900/95 text-slate-100 border border-neutral-700 rounded-xl px-4 py-2.5 shadow-2xl flex items-center space-x-3 text-xs animate-in slide-in-from-bottom-2 duration-150">
          <span>{toast.message}</span>
          {toast.undoAction && (
            <button 
              onClick={() => {
                toast.undoAction!();
                setToast(null);
              }}
              className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo</span>
            </button>
          )}
          <button 
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
