"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, CornerDownLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const SUGGESTIONS = [
  "Deploy a secure, auto-scaling ECS Fargate cluster with CloudFront in AWS",
  "Set up a Kubernetes dev cluster with Prometheus & Grafana in Azure",
  "Create a highly available PostgreSQL database with replica & daily backups",
  "Build a Dockerized Node.js app deployment with SSL behind Nginx proxy"
];

interface AIInputProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

export default function AIInput({ onGenerate, isGenerating }: AIInputProps) {
  const [prompt, setPrompt] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");

  // Simulated typing effect for placeholder suggestions
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let charIndex = 0;
    const fullText = SUGGESTIONS[placeholderIndex];
    
    const type = () => {
      if (charIndex <= fullText.length) {
        setCurrentPlaceholder(fullText.substring(0, charIndex));
        charIndex++;
        timer = setTimeout(type, 30);
      } else {
        // Wait before switching to next suggestion
        timer = setTimeout(() => {
          setPlaceholderIndex((prev) => (prev + 1) % SUGGESTIONS.length);
        }, 3500);
      }
    };
    
    type();
    return () => clearTimeout(timer);
  }, [placeholderIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isGenerating) return;
    setPrompt(suggestion);
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-center space-y-6">
      
      {/* Headings */}
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/50 text-xs font-semibold text-purple-700 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation AI Infrastructure Orchestration</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight"
        >
          Generate Secure{' '}
          <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Infrastructure
          </span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto"
        >
          CaelumOS understands plain English and compiles it to production-grade Terraform, Kubernetes config, and security rules in seconds.
        </motion.p>
      </div>

      {/* Hero Prompt Box */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative group bg-white rounded-3xl border border-slate-200 shadow-lg shadow-purple-100/10 focus-within:border-purple-500/30 focus-within:shadow-xl focus-within:shadow-purple-100/30 p-3.5 transition-all duration-300"
      >
        <div className="flex flex-col space-y-2">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-2 text-slate-400">
            <span className="text-[10px] font-bold tracking-wider uppercase flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span>Caelum Prompt Engine v2.0</span>
            </span>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-medium font-mono">
              Auto-validate on
            </span>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder={currentPlaceholder ? `Describe your infrastructure, e.g.: "${currentPlaceholder}"` : "Describe your infrastructure or deployment needs in plain English..."}
            className="w-full min-h-[100px] resize-none outline-none border-none py-2 px-2 text-sm sm:text-base font-medium text-slate-800 placeholder-slate-400/90 leading-relaxed disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>

        {/* Generate Button - Pulsing effect */}
        <div className="mt-3">
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-4.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-sm tracking-wide shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 flex items-center justify-center space-x-2.5 active:scale-[0.99] relative overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed ${
              prompt.trim() && !isGenerating ? 'animate-pulse-slow' : ''
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Orchestrating Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white/95 group-hover/btn:rotate-12 transition-transform duration-300" />
                <span>Generate & Plan Deployment</span>
                <span className="hidden sm:inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-bold text-white/90 uppercase ml-2 border border-white/10">
                  <span>Enter</span>
                  <CornerDownLeft className="w-2.5 h-2.5" />
                </span>
              </>
            )}
            
            {/* Glossy overlay sheen */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-out" />
          </button>
        </div>
      </motion.form>

      {/* Suggested Chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-wrap items-center justify-center gap-2 px-4"
      >
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mr-1">
          Suggestions:
        </span>
        {SUGGESTIONS.slice(0, 3).map((suggestion, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isGenerating}
            onClick={() => handleSuggestionClick(suggestion)}
            className="text-xs bg-slate-50 border border-slate-200 text-slate-600 hover:text-purple-700 hover:border-purple-200 hover:bg-purple-50/30 px-3 py-1.5 rounded-full transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            {idx === 0 ? '🚀 ECS Fargate' : idx === 1 ? '☸️ Kubernetes' : '🗄️ PostgreSQL'}
          </button>
        ))}
      </motion.div>

    </div>
  );
}
