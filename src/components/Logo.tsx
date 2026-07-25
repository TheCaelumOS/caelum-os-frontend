import React from 'react';

export default function Logo() {
  return (
    <div className="flex items-center space-x-2.5 select-none group">
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md shadow-purple-500/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-purple-500/35">
        {/* Shield Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 text-white transform transition-transform duration-500 group-hover:rotate-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300" />
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
