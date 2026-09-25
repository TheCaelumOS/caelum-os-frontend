import React from 'react';
import { FileCode, FileText, FileJson } from 'lucide-react';

export function getFileIcon(fileName: string): React.ReactNode {
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
