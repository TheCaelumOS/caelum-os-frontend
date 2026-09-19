import React from 'react';

/**
 * Caleum - Corporate mark.
 * Dark navy rounded square with clean four-point star/spark symbol.
 */
export const CaleumLogo = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="32" height="32" rx="7.5" fill="#0A1128" />
    <path 
      d="M16 6.5C16 11.5 19.5 16 25.5 16C19.5 16 16 20.5 16 25.5C16 20.5 12.5 16 6.5 16C12.5 16 16 11.5 16 6.5Z" 
      fill="#FFFFFF" 
    />
  </svg>
);

/**
 * CaelumOS - Flagship product mark.
 */
export const CaelumOsLogo = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="32" height="32" rx="7" fill="#0f172a" />
    <path 
      d="M8 12L16 7L24 12V20L16 25L8 20V12Z" 
      stroke="#38bdf8" 
      strokeWidth="1.8" 
      strokeLinejoin="round" 
    />
    <path d="M16 7V25" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.7" />
    <path d="M8 12L24 20" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.7" />
    <path d="M24 12L8 20" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.7" />
    <circle cx="16" cy="16" r="2" fill="#ffffff" />
  </svg>
);

export const CaelumLogo = CaelumOsLogo;

export const AwsLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M25 21.2c-3.1 2.2-7.5 3.3-11.8 3.3-6 0-11-2.2-13.8-5.6-.4-.5 0-1.1.5-.8 4.3 2.3 9.6 3.6 15 3.6 4.4 0 9.2-.9 12.6-2.8.7-.4 1.1.3.4.8z" />
    <path d="M26 19.4c-.3-.4-1.1-.1-1.5.1-.4.3-.3 1.1.1 1.4.7.4 1.5 1 1.6.4.3-.4-.9-1.5-.9-1.9z" />
  </svg>
);

export const AzureLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 128 128" className={className} fill="currentColor">
    <path d="M10.8 108.8L63.3 22l43.5 28.5L63.3 83.3z" opacity="0.9" />
    <path d="M117.2 108.8H10.8l52.5-25.5z" opacity="0.6" />
  </svg>
);

export const DockerLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M22.3 10.05c-.34-.73-.91-1.3-1.61-1.67-.18-.1-.38-.17-.58-.23a4.23 4.23 0 0 0-.28-1.57c-.24-.55-.65-1.02-1.18-1.32-.47-.27-1.02-.38-1.55-.32-.23-.83-.73-1.54-1.42-2-.68-.45-1.5-.64-2.3-.53h-.03v1.89h.03c.53-.06 1.08.06 1.53.36.42.28.71.72.82 1.22l.06.28.28.03c.66.08 1.25.46 1.58 1.04.18.32.28.69.29 1.06v.06h1.92v-.03c0-.12.02-.24.03-.36l.01-.22zM8.99 7.62h1.61v-1.6H8.99v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm-7.02 2.34h1.61v-1.6H6.65v1.6zm2.34 0h1.61v-1.6H8.99v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm-11.7 2.34h1.61v-1.6H4.31v1.6zm2.34 0h1.61v-1.6H6.65v1.6zm2.34 0h1.61v-1.6H8.99v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm2.34 0h1.61v-1.6h-1.61v1.6zm-14.04 2.34c0 1.9 1.53 3.44 3.44 3.44h11.23c3.1 0 5.66-2.4 5.86-5.46.02-.3.17-.57.43-.73.66-.43 1.25-1.04 1.52-1.76.27-.72.11-1.5-.18-1.89-.46-.52-1.14-.82-1.81-.82-.09 0-.17.01-.26.02-.45.04-.84-.13-1.12-.48l-.51-.38-.51.38c-.28.35-.67.52-1.12.48a1.64 1.64 0 0 0-1.12.48l-.51.38v-4.3c0-.1-.08-.18-.18-.18H8.38c-.1 0-.18.08-.18.18v5.43c0 .1-.08.18-.18.18H6.41c-.1 0-.18-.08-.18-.18v-5.43c0-.1-.08-.18-.18-.18H4.44c-.1 0-.18.08-.18.18v5.43c0 .1-.08.18-.18.18H2.47c-.1 0-.18-.08-.18-.18v-3.25c0-.1-.08-.18-.18-.18H.3c-.1 0-.18.08-.18.18v1.36c0 1.9 1.53 3.44 3.44 3.44h1.76v-.06z" />
  </svg>
);

export const TerraformLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M1.5 0h7v7h-7zM15.5 0h7v7h-7zM8.5 7h7v7h-7zM1.5 14h7v7h-7zM15.5 14h7v7h-7z" />
  </svg>
);

export const KubernetesLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12.44 2.1a1.23 1.23 0 00-.88 0L3.18 5.5a1.24 1.24 0 00-.73 1.05v9.9a1.24 1.24 0 00.73 1.05l8.38 3.4a1.23 1.23 0 00.88 0l8.38-3.4a1.24 1.24 0 00.73-1.05v-9.9a1.24 1.24 0 00-.73-1.05zM12 4.45l6.53 2.65v2.96L12 7.42zm-6.53 2.65L12 4.45v2.97L5.47 10.06zM4.65 8.9v6.2l3.4-1.38V7.52zm4.24 4.9L12 12.46l3.11 1.26v2.96L12 15.42zm4.23-1.34L19.35 8.9V13.8l-3.4 1.38zm7.34 2.74l-6.53 2.65v-2.96l6.53-2.65zm-16.92 0L12 18.06V20.7l-6.53-2.65zm6.53-5.26v2.96L5.47 12.8v-2.96z" />
  </svg>
);

export const GithubLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-current`}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
  </svg>
);

export const LinuxLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12.002 0c-3.13 0-5.67 2.54-5.67 5.67 0 .7.13 1.37.36 1.99-1.68 1.02-2.82 2.86-2.82 4.97 0 2.22 1.25 4.14 3.09 5.09-.04.31-.06.63-.06.95 0 3.2 2.36 5.8 5.4 5.8 3.04 0 5.4-2.6 5.4-5.8 0-.32-.02-.64-.06-.95 1.84-.95 3.09-2.87 3.09-5.09 0-2.11-1.14-3.95-2.82-4.97.23-.62.36-1.29.36-1.99 0-3.13-2.54-5.67-5.67-5.67zm-1.8 4.2c.44 0 .8.36.8.8s-.36.8-.8.8-.8-.36-.8-.8.36-.8.8-.8zm3.6 0c.44 0 .8.36.8.8s-.36.8-.8.8-.8-.36-.8-.8.36-.8.8-.8zm-1.8 2.4c.9 0 1.6.4 1.6 1s-.7 1-1.6 1-1.6-.4-1.6-1 .7-1 1.6-1z" />
  </svg>
);

export const CloudflareLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.2 13.5c-.1-1.8-1.5-3.2-3.3-3.2-.6 0-1.2.2-1.7.5-.5-2.1-2.4-3.8-4.7-3.8-2.4 0-4.4 1.7-4.8 4-.2 0-.4-.1-.6-.1-1.7 0-3.1 1.4-3.1 3.1 0 1.7 1.4 3.1 3.1 3.1h15.1c1.3 0 2.4-1.1 2.4-2.4 0-1.3-.9-2.3-2.2-2.4z" />
  </svg>
);
