"use client";

import React, { useState, useRef, useEffect } from 'react';
import { apiRequest, getSocket } from '../../lib/api';
import { Terminal as TermIcon, Shield, Sparkles } from 'lucide-react';

interface TerminalAppProps {
  onOpenApp: (appId: string) => void;
}

interface LogLine {
  text?: string;
  type: 'input' | 'output' | 'success' | 'error' | 'info' | 'system' | 'code';
}

const INITIAL_LOGS: LogLine[] = [
  { text: "Welcome to CaelumOS AI Terminal v2.1 (Ubuntu GNOME Environment)", type: "system" },
  { text: "System load: 0.12, Memory usage: 42%, Disk usage: 12GB/120GB", type: "system" },
  { text: "Type 'help' to see available commands or describe your deployment goals.", type: "info" },
  { text: "", type: "output" }
];

const STREAM_CODE_TEMPLATE = `# Terraform configuration for AWS Fargate ECS Cluster
resource "aws_ecs_cluster" "caelum_core" {
  name = "caelum-production-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_task_definition" "web" {
  family                   = "caelum-web-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([
    {
      name      = "caelum-app"
      image     = "caelum/ai-core:latest"
      cpu       = 256
      memory    = 512
      essential = true
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
        }
      ]
    }
  ])
}`;

export default function TerminalApp({ onOpenApp }: TerminalAppProps) {
  const [logs, setLogs] = useState<LogLine[]>(INITIAL_LOGS);
  const [inputVal, setInputVal] = useState("");
  const [typingCode, setTypingCode] = useState(false);
  const [currentCode, setCurrentCode] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, currentCode]);

  // Connect to PTY Session over REST and WebSockets
  useEffect(() => {
    let activeSessionId: string | null = null;
    let socket: any = null;

    const initTerminal = async () => {
      try {
        const res = await apiRequest('/terminal/session', {
          method: 'POST',
        });
        activeSessionId = res.sessionId;
        setSessionId(activeSessionId);
        
        socket = getSocket();
        
        // Listen to backend PTY stdout stream
        socket.on('terminal-output', (payload: { sessionId: string; data: string }) => {
          if (payload.sessionId === activeSessionId) {
            setLogs(prev => [...prev, { text: payload.data, type: 'output' }]);
          }
        });

        // Seed initial terminal line command
        socket.emit('terminal-input', { sessionId: activeSessionId, data: 'echo "[CaelumOS] PTY Shell established successfully."\r\n' });
      } catch (err) {
        console.warn('Backend terminal API down, using client-side fallback simulation.', err);
      }
    };

    initTerminal();

    return () => {
      if (socket) {
        socket.off('terminal-output');
      }
      if (activeSessionId) {
        // Cleanup session
        apiRequest(`/terminal/session/${activeSessionId}`, { method: 'DELETE' }).catch(() => {});
      }
    };
  }, []);

  // Syntax Highlighter
  const highlightSyntax = (code: string) => {
    const lines = code.split('\n');
    return lines.map((line, lineIdx) => {
      const parts = line.split(/(\s+|[{}\[\]()=:",]|\bresource\b|\bprovider\b|\bname\b|\bvalue\b|\bimage\b|\bports\b|\bcontainerPort\b|\bhostPort\b|\bessential\b|\btrue\b|\bfalse\b)/);
      return (
        <div key={lineIdx} className="min-h-[1.25rem] font-mono whitespace-pre">
          {parts.map((part, partIdx) => {
            if (/^(resource|provider)$/.test(part)) {
              return <span key={partIdx} className="text-[#c792ea] font-semibold">{part}</span>;
            }
            if (/^(name|value|image|ports|containerPort|hostPort|essential)$/.test(part)) {
              return <span key={partIdx} className="text-[#f78c6c]">{part}</span>;
            }
            if (/^(true|false)$/.test(part)) {
              return <span key={partIdx} className="text-[#ffcb6b] font-bold">{part}</span>;
            }
            if (/^".*"$/.test(part) || /^'.*'$/.test(part)) {
              return <span key={partIdx} className="text-[#c3e88d]">{part}</span>;
            }
            if (/^[0-9]+$/.test(part)) {
              return <span key={partIdx} className="text-[#f78c6c]">{part}</span>;
            }
            if (part.trim().startsWith('#') || part.trim().startsWith('//')) {
              return <span key={partIdx} className="text-slate-500 italic">{part}</span>;
            }
            return <span key={partIdx} className="text-[#dfdbd2]">{part}</span>;
          })}
        </div>
      );
    });
  };

  const startCodeStreaming = () => {
    setTypingCode(true);
    setCurrentCode("");
    
    let charIndex = 0;
    const speed = 14;
    const interval = setInterval(() => {
      if (charIndex < STREAM_CODE_TEMPLATE.length) {
        const chunk = STREAM_CODE_TEMPLATE.slice(charIndex, charIndex + speed);
        setCurrentCode(prev => prev + chunk);
        charIndex += speed;
      } else {
        clearInterval(interval);
        setLogs(prev => [
          ...prev,
          { text: STREAM_CODE_TEMPLATE, type: 'code' },
          { text: "[Success] Compiled successfully in 1200ms!", type: 'success' },
          { text: "  - Security Grade: 96/100 (A)", type: 'success' },
          { text: "  - Cost Efficiency: 85/100 (B+)", type: 'success' },
          { text: "Type 'show-plan' or click on the Dashboard Dock icon to confirm deployment.", type: 'info' }
        ]);
        setTypingCode(false);
        setTimeout(() => {
          onOpenApp('dashboard');
        }, 600);
      }
    }, 16);
  };

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed || typingCode) return;

    // 1. If backend PTY session is connected, forward inputs directly to the shell
    if (sessionId) {
      try {
        const socket = getSocket();
        socket.emit('terminal-input', { sessionId, data: trimmed + '\r\n' });
        setInputVal("");
        return;
      } catch (err) {
        console.error(err);
      }
    }

    // 2. Client-side simulation fallback if no backend PTY is active
    const newLogs = [...logs, { text: `linux@caelum-os:~$ ${trimmed}`, type: 'input' as const }];
    setLogs(newLogs);
    setInputVal("");

    const parts = trimmed.split(" ");
    const primaryCmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    setTimeout(() => {
      if (primaryCmd === 'help') {
        setLogs(prev => [
          ...prev,
          { text: "Available commands:", type: 'info' },
          { text: "  deploy <prompt>  - Generate cloud config using AI (e.g., 'deploy AWS node app')", type: 'output' },
          { text: "  show-plan        - Launch CaelumOS Dashboard app to view code & metrics", type: 'output' },
          { text: "  neofetch         - Display CaelumOS Ubuntu system configuration specs", type: 'output' },
          { text: "  clear            - Clear terminal log output history", type: 'output' }
        ]);
      } else if (primaryCmd === 'clear') {
        setLogs([]);
      } else if (primaryCmd === 'neofetch') {
        setLogs(prev => [
          ...prev,
          { text: `
   .---.        linux@caelum-os
  /     \\       ---------------
  | (o) |       OS: CaelumOS AI 2.1 (Ubuntu-core base)
  \\     /       Kernel: 6.2.0-26-generic
   '---'        Uptime: 2 hours, 14 mins
  /  |  \\       Shell: bash 5.1.16
 /   |   \\      CPU: AI Orchestrator Core (4 vCPU)
/    |    \\     Memory: 4096MB / 8192MB
                Provider: Caelum-Kubernetes Cluster
                Security Grade: A (Secure)
                Cost Savings: 32% (Optimized)
          `, type: 'info' }
        ]);
      } else if (primaryCmd === 'show-plan') {
        setLogs(prev => [...prev, { text: "Launching Cloud Deploy Dashboard...", type: 'success' }]);
        onOpenApp('dashboard');
      } else if (primaryCmd === 'deploy') {
        if (!args) {
          setLogs(prev => [...prev, { text: "Error: Please specify what infrastructure to deploy. E.g. 'deploy an ECS cluster'", type: 'error' }]);
          return;
        }

        setLogs(prev => [
          ...prev,
          { text: `[CaelumOS AI] Parsing prompt: "${args}"`, type: 'info' },
          { text: "[CaelumOS AI] Fetching Terraform blueprints & AWS security groups...", type: 'info' },
          { text: "[CaelumOS AI] Streaming live infrastructure design code...", type: 'info' },
        ]);

        setTimeout(() => {
          startCodeStreaming();
        }, 600);

      } else {
        setLogs(prev => [
          ...prev,
          { text: `[CaelumOS AI] Interpreting command as deploy task: "${trimmed}"`, type: 'info' },
          { text: "[CaelumOS AI] Streaming live infrastructure design code...", type: 'info' },
        ]);

        setTimeout(() => {
          startCodeStreaming();
        }, 600);
      }
    }, 100);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#2c001e] text-[#dfdbd2] font-mono text-xs sm:text-sm p-4 overflow-hidden relative">
      
      {/* Scrollable logs */}
      <div className="flex-1 overflow-y-auto ubuntu-terminal-scroll space-y-1.5 pb-6 select-text">
        {logs.map((log, idx) => {
          let color = "text-[#dfdbd2]";
          if (log.type === 'input') color = "text-[#87df55] font-bold";
          else if (log.type === 'success') color = "text-emerald-400 font-bold";
          else if (log.type === 'error') color = "text-rose-400 font-bold";
          else if (log.type === 'info') color = "text-purple-300";
          else if (log.type === 'system') color = "text-[#729fcf] opacity-80";
          
          if (log.type === 'code') {
            return (
              <div key={idx} className="bg-black/40 border border-neutral-800/40 rounded-xl p-3 font-mono text-[11px] leading-relaxed my-2 overflow-x-auto select-text">
                {highlightSyntax(log.text || '')}
              </div>
            );
          }

          return (
            <div key={idx} className={`${color} whitespace-pre-wrap leading-relaxed`}>
              {log.text}
            </div>
          );
        })}

        {/* Real-time Code Typing Stream Container */}
        {typingCode && (
          <div className="bg-black/40 border border-neutral-800/40 rounded-xl p-3 font-mono text-[11px] leading-relaxed my-2 overflow-x-auto select-text">
            {highlightSyntax(currentCode)}
            <span className="inline-block w-1.5 h-4 bg-orange-500 animate-pulse ml-0.5 align-middle" />
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>

      {/* Input row */}
      <div className="border-t border-purple-950/40 pt-2 flex items-center bg-[#2c001e] z-10">
        <span className="text-[#87df55] font-bold select-none mr-2">linux@caelum-os:~$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCommand(inputVal);
            }
          }}
          disabled={typingCode}
          placeholder={typingCode ? "Streaming code..." : "Type command..."}
          className="flex-1 bg-transparent border-none outline-none text-[#dfdbd2] font-mono text-xs sm:text-sm caret-orange-500 disabled:opacity-50"
          autoFocus
        />
      </div>

    </div>
  );
}
