"use client";

import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ShieldCheck, TrendingDown, ArrowUpRight, HelpCircle } from 'lucide-react';

interface SubMetric {
  name: string;
  score: number;
}

interface MetricCardProps {
  title: string;
  score: number; // 0 to 100
  previousScore?: number;
  type: 'security' | 'cost';
  subMetrics: SubMetric[];
  recommendation: string;
}

export default function MetricCard({
  title,
  score,
  previousScore = 50,
  type,
  subMetrics,
  recommendation
}: MetricCardProps) {
  const [animatedScore, setAnimatedScore] = useState(previousScore);
  const colorScheme = type === 'security' 
    ? {
        primary: 'stroke-purple-600',
        track: 'stroke-purple-100',
        glow: 'glow-purple',
        iconBg: 'bg-purple-50',
        iconText: 'text-purple-600',
        gradient: 'from-purple-500 to-indigo-500'
      }
    : {
        primary: 'stroke-blue-600',
        track: 'stroke-blue-100',
        glow: 'glow-blue',
        iconBg: 'bg-blue-50',
        iconText: 'text-blue-600',
        gradient: 'from-blue-500 to-cyan-500'
      };

  // Count up animation for the score
  useEffect(() => {
    let start = animatedScore;
    const end = score;
    if (start === end) return;
    
    const duration = 1200; // ms
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / (end - start)));
    
    const timer = setInterval(() => {
      start += increment;
      setAnimatedScore(start);
      if (start === end) {
        clearInterval(timer);
      }
    }, Math.max(stepTime, 8)); // lock to min 8ms

    return () => clearInterval(timer);
  }, [score]);

  // Circle path logic
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden bg-white border border-slate-200/70 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-full`}
    >
      {/* Background radial soft light */}
      <div className={`absolute top-0 right-0 w-36 h-36 rounded-full opacity-5 pointer-events-none blur-3xl bg-gradient-to-br ${colorScheme.gradient}`} />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${colorScheme.iconBg} ${colorScheme.iconText}`}>
              {type === 'security' ? <ShieldCheck className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">AI Assessed</p>
            </div>
          </div>
          <HelpCircle className="w-4 h-4 text-slate-300 hover:text-slate-500 cursor-pointer transition-colors" />
        </div>

        {/* Circular Progress & Info */}
        <div className="flex items-center justify-between py-6">
          <div className="space-y-1">
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {animatedScore}
              </span>
              <span className="text-sm font-bold text-slate-400">/100</span>
            </div>
            
            <div className="flex items-center space-x-1.5">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                score >= 90 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {score >= 90 ? 'Excellent' : 'Needs Review'}
              </span>
              {score > previousScore && (
                <span className="text-[10px] text-green-600 font-bold flex items-center">
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                  <span>+{score - previousScore}%</span>
                </span>
              )}
            </div>
          </div>

          {/* SVG Circular indicator */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={`${colorScheme.track}`}
                strokeWidth="8"
                fill="transparent"
              />
              {/* Progress */}
              <motion.circle
                cx="50"
                cy="50"
                r={radius}
                className={`${colorScheme.primary} drop-shadow-[0_2px_8px_rgba(124,58,237,0.15)]`}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center select-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Score
              </span>
            </div>
          </div>
        </div>

        {/* Detailed breakdown list */}
        <div className="space-y-2.5 mt-2 bg-slate-50/50 border border-slate-100 rounded-2xl p-3">
          {subMetrics.map((metric, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">{metric.name}</span>
              <div className="flex items-center space-x-2">
                {/* Micro mini progress bar */}
                <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.score}%` }}
                    transition={{ duration: 1, delay: 0.2 + idx * 0.1 }}
                    className={`h-full bg-gradient-to-r ${colorScheme.gradient}`}
                  />
                </div>
                <span className="text-slate-800 font-bold">{metric.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Recommendation */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
          Smart Recommendation
        </p>
        <p className="text-xs font-semibold text-slate-600 leading-normal">
          {recommendation}
        </p>
      </div>

    </motion.div>
  );
}
