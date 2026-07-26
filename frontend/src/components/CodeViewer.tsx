"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Download, ExternalLink, Sparkles, BookOpen, Terminal } from 'lucide-react';

interface CodeViewerProps {
  files: {
    Terraform: string;
    Dockerfile: string;
    'Kubernetes YAML': string;
    JSON: string;
  };
  explanations: {
    Terraform: string;
    Dockerfile: string;
    'Kubernetes YAML': string;
    JSON: string;
  };
  isGenerating: boolean;
}

type TabType = 'Terraform' | 'Dockerfile' | 'Kubernetes YAML' | 'JSON';

export default function CodeViewer({ files, explanations, isGenerating }: CodeViewerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('Terraform');
  const [copied, setCopied] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [activeTab]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(files[activeTab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleExport = () => {
    const fileExtension = 
      activeTab === 'Terraform' ? 'tf' :
      activeTab === 'Dockerfile' ? 'dockerfile' :
      activeTab === 'Kubernetes YAML' ? 'yaml' : 'json';
    
    const blob = new Blob([files[activeTab]], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `caelum-deployment.${fileExtension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col h-[520px]">
      
      {/* Code Viewer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 border-b border-slate-100 p-4 gap-3">
        
        {/* Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {(['Terraform', 'Dockerfile', 'Kubernetes YAML', 'JSON'] as TabType[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                disabled={isGenerating}
                className="relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                style={{
                  color: isActive ? '#7c3aed' : '#64748b',
                  backgroundColor: isActive ? '#f5f3ff' : 'transparent',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCodeTab"
                    className="absolute inset-0 border border-purple-200/50 rounded-xl"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <span>{tab}</span>
              </button>
            );
          })}
        </div>

        {/* Actions Button Group */}
        <div className="flex items-center space-x-1.5 sm:self-center self-end">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100/50 text-slate-600 hover:text-slate-900 text-xs font-semibold shadow-sm transition-all"
            title="Copy Code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600 stroke-[3]" />
                <span className="text-green-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100/50 text-slate-600 hover:text-slate-900 text-xs font-semibold shadow-sm transition-all"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Export</span>
          </button>

          {/* Manage Cloud Button */}
          <button
            onClick={() => alert("Connecting to Cloud Console to configure credentials...")}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100/50 text-slate-600 hover:text-slate-900 text-xs font-semibold shadow-sm transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Manage Cloud</span>
          </button>

          {/* Explain Simply Button */}
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all ${
              showExplanation 
                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explain Simply</span>
          </button>
        </div>

      </div>

      {/* Main Area (Split: Code & Explanation Panel) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Code Content */}
        <div className="flex-1 overflow-auto p-5 bg-[#0f0b18] text-[#f8f6fc] font-mono text-xs sm:text-[13px] leading-relaxed select-text relative">
          
          {isGenerating ? (
            <div className="absolute inset-0 bg-[#0f0b18]/90 flex flex-col items-center justify-center space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                <Terminal className="w-4 h-4 text-purple-400 absolute" />
              </div>
              <p className="text-slate-400 font-semibold text-xs tracking-wider uppercase animate-pulse">
                Compiling Plain English to {activeTab}...
              </p>
            </div>
          ) : null}

          <pre className="whitespace-pre overflow-x-auto">
            <code>{files[activeTab]}</code>
          </pre>
        </div>

        {/* Sliding Explanation Panel */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-[350px] bg-white border-l border-slate-200 shadow-2xl p-5 flex flex-col justify-between z-10"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center space-x-2 text-purple-700">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-bold text-xs tracking-wider uppercase">Simple Explanation</span>
                  </div>
                  <button
                    onClick={() => setShowExplanation(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 rounded hover:bg-slate-100"
                  >
                    Close
                  </button>
                </div>
                
                <div className="space-y-4 text-slate-600 text-xs leading-relaxed overflow-y-auto max-h-[380px]">
                  {explanations[activeTab].split('\n\n').map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </div>
              
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-[10px] font-semibold text-purple-700">
                🚀 Need custom modifications? Just ask the AI prompt box to update these settings!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
