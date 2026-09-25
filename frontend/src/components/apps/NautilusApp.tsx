"use client";

import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../lib/api';
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
  Globe
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

interface NautilusAppProps {
  onOpenApp?: (appId: string, param?: string) => void;
}

const INITIAL_SANDBOX_FILES: Record<string, FileItem[]> = {
  '/': [
    { name: 'Projects', path: '/Projects', isDirectory: true, size: 4096, modified: '2026-09-21 18:30', created: '2026-09-15 10:00', permissions: '0755', owner: 'linux', group: 'caelum-dev' },
    { name: 'Terraform', path: '/Terraform', isDirectory: true, size: 4096, modified: '2026-09-20 14:12', created: '2026-09-16 08:30', permissions: '0755', owner: 'linux', group: 'caelum-dev' },
    { name: 'Scripts', path: '/Scripts', isDirectory: true, size: 4096, modified: '2026-09-21 11:05', created: '2026-09-17 14:20', permissions: '0755', owner: 'linux', group: 'caelum-dev' },
    { name: 'Documents', path: '/Documents', isDirectory: true, size: 4096, modified: '2026-09-18 09:40', created: '2026-09-18 09:00', permissions: '0755', owner: 'linux', group: 'caelum-dev' },
    { name: 'docker-compose.yml', path: '/docker-compose.yml', isDirectory: false, size: 2840, modified: '2026-09-21 16:45', created: '2026-09-19 12:00', permissions: '0644', owner: 'linux', group: 'caelum-dev', defaultApp: 'vscode', sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08' },
    { name: 'caelum-spec.json', path: '/caelum-spec.json', isDirectory: false, size: 4120, modified: '2026-09-21 17:10', created: '2026-09-20 11:30', permissions: '0644', owner: 'linux', group: 'caelum-dev', defaultApp: 'vscode', sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8' },
    { name: 'README.md', path: '/README.md', isDirectory: false, size: 1420, modified: '2026-09-19 20:00', created: '2026-09-15 09:00', permissions: '0644', owner: 'linux', group: 'caelum-dev', defaultApp: 'vscode', sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a' },
    { name: 'caelum-init.sh', path: '/caelum-init.sh', isDirectory: false, size: 890, modified: '2026-09-21 12:00', created: '2026-09-21 10:00', permissions: '0755', owner: 'linux', group: 'caelum-dev', defaultApp: 'terminal', sha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d' }
  ],
  '/Projects': [
    { name: 'caelum-core', path: '/Projects/caelum-core', isDirectory: true, size: 4096, modified: '2026-09-21 18:00', created: '2026-09-16 11:00', permissions: '0755', owner: 'linux', group: 'caelum-dev' },
    { name: 'cloud-infra', path: '/Projects/cloud-infra', isDirectory: true, size: 4096, modified: '2026-09-20 15:30', created: '2026-09-17 09:15', permissions: '0755', owner: 'linux', group: 'caelum-dev' },
    { name: 'app.ts', path: '/Projects/app.ts', isDirectory: false, size: 3450, modified: '2026-09-21 17:22', created: '2026-09-18 14:00', permissions: '0644', owner: 'linux', group: 'caelum-dev', defaultApp: 'vscode', sha256: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad' },
    { name: 'package.json', path: '/Projects/package.json', isDirectory: false, size: 1280, modified: '2026-09-21 14:10', created: '2026-09-16 11:05', permissions: '0644', owner: 'linux', group: 'caelum-dev', defaultApp: 'vscode', sha256: 'cb8379ac2098aa165029e3938a51da0bcecfc008fd6795f401178647f96c5b34' }
  ],
  '/Scripts': [
    { name: 'deploy.sh', path: '/Scripts/deploy.sh', isDirectory: false, size: 1540, modified: '2026-09-21 10:15', created: '2026-09-18 08:30', permissions: '0755', owner: 'linux', group: 'caelum-dev', defaultApp: 'terminal', sha256: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae' },
    { name: 'healthcheck.sh', path: '/Scripts/healthcheck.sh', isDirectory: false, size: 920, modified: '2026-09-20 19:40', created: '2026-09-18 09:00', permissions: '0755', owner: 'linux', group: 'caelum-dev', defaultApp: 'terminal', sha256: 'fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9' },
    { name: 'backup.sh', path: '/Scripts/backup.sh', isDirectory: false, size: 1840, modified: '2026-09-19 08:30', created: '2026-09-17 12:00', permissions: '0755', owner: 'linux', group: 'caelum-dev', defaultApp: 'terminal', sha256: '3a52ce780950d4d969792a2559cd519d7ee8c727f55e3cf97388a183646296dc' }
  ],
  '/Terraform': [
    { name: 'main.tf', path: '/Terraform/main.tf', isDirectory: false, size: 2310, modified: '2026-09-20 14:10', created: '2026-09-16 08:30', permissions: '0644', owner: 'linux', group: 'caelum-dev', defaultApp: 'vscode', sha256: '044852b2a6703b057f91323be202dd163c92f034347076a5996b1f24d4b1a206' },
    { name: 'variables.tf', path: '/Terraform/variables.tf', isDirectory: false, size: 980, modified: '2026-09-20 14:11', created: '2026-09-16 08:35', permissions: '0644', owner: 'linux', group: 'caelum-dev', defaultApp: 'vscode', sha256: '1406e330a10dfb9eec4d57cff5b62b1ec456201e7e4eb1308a0d0d8ec8ba43ae' },
    { name: 'terraform.tfstate', path: '/Terraform/terraform.tfstate', isDirectory: false, size: 8450, modified: '2026-09-20 14:12', created: '2026-09-16 08:40', permissions: '0600', owner: 'linux', group: 'caelum-dev', defaultApp: 'vscode', sha256: 'a2c4ba93c20202e86efebf6110fa9569766d9333917a14e9f74a00508a8e104f' }
  ],
  '/Documents': [
    { name: 'architecture-notes.txt', path: '/Documents/architecture-notes.txt', isDirectory: false, size: 3200, modified: '2026-09-18 09:30', created: '2026-09-18 09:00', permissions: '0644', owner: 'linux', group: 'caelum-dev', defaultApp: 'vscode', sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8' },
    { name: 'network-topology.md', path: '/Documents/network-topology.md', isDirectory: false, size: 5400, modified: '2026-09-18 09:40', created: '2026-09-18 09:15', permissions: '0644', owner: 'linux', group: 'caelum-dev', defaultApp: 'vscode', sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a' }
  ]
};

export default function NautilusApp({ onOpenApp }: NautilusAppProps) {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [history, setHistory] = useState<string[]>(['/']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [localFs, setLocalFs] = useState<Record<string, FileItem[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('caelum_nautilus_fs');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_SANDBOX_FILES;
  });

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchVal, setSearchVal] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);

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

  // Sync to local storage
  const saveFs = (newFs: Record<string, FileItem[]>) => {
    setLocalFs(newFs);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('caelum_nautilus_fs', JSON.stringify(newFs));
      } catch {}
    }
  };

  // Fetch or retrieve files for current directory
  const loadDirectory = async (path: string) => {
    setLoading(true);
    try {
      // Try backend endpoint first
      const data = await apiRequest(`/filesystem/list?path=${encodeURIComponent(path)}`);
      if (Array.isArray(data) && data.length > 0) {
        setFiles(data);
        setLoading(false);
        return;
      }
    } catch {
      // Offline fallback: Use local sandbox filesystem
    }

    const currentFiles = localFs[path] || [];
    setFiles(currentFiles);
    setLoading(false);
  };

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath, localFs]);

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
    
    // Calculate coordinates with boundary protection
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
      if (y + 280 > window.innerHeight) y = window.innerHeight - 290;
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
  // FILE MANAGEMENT ACTIONS
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

    const { item, operation, sourcePath } = clipboard;
    const destFiles = localFs[targetPath] || [];

    // Determine unique name if already exists
    let newName = item.name;
    let counter = 1;
    while (destFiles.some(f => f.name === newName)) {
      const ext = item.name.includes('.') ? item.name.slice(item.name.lastIndexOf('.')) : '';
      const base = item.name.includes('.') ? item.name.slice(0, item.name.lastIndexOf('.')) : item.name;
      newName = `${base} (copy${counter > 1 ? ` ${counter}` : ''})${ext}`;
      counter++;
    }

    const newItem: FileItem = {
      ...item,
      name: newName,
      path: targetPath === '/' ? `/${newName}` : `${targetPath}/${newName}`,
      modified: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    const newFs = { ...localFs };

    if (operation === 'cut') {
      // Remove from source path
      const srcFiles = (newFs[sourcePath] || []).filter(f => f.name !== item.name);
      newFs[sourcePath] = srcFiles;
      newFs[targetPath] = [...(newFs[targetPath] || []), newItem];
      setClipboard(null); // Clear cut clipboard
      showToast(`Moved "${item.name}" to ${targetPath === '/' ? 'root' : targetPath}.`);
    } else {
      // Duplicate / Copy
      newFs[targetPath] = [...(newFs[targetPath] || []), newItem];
      showToast(`Pasted "${newName}" into ${targetPath === '/' ? 'root' : targetPath}.`);
    }

    saveFs(newFs);

    // If backend is active, trigger move API
    try {
      if (operation === 'cut') {
        await apiRequest('/filesystem/move', {
          method: 'POST',
          body: JSON.stringify({ source: item.path, destination: newItem.path })
        });
      }
    } catch {}
  };

  // 4. Duplicate
  const handleDuplicate = (item: FileItem) => {
    setContextMenu(prev => ({ ...prev, visible: false }));
    const currentFiles = localFs[currentPath] || [];
    
    const ext = item.name.includes('.') ? item.name.slice(item.name.lastIndexOf('.')) : '';
    const base = item.name.includes('.') ? item.name.slice(0, item.name.lastIndexOf('.')) : item.name;
    let newName = `${base} (copy)${ext}`;
    let counter = 1;
    while (currentFiles.some(f => f.name === newName)) {
      counter++;
      newName = `${base} (copy ${counter})${ext}`;
    }

    const dupItem: FileItem = {
      ...item,
      name: newName,
      path: currentPath === '/' ? `/${newName}` : `${currentPath}/${newName}`,
      modified: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    const newFs = {
      ...localFs,
      [currentPath]: [...currentFiles, dupItem]
    };
    saveFs(newFs);
    showToast(`Duplicated "${item.name}" as "${newName}".`);
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

    const currentFiles = localFs[currentPath] || [];
    const newName = renameValue.trim();
    const newPath = currentPath === '/' ? `/${newName}` : `${currentPath}/${newName}`;

    const updated = currentFiles.map(f => {
      if (f.name === renameItem.name) {
        return { ...f, name: newName, path: newPath, modified: new Date().toISOString().replace('T', ' ').slice(0, 16) };
      }
      return f;
    });

    const newFs = { ...localFs, [currentPath]: updated };
    saveFs(newFs);
    showToast(`Renamed to "${newName}".`);

    try {
      await apiRequest('/filesystem/move', {
        method: 'POST',
        body: JSON.stringify({ source: renameItem.path, destination: newPath })
      });
    } catch {}

    setRenameItem(null);
  };

  // 6. Move to Trash
  const handleMoveToTrash = async (item: FileItem) => {
    setContextMenu(prev => ({ ...prev, visible: false }));
    const currentFiles = localFs[currentPath] || [];
    const remaining = currentFiles.filter(f => f.name !== item.name);

    const newFs = { ...localFs, [currentPath]: remaining };
    saveFs(newFs);

    // Provide Undo action in toast
    showToast(`"${item.name}" moved to Rubbish Bin.`, () => {
      const restoredFs = {
        ...localFs,
        [currentPath]: [...(localFs[currentPath] || []), item]
      };
      saveFs(restoredFs);
      showToast(`Restored "${item.name}".`);
    });

    try {
      await apiRequest('/filesystem/delete', {
        method: 'POST',
        body: JSON.stringify({ path: item.path })
      });
    } catch {}
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

    const newItem: FileItem = {
      name,
      path: filePath,
      isDirectory: isDir,
      size: isDir ? 4096 : 120,
      modified: new Date().toISOString().replace('T', ' ').slice(0, 16),
      created: new Date().toISOString().replace('T', ' ').slice(0, 16),
      permissions: isDir ? '0755' : name.endsWith('.sh') ? '0755' : '0644',
      owner: 'linux',
      group: 'caelum-dev',
      defaultApp: isDir ? undefined : name.endsWith('.sh') ? 'terminal' : name.endsWith('.html') ? 'browser' : 'vscode',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    };

    const currentFiles = localFs[currentPath] || [];
    const newFs = {
      ...localFs,
      [currentPath]: [...currentFiles, newItem]
    };
    if (isDir) {
      newFs[filePath] = [];
    }

    saveFs(newFs);
    showToast(`Created ${isDir ? 'folder' : 'file'} "${name}".`);

    try {
      if (isDir) {
        await apiRequest('/filesystem/mkdir', {
          method: 'POST',
          body: JSON.stringify({ path: filePath })
        });
      } else {
        await apiRequest('/filesystem/write', {
          method: 'POST',
          body: JSON.stringify({ path: filePath, content: '# Created in CaelumOS\n' })
        });
      }
    } catch {}

    setCreateModal(null);
  };

  // Open item with default application
  const handleOpenItem = (item: FileItem) => {
    setContextMenu(prev => ({ ...prev, visible: false }));
    if (item.isDirectory) {
      navigateTo(item.path);
      return;
    }

    const app = item.defaultApp || (item.name.endsWith('.sh') ? 'terminal' : item.name.endsWith('.html') ? 'browser' : 'vscode');
    if (onOpenApp) {
      onOpenApp(app, item.path);
    } else {
      showToast(`Opening "${item.name}" in ${app.toUpperCase()}...`);
    }
  };

  // Open with specified application
  const handleOpenWithApp = (item: FileItem, appId: 'vscode' | 'terminal' | 'browser' | 'text-editor') => {
    setContextMenu(prev => ({ ...prev, visible: false }));
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
    if (ext === 'sh') return <TerminalIcon className="w-10 h-10 text-emerald-500" />;
    if (ext === 'md' || ext === 'txt') return <FileText className="w-10 h-10 text-slate-500" />;
    if (ext === 'html' || ext === 'svg') return <Globe className="w-10 h-10 text-blue-500" />;
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
            <span>{currentPath === '/' ? 'Home Sandbox (/)' : currentPath}</span>
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
            placeholder="Search folder..."
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
            {[
              { id: '/', label: 'Root Sandbox' },
              { id: '/Projects', label: 'Projects' },
              { id: '/Terraform', label: 'Terraform' },
              { id: '/Scripts', label: 'Scripts' },
              { id: '/Documents', label: 'Documents' }
            ].map(loc => (
              <button
                key={loc.id}
                onClick={() => navigateTo(loc.id)}
                className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg font-bold cursor-pointer transition-colors text-left truncate ${
                  currentPath === loc.id ? 'bg-[#c9c5ba] text-slate-900' : 'hover:bg-slate-300/40'
                }`}
              >
                <HardDrive className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="truncate">{loc.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-[#c1beb5]/60 space-y-2">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Workspace Storage</span>
            <div className="text-[10px] text-slate-500 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Free:</span>
                <span className="font-bold text-slate-700">184.2 GB</span>
              </div>
              <div className="w-full bg-slate-300 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[28%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right workspace view */}
        <div 
          onClick={() => setSelectedItem(null)}
          className="flex-grow bg-[#fcfbfa] overflow-y-auto p-5 select-text relative"
        >
          {filteredFiles.length === 0 ? (
            <div className="text-center py-24 text-xs text-slate-400 font-bold">
              This folder is empty. Right-click here to create a new folder or file.
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
                  <span>Move to Trash</span>
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
                    name: currentPath === '/' ? 'Root Sandbox' : currentPath.split('/').pop() || 'Folder',
                    path: currentPath,
                    isDirectory: true,
                    size: files.reduce((acc, f) => acc + f.size, 0),
                    modified: new Date().toISOString().replace('T', ' ').slice(0, 16),
                    permissions: '0755',
                    owner: 'linux',
                    group: 'caelum-dev'
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
      {/* 4. GNOME PROPERTIES MODAL DIALOG                                          */}
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
                    <span className="text-slate-400 font-medium">Volume:</span>
                    <span className="text-slate-200 font-mono">Caelum NVMe (/dev/nvme0n1p2)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-800">
                    <span className="text-slate-400 font-medium">Created:</span>
                    <span className="text-slate-200 font-mono">{propertiesItem.created || '2026-09-18 10:00'}</span>
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
                        <span className="font-bold text-slate-200">Owner (linux)</span>
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
                        <span className="font-bold text-slate-200">Group (caelum-dev)</span>
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
                        <option>Read-only</option>
                        <option>None</option>
                        <option>Read and write</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        defaultChecked={propertiesItem.permissions?.includes('7') || propertiesItem.name.endsWith('.sh')} 
                        className="rounded accent-sky-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-slate-300 font-medium">Allow executing file as program</span>
                    </label>
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
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">SELinux Security Context</span>
                    <span className="text-emerald-400 block break-all">
                      unconfined_u:object_r:user_home_t:s0
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">SHA-256 Checksum</span>
                    <span className="text-sky-400 block break-all text-[10px]">
                      {propertiesItem.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Volume Encryption</span>
                    <span className="text-slate-200 block">LUKS2 256-bit AES-XTS Encrypted Storage</span>
                  </div>
                </div>
              )}

              {/* TAB 4: OPEN WITH */}
              {propertiesTab === 'openwith' && (
                <div className="space-y-3">
                  <span className="text-xs text-slate-400 block">
                    Choose the application used to open this file format by default:
                  </span>
                  <div className="space-y-1.5">
                    {[
                      { id: 'vscode', name: 'Visual Studio Code', icon: VscodeLogo, desc: 'Advanced Source Code Editor' },
                      { id: 'terminal', name: 'Caelum Terminal', icon: TerminalLogo, desc: 'System Command Line Emulator' },
                      { id: 'browser', name: 'Firefox Web Browser', icon: FirefoxLogo, desc: 'HTML & Web Inspector' }
                    ].map(app => (
                      <div 
                        key={app.id}
                        onClick={() => {
                          const updated = { ...propertiesItem, defaultApp: app.id as any };
                          setPropertiesItem(updated);
                          // Save in current directory
                          const currentFiles = localFs[currentPath] || [];
                          const nextFiles = currentFiles.map(f => f.name === updated.name ? updated : f);
                          saveFs({ ...localFs, [currentPath]: nextFiles });
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
      {/* 5. RENAME MODAL DIALOG                                                    */}
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
      {/* 6. CREATION MODAL DIALOG                                                  */}
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
      {/* 7. TOAST NOTIFICATION WITH UNDO                                           */}
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
