"use client";

import React, { useState, useEffect } from 'react';
import AIInput from '../AIInput';
import IntegrationEcosystem from '../IntegrationEcosystem';
import MetricCard from '../MetricCard';
import CodeViewer from '../CodeViewer';
import ActionCenter from '../ActionCenter';
import { PRESETS } from '../../lib/data';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, RefreshCw, X, Terminal } from 'lucide-react';

export default function DashboardApp() {
  const [activePresetKey, setActivePresetKey] = useState<string>('aws_ecs');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  
  const [prevSecurityScore, setPrevSecurityScore] = useState(50);
  const [prevCostScore, setPrevCostScore] = useState(50);

  const activePreset = PRESETS[activePresetKey];

  const handleGenerate = (prompt: string) => {
    setIsGenerating(true);
    setDeploySuccess(false);

    setPrevSecurityScore(activePreset.security.score);
    setPrevCostScore(activePreset.cost.score);

    setTimeout(() => {
      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes('kubernetes') || lowerPrompt.includes('k8s') || lowerPrompt.includes('azure') || lowerPrompt.includes('aks')) {
        setActivePresetKey('azure_k8s');
      } else if (lowerPrompt.includes('postgres') || lowerPrompt.includes('db') || lowerPrompt.includes('database') || lowerPrompt.includes('sql')) {
        setActivePresetKey('postgres_db');
      } else {
        setActivePresetKey('aws_ecs');
      }
      setIsGenerating(false);
    }, 1800);
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      setDeploySuccess(true);
    }, 4000);
  };

  const handleReset = () => {
    setDeploySuccess(false);
    setIsDeploying(false);
    setActivePresetKey('aws_ecs');
    setPrevSecurityScore(50);
    setPrevCostScore(50);
  };

  // Deployment Logs state simulation
  const [logIndex, setLogIndex] = useState(0);
  const deployLogs = [
    "[CaelumOS] Initiating cloud connection...",
    "[Terraform] Executing: terraform init -upgrade",
    "[Terraform] Plugins installed: aws v5.12.0, random v3.5.1",
    "[Security Engine] Running static code analysis (tfsec)...",
    "[Security Engine] Compliance: CIS AWS Foundations Benchmark v1.4.0 passed.",
    "[Terraform] Executing: terraform apply -auto-approve",
    "[AWS] Creating Virtual Private Cloud (VPC)... [ID: vpc-0a47f12e]",
    "[AWS] Creating Application Load Balancer... [DNS: caelum-alb-129.us-east-1.elb.amazonaws.com]",
    "[AWS] Deploying Fargate containers... [Count: 3 replicas running]",
    "[CaelumOS] Deployment succeeded! Mapping live URL..."
  ];

  useEffect(() => {
    if (isDeploying) {
      setLogIndex(0);
      const interval = setInterval(() => {
        setLogIndex((prev) => {
          if (prev < deployLogs.length - 1) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 350);
      return () => clearInterval(interval);
    }
  }, [isDeploying]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#fcfbfe] flex flex-col relative select-text">
      
      <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-10 flex-grow">
        {/* Hero Section */}
        <AIInput onGenerate={handleGenerate} isGenerating={isGenerating} />

        {/* Ecosystem Integrations */}
        <IntegrationEcosystem />

        {/* Dashboard Metrics and Code Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Scorecards */}
          <div className="xl:col-span-1 flex flex-col gap-6">
            <MetricCard
              title="Security Grade"
              score={activePreset.security.score}
              previousScore={prevSecurityScore}
              type="security"
              subMetrics={activePreset.security.subMetrics}
              recommendation={activePreset.security.recommendation}
            />
            
            <MetricCard
              title="Cost Efficiency"
              score={activePreset.cost.score}
              previousScore={prevCostScore}
              type="cost"
              subMetrics={activePreset.cost.subMetrics}
              recommendation={activePreset.cost.recommendation}
            />
          </div>

          {/* Multi-Tab Code Viewer */}
          <div className="xl:col-span-2">
            <CodeViewer
              files={activePreset.files}
              explanations={activePreset.explanations}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Center inside this App Window */}
      <div className="sticky bottom-0 z-35 mt-10">
        <ActionCenter
          summary={activePreset.summary}
          onDeploy={handleDeploy}
          isDeploying={isDeploying}
          deploySuccess={deploySuccess}
        />
      </div>

      {/* Deployment Modal Overlay inside App Window */}
      <AnimatePresence>
        {(isDeploying || deploySuccess) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0f0b18]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white border border-slate-100 rounded-2xl w-full max-w-lg shadow-2xl p-6 overflow-hidden flex flex-col max-h-[420px]"
            >
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-50 text-purple-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs">CaelumOS Deploy Console</h3>
                  </div>
                </div>
                {!isDeploying && (
                  <button
                    onClick={() => setDeploySuccess(false)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>

              {/* Logs / Success Display */}
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                {isDeploying ? (
                  <div className="flex-1 flex flex-col bg-[#0f0b18] text-[#f8f6fc] font-mono text-[10px] leading-relaxed p-3.5 rounded-xl overflow-y-auto mb-3.5 border border-purple-950/20 shadow-inner">
                    <div className="flex items-center justify-between border-b border-purple-950/40 pb-1.5 mb-2 text-slate-500 text-[9px] font-bold tracking-wider uppercase">
                      <span>Console Logs</span>
                      <span className="flex items-center space-x-1">
                        <span className="w-1 h-1 rounded-full bg-purple-500 animate-ping" />
                        <span>LIVE</span>
                      </span>
                    </div>
                    <div className="space-y-1">
                      {deployLogs.slice(0, logIndex + 1).map((log, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -3 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`${log.startsWith('[Security') ? 'text-purple-300' : log.startsWith('[AWS') ? 'text-blue-300' : 'text-slate-300'}`}
                        >
                          {log}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center shadow-inner">
                      <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-800">Deployment Successful!</h4>
                      <p className="text-xs text-slate-500">
                        All resources successfully provisioned on AWS in VPC <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono text-[10px]">vpc-0a47f12e</code>.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 w-full text-left space-y-1">
                      <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Live Endpoint</div>
                      <a
                        href="https://prod-app.caelum.os"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-purple-600 hover:text-purple-800 hover:underline flex items-center space-x-1"
                      >
                        <span>https://prod-app.caelum.os</span>
                      </a>
                    </div>
                  </motion.div>
                )}

                {/* Footer Controls inside Modal */}
                {!isDeploying && (
                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      onClick={handleReset}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                    
                    <button
                      onClick={() => setDeploySuccess(false)}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/10 transition-all cursor-pointer"
                    >
                      <span>Close</span>
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
