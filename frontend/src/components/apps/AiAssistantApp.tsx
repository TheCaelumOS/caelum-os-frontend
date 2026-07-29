"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Cpu, ShieldAlert, BadgeDollarSign } from 'lucide-react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export default function AiAssistantApp() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your CaelumOS Cloud AI Assistant. Describe the infrastructure layout or automation pipeline you want to deploy, and I will generate the required configurations.',
      timestamp: 'Just now',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const presets = [
    "Provision a high-availability ECS cluster on AWS",
    "Set up an AKS cluster with autoscaling enabled",
    "Validate my Terraform configurations for security",
    "Explain Docker Compose networking rules"
  ];

  const handleSend = (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      let aiText = "I've analyzed your request. Let me generate the cloud blueprints for you. Opening Terraform planner and system dashboard...";
      if (text.toLowerCase().includes('aws') || text.toLowerCase().includes('ecs')) {
        aiText = "Analyzing AWS topology guidelines... I recommend deploying an ECS Fargate cluster inside a multi-AZ VPC. Launching the AWS Cloud dashboard and preparing Terraform blueprints.";
      } else if (text.toLowerCase().includes('aks') || text.toLowerCase().includes('azure')) {
        aiText = "Fetching Azure AKS blueprints... We will enable Azure Active Directory integration and Azure CNI for performance. Opening Azure Resource Manager.";
      } else if (text.toLowerCase().includes('security') || text.toLowerCase().includes('validate')) {
        aiText = "Scanning infrastructure-as-code scripts... I am running tfsec to analyze potential access control lists vulnerabilities. Check the Terraform console logs for details.";
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
    }, 1200);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex-grow flex flex-col bg-[#111111] text-slate-100 min-h-0 select-text font-sans">
      {/* Header bar */}
      <div className="p-4 border-b border-neutral-850 bg-[#151518] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-purple-600/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200">CaelumOS AI Co-Pilot</h3>
            <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider block font-mono">LLM Engine: Online</span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-[#0c0c0e]">
        {messages.map(msg => {
          const isAi = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex items-start gap-3 max-w-[85%] ${isAi ? '' : 'ml-auto flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                isAi 
                  ? 'bg-purple-600/10 border-purple-500/20 text-purple-400' 
                  : 'bg-neutral-800 border-neutral-700 text-slate-350'
              }`}>
                {isAi ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
              </div>
              <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                isAi 
                  ? 'bg-[#151518] border border-neutral-850 text-slate-200' 
                  : 'bg-purple-600 text-white shadow-md'
              }`}>
                {msg.text}
                <span className="block text-[8px] opacity-40 text-right mt-1.5 font-mono">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-600/10 border border-purple-500/20 text-purple-400">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div className="p-3 bg-[#151518] border border-neutral-850 rounded-2xl text-xs text-slate-400 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Preset prompt pills */}
      {messages.length <= 1 && (
        <div className="p-3 bg-[#0c0c0e] border-t border-neutral-900 flex-shrink-0">
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">Quick Actions</span>
          <div className="flex flex-wrap gap-2">
            {presets.map(p => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                className="text-[10px] bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-850 hover:border-neutral-750 px-2.5 py-1.5 rounded-lg text-slate-450 hover:text-slate-200 transition-all text-left cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-3.5 border-t border-neutral-850 bg-[#151518] flex items-center space-x-2.5 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend(input);
          }}
          placeholder="Ask AI Assistant to build or optimize deployments..."
          className="flex-grow bg-[#0c0c0e] border border-neutral-800 rounded-xl px-4 py-2 text-xs text-slate-200 outline-none focus:border-purple-500 transition-colors"
        />
        <button
          onClick={() => handleSend(input)}
          className="p-2 bg-purple-650 hover:bg-purple-600 active:scale-95 text-white rounded-xl shadow-lg shadow-purple-900/20 transition-all cursor-pointer"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
}
