"use client";

import React from 'react';
import { motion } from 'framer-motion';

const INTEGRATIONS = [
  {
    name: 'GitHub',
    color: 'hover:border-slate-800 hover:shadow-slate-800/10 hover:text-slate-800',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
      </svg>
    )
  },
  {
    name: 'AWS',
    color: 'hover:border-orange-500 hover:shadow-orange-500/10 hover:text-orange-500',
    icon: (
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.36 12.3c-.31.39-.74.65-1.29.77-.38.08-.85.12-1.39.12-1.38 0-2.45-.48-3.21-1.44-.61-.77-.92-1.85-.92-3.24s.31-2.47.93-3.24c.77-.96 1.84-1.44 3.2-1.44.54 0 1.01.04 1.39.12.55.12.98.38 1.29.77.31.39.47.92.47 1.59h-1.5c0-.36-.08-.63-.23-.83-.15-.2-.39-.33-.7-.39-.24-.05-.56-.07-.93-.07-.86 0-1.52.3-1.99.9-.47.6-.7 1.48-.7 2.65s.23 2.05.7 2.65c.47.6 1.13.9 1.99.9.37 0 .69-.02.93-.07.31-.06.55-.19.7-.39.15-.2.23-.47.23-.83h1.5c0 .67-.16 1.2-.47 1.59z" />
      </svg>
    )
  },
  {
    name: 'Azure',
    color: 'hover:border-blue-500 hover:shadow-blue-500/10 hover:text-blue-500',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M11.4 3L2 18h6.8l4.4-7.4L17.6 18H22L11.4 3z" />
      </svg>
    )
  },
  {
    name: 'Terraform',
    color: 'hover:border-purple-600 hover:shadow-purple-600/10 hover:text-purple-600',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M1.35 0h8.1v8.1h-8.1V0zm13.2 0h8.1v8.1h-8.1V0zm-6.6 6.6h8.1v8.1h-8.1V6.6zM1.35 13.2h8.1v8.1h-8.1v-8.1zm13.2 0h8.1v8.1h-8.1v-8.1z" />
      </svg>
    )
  },
  {
    name: 'Docker',
    color: 'hover:border-sky-500 hover:shadow-sky-500/10 hover:text-sky-500',
    icon: (
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M13.983 11.078h2.119c.102 0 .186-.083.186-.185V8.99c0-.102-.084-.186-.186-.186h-2.119c-.103 0-.186.084-.186.186v1.903c0 .101.083.185.186.185zM11.261 11.078h2.119c.102 0 .186-.083.186-.185V8.99c0-.102-.084-.186-.186-.186h-2.119c-.103 0-.186.084-.186.186v1.903c0 .101.083.185.186.185zm-2.72 0h2.119c.102 0 .186-.083.186-.185V8.99c0-.102-.084-.186-.186-.186H8.54c-.102 0-.186.084-.186.186v1.903c0 .101.084.185.186.185zm-2.72 0h2.119c.102 0 .186-.083.186-.185V8.99c0-.102-.084-.186-.186-.186H5.82c-.102 0-.186.084-.186.186v1.903c0 .101.084.185.186.185zm2.72-2.72h2.119c.102 0 .186-.083.186-.185V6.27c0-.103-.084-.186-.186-.186H8.54c-.102 0-.186.083-.186.186v1.903c0 .102.084.185.186.185zm2.72 0h2.119c.102 0 .186-.083.186-.185V6.27c0-.103-.084-.186-.186-.186h-2.119c-.103 0-.186.083-.186.186v1.903c0 .102.083.185.186.185zm2.72 0h2.119c.102 0 .186-.083.186-.185V6.27c0-.103-.084-.186-.186-.186h-2.119c-.103 0-.186.083-.186.186v1.903c0 .102.083.185.186.185zm-8.16 2.72H3.1c-.102 0-.185-.083-.185-.185V8.99c0-.102.083-.186.185-.186h2.119c.102 0 .186.084.186.186v1.903c0 .101-.084.185-.186.185zm-2.72-2.72H.38c-.102 0-.185-.083-.185-.185V6.27c0-.103.083-.186.185-.186H2.5c.102 0 .186.083.186.186v1.903c0 .102-.084.185-.186.185zM23.69 11.233c-.486-.547-1.21-.861-1.921-.861-.093 0-.186.009-.28.018a4.912 4.912 0 00-1.745-.371 4.7 4.7 0 00-2.83 1.02h-.032c-.102 0-.186.084-.186.186v4.646c0 .241-.122.441-.326.54-.204.1-.424.084-.6-.046l-.543-.404-.543.404c-.176.13-.396.146-.6.046a.65.65 0 01-.326-.54V11.28c0-.102-.084-.186-.186-.186H8.384c-.102 0-.186.084-.186.186v5.807c0 1.95 1.583 3.535 3.535 3.535h1.996c3.21 0 5.867-2.486 6.07-5.644.02-.306.18-.585.45-.76.713-.464 1.345-1.123 1.633-1.893.287-.77.12-1.587-.19-1.992z" />
      </svg>
    )
  },
  {
    name: 'Kubernetes',
    color: 'hover:border-indigo-600 hover:shadow-indigo-600/10 hover:text-indigo-600',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12.44 2.1a1.23 1.23 0 00-.88 0L3.18 5.5a1.24 1.24 0 00-.73 1.05v9.9a1.24 1.24 0 00.73 1.05l8.38 3.4a1.23 1.23 0 00.88 0l8.38-3.4a1.24 1.24 0 00.73-1.05v-9.9a1.24 1.24 0 00-.73-1.05zM12 4.45l6.53 2.65v2.96L12 7.42zM5.47 7.1l6.53-2.65v2.97L5.47 10.06zM4.65 8.9v6.2l3.4-1.38V7.52zm4.24 4.9L12 12.46l3.11 1.26v2.96L12 15.42zm4.23-1.34L19.35 8.9V13.8l-3.4 1.38zm7.34 2.74l-6.53 2.65v-2.96l6.53-2.65zm-16.92 0L12 18.06V20.7l-6.53-2.65zm6.53-5.26v2.96L5.47 12.8v-2.96z" />
      </svg>
    )
  },
  {
    name: 'Prometheus',
    color: 'hover:border-rose-500 hover:shadow-rose-500/10 hover:text-rose-500',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12.02 0a12 12 0 1011.98 12c0-2.85-.99-5.46-2.65-7.53L19.8 6.02A9.5 9.5 0 0121.5 12a9.5 9.5 0 11-16.7-6.27l1.7-1.46c.14-.12.33-.12.47.01l1.58 1.48c.15.14.39.1.48-.09a3.7 3.7 0 015.65-1.12l1.62-1.39C14.6 2.05 13.34 1.44 12.02.04v-.04zM10.8 14.88c-.65-.63-.98-1.5-.98-2.6 0-1.11.33-1.98.98-2.62s1.55-.96 2.7-.96 2.06.32 2.7.96.98 1.5.98 2.61c0 1.11-.33 1.98-.98 2.61s-1.55.96-2.7.96-2.05-.32-2.7-.96z" />
      </svg>
    )
  },
  {
    name: 'Grafana',
    color: 'hover:border-amber-500 hover:shadow-amber-500/10 hover:text-amber-500',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm-.5-5.5c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1v-2zm0-4c0-.55-.45-1-1-1s-1 .45-1 1v1c0 .55.45 1 1 1s1-.45 1-1V7z" />
      </svg>
    )
  }
];

export default function IntegrationEcosystem() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full py-8 text-center space-y-4">
      <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
        Orchestrating Infrastructure Ecosystem
      </p>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-5xl mx-auto px-4"
      >
        {INTEGRATIONS.map((integration) => (
          <motion.div
            key={integration.name}
            variants={itemVariants}
            whileHover={{ y: -3, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl border border-slate-200/60 bg-white text-slate-500 shadow-sm cursor-pointer transition-all duration-300 ${integration.color}`}
          >
            {integration.icon}
            <span className="text-xs font-semibold select-none">
              {integration.name}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
