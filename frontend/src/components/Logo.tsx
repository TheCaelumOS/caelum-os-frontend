import React from 'react';

export default function Logo() {
  return (
    <div className="flex items-center space-x-2.5 select-none group">
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-purple-500/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-purple-500/35">
        <img
          src="/branding/caelumos-icon.png"
          alt="CaelumOS"
          className="w-full h-full object-contain"
        />
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300 pointer-events-none" />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 bg-clip-text text-transparent">
          CaelumOS
        </span>
        <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase leading-none">
          AI Cloud OS
        </span>
      </div>
    </div>
  );
}
