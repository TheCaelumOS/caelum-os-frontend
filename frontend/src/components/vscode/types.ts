export interface WorkspaceFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isModified?: boolean;
  isDirectory?: boolean;
  children?: WorkspaceFile[];
  handle?: any; // Browser FileSystemFileHandle or FileSystemDirectoryHandle
}

export interface EditorTab {
  id: string;
  fileId: string;
  name: string;
  path: string;
  language: string;
  isModified: boolean;
}

export type ActivityBarTab = 'explorer' | 'search' | 'git' | 'debug' | 'extensions' | 'settings';

export type BottomPanelTab = 'terminal' | 'problems' | 'output' | 'debug';

export interface DiagnosticProblem {
  id: string;
  file: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  source?: string;
}

export interface ExtensionItem {
  id: string;
  name: string;
  displayName: string;
  version: string;
  publisher: string;
  description: string;
  icon: string;
  installed: boolean;
  downloads?: string;
  rating?: number;
}
