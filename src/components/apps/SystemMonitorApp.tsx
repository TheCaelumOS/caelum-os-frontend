"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Activity, Cpu, ShieldAlert, Database } from 'lucide-react';

interface ResourceGraphProps {
  label: string;
  color: string;
  value: string;
  data: number[];
}

function ResourceGraph({ label, color, value, data }: ResourceGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 300);
    const height = (canvas.height = 70);

    ctx.clearRect(0, 0, width, height);

    // Draw GNOME-style grids
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 0.8;
    const gridSpacing = 14;
    for (let x = 0; x < width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Plot values
    if (data.length > 0) {
      ctx.beginPath();
      const step = width / 39;
      ctx.moveTo(0, height - (data[0] / 100) * height * 0.8 - 5);
      
      for (let i = 1; i < data.length; i++) {
        const x = i * step;
        const y = height - (data[i] / 100) * height * 0.8 - 5;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Shadow overlay fill
      ctx.lineTo((data.length - 1) * step, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, color + '20');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }, [data, color]);

  return (
    <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-3.5 space-y-2">
      <div className="flex justify-between items-center text-[10px] sm:text-xs">
        <span className="font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="font-extrabold font-mono text-sm" style={{ color }}>{value}</span>
      </div>
      <div className="w-full bg-[#111111] rounded-lg overflow-hidden border border-neutral-900">
        <canvas ref={canvasRef} className="w-full block" />
      </div>
    </div>
  );
}

export default function SystemMonitorApp() {
  const [cpu, setCpu] = useState<number[]>(Array(40).fill(25));
  const [net, setNet] = useState<number[]>(Array(40).fill(40));
  const [mem, setMem] = useState<number[]>(Array(40).fill(52));

  useEffect(() => {
    const updateStats = () => {
      setCpu(prev => {
        const nextVal = Math.max(10, Math.min(95, prev[prev.length - 1] + (Math.random() - 0.5) * 12));
        return [...prev.slice(1), nextVal];
      });
      setNet(prev => {
        const nextVal = Math.max(15, Math.min(90, prev[prev.length - 1] + (Math.random() - 0.5) * 15));
        return [...prev.slice(1), nextVal];
      });
      setMem(prev => {
        const nextVal = Math.max(40, Math.min(85, prev[prev.length - 1] + (Math.random() - 0.5) * 4));
        return [...prev.slice(1), nextVal];
      });
    };

    const interval = setInterval(updateStats, 450);
    return () => clearInterval(interval);
  }, []);

  const curCpu = cpu[cpu.length - 1].toFixed(1);
  const curNet = (net[net.length - 1] * 0.12).toFixed(1);
  const curMem = mem[mem.length - 1].toFixed(1);

  return (
    <div className="flex-1 flex flex-col bg-[#111111] text-[#dfdbd2] p-4 sm:p-5 overflow-y-auto space-y-4 select-none">
      
      {/* 1. App Header Info */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm text-slate-100">CaelumOS System Monitor</span>
        </div>
        <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
          Node-Cluster: Healthy
        </span>
      </div>

      {/* 2. Three Graph Monitors */}
      <div className="space-y-4 flex-1">
        {/* CPU Graph (Bright green) */}
        <ResourceGraph
          label="Cluster CPU Uptime"
          color="#34d399"
          value={`${curCpu}%`}
          data={cpu}
        />

        {/* Network I/O Graph (Magenta / Cyan) */}
        <ResourceGraph
          label="Network I/O Data Stream"
          color="#f472b6"
          value={`${curNet} MB/s`}
          data={net}
        />

        {/* DB Memory Graph (Purple) */}
        <ResourceGraph
          label="Database Cache Memory"
          color="#a78bfa"
          value={`${curMem}%`}
          data={mem}
        />
      </div>

      {/* 3. Bottom Grid specs */}
      <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-neutral-800 text-[10px] leading-none text-slate-500 font-mono">
        <div>Processes: <span className="text-slate-350 font-bold">142</span></div>
        <div>Uptime: <span className="text-slate-350 font-bold">2h 18m</span></div>
        <div>Active Pods: <span className="text-slate-350 font-bold">3/3</span></div>
      </div>

    </div>
  );
}
