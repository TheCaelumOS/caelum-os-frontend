'use client';

import React, { useState } from 'react';
import { Terminal, Shield, Check, Copy, RefreshCw, X, ExternalLink, Cpu } from 'lucide-react';
import { setLocalPairingToken, getLocalPairingToken } from '../lib/localConnector';

interface LocalConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export default function LocalConnectorModal({ isOpen, onClose, onConnected }: LocalConnectorModalProps) {
  const [tokenInput, setTokenInput] = useState(getLocalPairingToken());
  const [saved, setSaved] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setLocalPairingToken(tokenInput);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      if (onConnected) onConnected();
      onClose();
    }, 800);
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const winCmd = `.\\start-connector.bat`;
  const npxCmd = `node desktop-agent/src/index.js`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Cpu className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">CaelumOS Local Infrastructure Connector</h3>
              <p className="text-[11px] text-slate-400 font-mono">Bridge to your local Docker Desktop &amp; Minikube / K8s</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Privacy & Architecture Notice */}
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-start space-x-3 text-purple-200">
            <Shield className="w-4.5 h-4.5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px] leading-relaxed">
              <span className="font-bold text-white block">100% Private Local Execution</span>
              <p className="text-purple-300">
                CaelumOS connects directly to your computer via loopback (<code>127.0.0.1:48721</code>).
                Your containers, kubeconfig, and credentials are <strong>never sent to the cloud</strong>.
              </p>
            </div>
          </div>

          {/* Step 1: Run connector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-xs flex items-center space-x-1.5">
                <span className="w-4.5 h-4.5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-mono text-purple-400">1</span>
                <span>Start the connector on your computer</span>
              </span>
            </div>
            <div className="relative group bg-black/60 border border-neutral-800 rounded-xl p-3 font-mono text-[11px] flex items-center justify-between text-slate-300">
              <code>{winCmd}</code>
              <button
                onClick={() => copyCommand(winCmd)}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-slate-300 hover:text-white transition flex items-center space-x-1 text-[10px] cursor-pointer"
              >
                {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Or run in terminal: <code className="text-slate-300 bg-neutral-800 px-1 py-0.5 rounded">{npxCmd}</code>
            </p>
          </div>

          {/* Step 2: Enter Pairing Key */}
          <div className="space-y-2">
            <span className="font-bold text-slate-200 text-xs flex items-center space-x-1.5">
              <span className="w-4.5 h-4.5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-mono text-purple-400">2</span>
              <span>Paste your Connector Pairing Key</span>
            </span>
            <div className="space-y-1.5">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="e.g. caelum_93524457c04280c0b7da06629d3af722"
                className="w-full bg-black/60 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-purple-500 transition"
              />
              <span className="text-[10px] text-slate-400 block">
                Found in your connector console output upon startup.
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-slate-300 hover:text-white transition text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition text-xs font-bold shadow-md shadow-purple-600/30 flex items-center space-x-1.5 cursor-pointer"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Paired &amp; Saved!</span>
                </>
              ) : (
                <span>Save &amp; Connect Local</span>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
