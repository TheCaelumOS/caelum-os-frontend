import React from 'react';

export const CaelumLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="caelumGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
      <linearGradient id="caelumCore" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0ea5e9" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    {/* Outer hexagonal matrix */}
    <path 
      d="M18 2L32 10V26L18 34L4 26V10L18 2Z" 
      stroke="url(#caelumGlow)" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="opacity-90"
    />
    {/* Inner isometric infrastructure cube */}
    <path d="M18 10L26 14.5V23.5L18 28L10 23.5V14.5L18 10Z" fill="url(#caelumCore)" fillOpacity="0.3" stroke="url(#caelumGlow)" strokeWidth="1.5" />
    <path d="M18 10V28" stroke="url(#caelumGlow)" strokeWidth="1.2" strokeOpacity="0.8" />
    <path d="M10 14.5L26 23.5" stroke="url(#caelumGlow)" strokeWidth="1.2" strokeOpacity="0.8" />
    <path d="M26 14.5L10 23.5" stroke="url(#caelumGlow)" strokeWidth="1.2" strokeOpacity="0.8" />
    {/* Center node pulse */}
    <circle cx="18" cy="19" r="2.5" fill="#38bdf8" />
  </svg>
);

export const AwsLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className}>
    <path fill="#FF9900" d="M25 21.2c-3.1 2.2-7.5 3.3-11.8 3.3-6 0-11-2.2-13.8-5.6-.4-.5 0-1.1.5-.8 4.3 2.3 9.6 3.6 15 3.6 4.4 0 9.2-.9 12.6-2.8.7-.4 1.1.3.4.8z" />
    <path fill="#FF9900" d="M26 19.4c-.3-.4-1.1-.1-1.5.1-.4.3-.3 1.1.1 1.4.7.4 1.5 1 1.6.4.3-.4-.9-1.5-.9-1.9z" />
  </svg>
);

export const AzureLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 128 128" className={className}>
    <path fill="#0078d4" d="M10.8 108.8L63.3 22l43.5 28.5L63.3 83.3z" />
    <path fill="#50e6ff" d="M117.2 108.8H10.8l52.5-25.5z" />
  </svg>
);

export const DockerLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path fill="#0db7ed" d="M22.3 10.05c-.34-.73-.91-1.3-1.61-1.67-.18-.1-.38-.17-.58-.23a4.23 4.23 0 0 0-.28-1.57c-.24-.55-.65-1.02-1.18-1.32-.47-.27-1.02-.38-1.55-.32-.23-.83-.73-1.54-1.42-2-.68-.45-1.5-.64-2.3-.53h-.03v1.89h.03c.53-.06 1.08.06 1.53.36.42.28.71.72.82 1.22l.06.28.28.03c.66.08 1.25.46 1.58 1.04.18.32.28.69.29 1.06v.06h1.92v-.03c0-.12.02-.24.03-.36l.01-.22zM8.99 7.62h1.61v-1.6H8.99v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm-7.02 2.34h1.61v-1.6H6.65v1.6zm2.34 0h1.61v-1.6H8.99v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm-11.7 2.34h1.61v-1.6H4.31v1.6zm2.34 0h1.61v-1.6H6.65v1.6zm2.34 0h1.61v-1.6H8.99v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm-14.04 2.34c0 1.9 1.53 3.44 3.44 3.44h11.23c3.1 0 5.66-2.4 5.86-5.46.02-.3.17-.57.43-.73.66-.43 1.25-1.04 1.52-1.76.27-.72.11-1.5-.18-1.89-.46-.52-1.14-.82-1.81-.82-.09 0-.17.01-.26.02-.45.04-.84-.13-1.12-.48l-.51-.38-.51.38c-.28.35-.67.52-1.12.48a1.64 1.64 0 0 0-1.12.48l-.51.38v-4.3c0-.1-.08-.18-.18-.18H8.38c-.1 0-.18.08-.18.18v5.43c0 .1-.08.18-.18.18H6.41c-.1 0-.18-.08-.18-.18v-5.43c0-.1-.08-.18-.18-.18H4.44c-.1 0-.18.08-.18.18v5.43c0 .1-.08.18-.18.18H2.47c-.1 0-.18-.08-.18-.18v-3.25c0-.1-.08-.18-.18-.18H.3c-.1 0-.18.08-.18.18v1.36c0 1.9 1.53 3.44 3.44 3.44h1.76v-.06z" />
  </svg>
);

export const TerraformLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path fill="#844FBA" d="M1.5 0h7v7h-7zM15.5 0h7v7h-7zM8.5 7h7v7h-7zM1.5 14h7v7h-7zM15.5 14h7v7h-7z" />
  </svg>
);

export const KubernetesLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path fill="#326CE5" d="M12.44 2.1a1.23 1.23 0 00-.88 0L3.18 5.5a1.24 1.24 0 00-.73 1.05v9.9a1.24 1.24 0 00.73 1.05l8.38 3.4a1.23 1.23 0 00.88 0l8.38-3.4a1.24 1.24 0 00.73-1.05v-9.9a1.24 1.24 0 00-.73-1.05z" />
    <path fill="#FFFFFF" d="M12 4.45l6.53 2.65v2.96L12 7.42zm-6.53 2.65L12 4.45v2.97L5.47 10.06zM4.65 8.9v6.2l3.4-1.38V7.52zm4.24 4.9L12 12.46l3.11 1.26v2.96L12 15.42zm4.23-1.34L19.35 8.9V13.8l-3.4 1.38zm7.34 2.74l-6.53 2.65v-2.96l6.53-2.65zm-16.92 0L12 18.06V20.7l-6.53-2.65zm6.53-5.26v2.96L5.47 12.8v-2.96z" />
  </svg>
);

export const GithubLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-current`}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
  </svg>
);
