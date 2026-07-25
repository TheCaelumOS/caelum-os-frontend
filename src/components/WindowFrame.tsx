"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Minus, Square, Shrink } from 'lucide-react';

interface WindowFrameProps {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  children: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  theme?: 'dark' | 'light';
}

export default function WindowFrame({
  id,
  title,
  isOpen,
  isMinimized,
  isMaximized,
  zIndex,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  children,
  defaultWidth = 720,
  defaultHeight = 480,
  theme = 'dark'
}: WindowFrameProps) {
  const dragControls = useDragControls();
  const [width, setWidth] = useState(defaultWidth);
  const [height, setHeight] = useState(defaultHeight);
  const windowRef = useRef<HTMLDivElement>(null);

  // Reset dimensions if maximized changes
  useEffect(() => {
    if (!isMaximized) {
      // Keep current custom size or restore default
    }
  }, [isMaximized]);

  if (!isOpen) return null;
  if (isMinimized) return null;

  const headerBg = theme === 'dark' ? 'bg-[#3c3b37] border-b border-[#2a2926]' : 'bg-[#e6e5e0] border-b border-[#d1cfc7]';
  const headerText = theme === 'dark' ? 'text-slate-200' : 'text-slate-700';

  // Resize Handler
  const handleResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus();

    const startWidth = width;
    const startHeight = height;
    const startX = e.clientX;
    const startY = e.clientY;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      setWidth(Math.max(320, startWidth + deltaX));
      setHeight(Math.max(240, startHeight + deltaY));
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <motion.div
      ref={windowRef}
      drag={!isMaximized}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
      onPointerDown={onFocus}
      style={{
        zIndex,
        width: isMaximized ? '100%' : width,
        height: isMaximized ? 'calc(100vh - 28px)' : height, // 28px top panel
        top: isMaximized ? '28px' : undefined,
        left: isMaximized ? '0px' : undefined,
        position: 'absolute',
        // Default position offset for non-maximized
        ...(!isMaximized ? { x: id === 'terminal' ? 80 : 180, y: id === 'terminal' ? 50 : 80 } : {})
      }}
      className={`rounded-t-lg shadow-2xl border ${
        theme === 'dark' 
          ? 'border-[#2d2d2d] bg-[#2c001e]' 
          : 'border-slate-200 bg-white'
      } flex flex-col overflow-hidden select-none`}
    >
      {/* Title Bar / Header */}
      <div
        onPointerDown={(e) => {
          onFocus();
          if (!isMaximized) {
            dragControls.start(e);
          }
        }}
        className={`h-9 px-4 flex items-center justify-between select-none cursor-move ${headerBg}`}
      >
        <div className="w-16 flex items-center space-x-1.5 opacity-60">
          {/* Decorative items */}
        </div>

        {/* Center: Window Title */}
        <span className={`text-xs font-bold font-sans tracking-wide ${headerText}`}>
          {title}
        </span>

        {/* Right: Window Controls */}
        <div className="flex items-center space-x-2">
          {/* Minimize */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            className="w-4 h-4 rounded-full bg-[#5f5f5f] hover:bg-[#7a7a7a] flex items-center justify-center text-white/90 active:scale-95 transition-all cursor-pointer"
            title="Minimize"
          >
            <Minus className="w-2.5 h-2.5" />
          </button>

          {/* Maximize */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            className="w-4 h-4 rounded-full bg-[#5f5f5f] hover:bg-[#7a7a7a] flex items-center justify-center text-white/90 active:scale-95 transition-all cursor-pointer"
            title={isMaximized ? "Restore Down" : "Maximize"}
          >
            {isMaximized ? <Shrink className="w-2.5 h-2.5" /> : <Square className="w-2 h-2" />}
          </button>

          {/* Close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-4 h-4 rounded-full bg-[#e95420] hover:bg-[#ff6936] flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-2.5 h-2.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Window Body Container */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {children}
      </div>

      {/* Resize Handle (bottom-right) */}
      {!isMaximized && (
        <div
          onPointerDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 select-none z-50 group bg-transparent"
        >
          {/* Resizer design slash marks */}
          <svg width="8" height="8" viewBox="0 0 8 8" className="text-slate-400 opacity-30 group-hover:opacity-75 transition-opacity">
            <line x1="6" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="1.5" />
            <line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
