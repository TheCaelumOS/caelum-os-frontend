"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, animate } from 'framer-motion';
import { ShieldCheck, ChevronRight, AlertTriangle, Play, CheckCircle } from 'lucide-react';

interface ActionCenterProps {
  summary: {
    add: number;
    change: number;
    destroy: number;
    policies: number;
  };
  onDeploy: () => void;
  isDeploying: boolean;
  deploySuccess: boolean;
}

export default function ActionCenter({
  summary,
  onDeploy,
  isDeploying,
  deploySuccess
}: ActionCenterProps) {
  const [sliderWidth, setSliderWidth] = useState(0);
  const [sliderUnlocked, setSliderUnlocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const dragX = useMotionValue(0);
  
  // Transform drag distance to opacity of slider placeholder text
  const textOpacity = useTransform(dragX, [0, sliderWidth - 56], [1, 0]);
  const bgWidth = useTransform(dragX, [0, sliderWidth - 56], [56, sliderWidth]);

  useEffect(() => {
    if (containerRef.current) {
      setSliderWidth(containerRef.current.offsetWidth);
    }
  }, [isDeploying, deploySuccess]);

  // Reset slider if deployment resets or succeeds
  useEffect(() => {
    if (!isDeploying && !deploySuccess) {
      dragX.set(0);
      setSliderUnlocked(false);
    }
  }, [isDeploying, deploySuccess, dragX]);

  const handleDragEnd = () => {
    const threshold = sliderWidth - 62; // Handle offset width
    if (dragX.get() >= threshold) {
      setSliderUnlocked(true);
      dragX.set(sliderWidth - 56);
      onDeploy();
    } else {
      animate(dragX, 0, { type: 'spring', stiffness: 200, damping: 20 });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.03)] backdrop-blur-md py-4 px-6 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Summary Panel */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-extrabold text-slate-800 tracking-tight">
              Proposed Infrastructure Plan:
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">
              +{summary.add} to create
            </span>
            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100/50">
              ~{summary.change} to modify
            </span>
            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100/50">
              -{summary.destroy} to destroy
            </span>
            <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100/50 flex items-center space-x-1">
              <span>{summary.policies} security rules applied</span>
            </span>
          </div>
        </div>

        {/* Right: Slide to Confirm Button */}
        <div className="w-full md:w-80 flex-shrink-0">
          
          <AnimatePresence mode="wait">
            {deploySuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/20"
              >
                <CheckCircle className="w-4 h-4 stroke-[3]" />
                <span>Deployment Complete</span>
              </motion.div>
            ) : isDeploying ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center space-x-2.5 shadow-md shadow-indigo-500/20"
              >
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Applying Terraforming...</span>
              </motion.div>
            ) : (
              <motion.div
                key="interactive-slider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                ref={containerRef}
                className="relative w-full h-12 bg-slate-100 border border-slate-200/60 rounded-2xl overflow-hidden flex items-center p-1"
              >
                {/* Visual drag background track filling */}
                <motion.div
                  style={{ width: bgWidth }}
                  className="absolute left-1 top-1 bottom-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl -z-0"
                />

                {/* Slider Handle */}
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: sliderWidth - 54 }}
                  dragElastic={0.05}
                  dragMomentum={false}
                  onDragEnd={handleDragEnd}
                  style={{ x: dragX }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-10 h-10 bg-white rounded-xl shadow-md border border-slate-200/40 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 transition-shadow hover:shadow-lg"
                >
                  <ChevronRight className="w-5 h-5 text-indigo-600 stroke-[2.5]" />
                </motion.div>

                {/* Slider Helper Label text */}
                <motion.div
                  style={{ opacity: textOpacity }}
                  className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-400 tracking-wider uppercase pointer-events-none select-none z-0"
                >
                  Slide to Confirm & Deploy
                </motion.div>

                {/* Safety Warning indicator inside bar */}
                <div className="absolute right-3.5 pointer-events-none opacity-20">
                  <Play className="w-3.5 h-3.5 text-slate-500 fill-current" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
