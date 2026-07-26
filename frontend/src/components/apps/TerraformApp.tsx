"use client";

import React, { useState } from 'react';
import { apiRequest } from '../../lib/api';
import { Play, Sparkles, Terminal, Code2, AlertTriangle, ShieldCheck } from 'lucide-react';

const DEFAULT_TF_CODE = `provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "caelum-production-vpc"
  }
}`;

export default function TerraformApp() {
  const [code, setCode] = useState<string>(DEFAULT_TF_CODE);
  const [consoleLogs, setConsoleLogs] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isPlanning, setIsPlanning] = useState<boolean>(false);
  const [tfState, setTfState] = useState<'uninitialized' | 'initialized' | 'planned' | 'applied'>('uninitialized');

  const handleValidate = async () => {
    setIsValidating(true);
    setConsoleLogs('[CaelumOS] Running terraform validate...\n');
    try {
      const data = await apiRequest('/terraform/validate', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      if (data.valid) {
        setConsoleLogs(prev => prev + '✔ Success: Configuration is valid!\n');
        setTfState('initialized');
      } else {
        setConsoleLogs(prev => prev + `✖ Error: Validation failed!\n${JSON.stringify(data.diagnostics, null, 2)}\n`);
      }
    } catch (err: any) {
      setConsoleLogs(prev => prev + `✖ Connection Error: ${err.message}\n`);
    } finally {
      setIsValidating(false);
    }
  };

  const handlePlan = async () => {
    setIsPlanning(true);
    setConsoleLogs(prev => prev + '\n[CaelumOS] Running terraform plan...\n');
    try {
      const data = await apiRequest('/terraform/plan', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      if (data.success) {
        setConsoleLogs(prev => prev + data.plan + '\n');
        setTfState('planned');
      } else {
        setConsoleLogs(prev => prev + `✖ Error generating plan!\n`);
      }
    } catch (err: any) {
      setConsoleLogs(prev => prev + `✖ Connection Error: ${err.message}\n`);
    } finally {
      setIsPlanning(false);
    }
  };

  const handleApply = () => {
    setConsoleLogs(prev => prev + '\n[CaelumOS] Running terraform apply -auto-approve...\n');
    setTimeout(() => {
      setConsoleLogs(prev => prev + 'aws_vpc.main: Creating...\naws_vpc.main: Creation complete [ID: vpc-028a2cd91]\n\n✔ Apply complete! Resources: 1 added, 0 changed, 0 destroyed.\n');
      setTfState('applied');
    }, 1500);
  };

  const handleDestroy = () => {
    setConsoleLogs(prev => prev + '\n[CaelumOS] Running terraform destroy -auto-approve...\n');
    setTimeout(() => {
      setConsoleLogs(prev => prev + 'aws_vpc.main: Destroying...\naws_vpc.main: Destruction complete [ID: vpc-028a2cd91]\n\n✔ Destroy complete! Resources: 0 added, 0 changed, 1 destroyed.\n');
      setTfState('uninitialized');
    }, 1500);
  };

  return (
    <div className="flex-1 flex bg-[#0c0c0e] text-slate-100 min-h-0 select-text font-mono text-xs">
      {/* Code Editor block */}
      <div className="w-1/2 border-r border-neutral-800 flex flex-col min-h-0 bg-[#0f0f12]">
        <div className="p-3 border-b border-neutral-800 flex items-center justify-between flex-shrink-0 bg-[#121215]">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Code2 className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] uppercase font-bold tracking-wider">main.tf</span>
          </div>
          <span className="text-[10px] text-slate-500 font-bold">V1.5.0</span>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-grow p-4 bg-transparent outline-none border-none text-[11px] leading-relaxed resize-none text-emerald-450 font-mono font-medium focus:ring-0 focus:border-none whitespace-pre"
        />
      </div>

      {/* Controller actions and console stdout */}
      <div className="w-1/2 flex flex-col min-h-0 bg-[#08080a]">
        {/* Buttons / Actions row */}
        <div className="p-3 bg-[#0f0f12] border-b border-neutral-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleValidate}
              disabled={isValidating}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-slate-200 font-bold text-[10px] uppercase tracking-wider cursor-pointer"
            >
              Init / Validate
            </button>
            <button
              onClick={handlePlan}
              disabled={isPlanning || tfState === 'uninitialized'}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-slate-200 font-bold text-[10px] uppercase tracking-wider disabled:opacity-35 cursor-pointer"
            >
              Plan
            </button>
            <button
              onClick={handleApply}
              disabled={tfState !== 'planned'}
              className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/30 text-purple-400 font-bold text-[10px] uppercase tracking-wider disabled:opacity-35 cursor-pointer"
            >
              Apply
            </button>
            <button
              onClick={handleDestroy}
              disabled={tfState !== 'applied'}
              className="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/35 border border-red-500/30 text-red-400 font-bold text-[10px] uppercase tracking-wider disabled:opacity-35 cursor-pointer"
            >
              Destroy
            </button>
          </div>
          {/* Status badge */}
          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border ${
            tfState === 'applied' 
              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
              : tfState === 'planned' 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
              : 'bg-neutral-800 text-slate-400 border-neutral-700'
          }`}>
            {tfState}
          </span>
        </div>

        {/* Console Logs area */}
        <div className="flex-grow flex flex-col p-4 min-h-0 bg-[#08080a]">
          <div className="flex items-center space-x-1.5 text-slate-400 border-b border-neutral-900 pb-2 mb-2 flex-shrink-0">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Plan & Apply logs</span>
          </div>
          <pre className="flex-grow overflow-auto text-[10.5px] leading-relaxed text-slate-300 p-3 bg-black/45 rounded-lg border border-neutral-900 whitespace-pre-wrap select-all select-text">
            {consoleLogs || '[CaelumOS] Write your Terraform configuration in main.tf and validate it.'}
          </pre>
        </div>
      </div>
    </div>
  );
}
