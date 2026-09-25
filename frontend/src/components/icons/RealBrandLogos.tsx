import React from 'react';

/**
 * Visual Studio Code - Official Microsoft Brand Mark
 * Multi-layer folded ribbon origami design
 */
export const VscodeLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vsc-back" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1F8AD2" />
        <stop offset="100%" stopColor="#0065A9" />
      </linearGradient>
      <linearGradient id="vsc-mid" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2488D8" />
        <stop offset="100%" stopColor="#007ACC" />
      </linearGradient>
    </defs>
    {/* Background Base */}
    <path
      d="M72.2 4.2a6 6 0 0 0-4.2 1.7L25.3 43.1 9.8 31.4a4 4 0 0 0-5.1.2L1.5 34.3a4 4 0 0 0-.2 5.5l14.2 13.2L1.3 66.2a4 4 0 0 0 .2 5.5l3.2 2.7a4 4 0 0 0 5.1.2l15.5-11.7 42.7 37.2a6 6 0 0 0 4.2 1.7 6 6 0 0 0 6-6V10.2a6 6 0 0 0-6-6zm0 25.4v40.8L46.2 50 72.2 29.6z"
      fill="#007ACC"
    />
    {/* Top Fold */}
    <path
      d="M72.2 4.2a6 6 0 0 0-4.2 1.7L25.3 43.1l11 9.6 35.9-23.1V4.2z"
      fill="url(#vsc-back)"
    />
    {/* Bottom Shadow Fold */}
    <path
      d="M72.2 95.8a6 6 0 0 1-4.2-1.7L25.3 56.9l11-9.6 35.9 23.1v25.4z"
      fill="#0065A9"
    />
    {/* Central Ribbon Core */}
    <path
      d="M46.2 50L72.2 29.6v40.8L46.2 50z"
      fill="#3AA4F4"
    />
  </svg>
);

/**
 * Docker - Official Whale Logo with Shipping Containers
 */
export const DockerLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="#2496ED" xmlns="http://www.w3.org/2000/svg">
    {/* Top Container */}
    <rect x="11.03" y="3.39" width="2.12" height="1.89" rx="0.19" fill="#2496ED" />
    
    {/* Middle Row Containers */}
    <rect x="5.15" y="6.1" width="2.12" height="1.89" rx="0.19" fill="#2496ED" />
    <rect x="8.09" y="6.1" width="2.12" height="1.89" rx="0.19" fill="#2496ED" />
    <rect x="11.03" y="6.1" width="2.12" height="1.89" rx="0.19" fill="#2496ED" />

    {/* Bottom Row Containers */}
    <rect x="2.2" y="8.82" width="2.12" height="1.89" rx="0.19" fill="#2496ED" />
    <rect x="5.15" y="8.82" width="2.12" height="1.89" rx="0.19" fill="#2496ED" />
    <rect x="8.09" y="8.82" width="2.12" height="1.89" rx="0.19" fill="#2496ED" />
    <rect x="11.03" y="8.82" width="2.12" height="1.89" rx="0.19" fill="#2496ED" />
    <rect x="13.98" y="8.82" width="2.12" height="1.89" rx="0.19" fill="#2496ED" />

    {/* Whale Body, Spout & Tail Flukes */}
    <path
      d="M23.77 12.01c-.3-.23-.7-.34-1.19-.34-.33 0-.66.05-.98.15-.35-1.12-1.39-1.92-2.61-1.92-.37 0-.72.07-1.04.21-.49-.78-1.35-1.3-2.34-1.3h-.37v-.04c0-.1-.08-.18-.18-.18h-2.31c-.1 0-.18.08-.18.18v.04H8.1v-.04c0-.1-.08-.18-.18-.18H5.61c-.1 0-.18.08-.18.18v.04h-.23c-.1 0-.18.08-.18.18v2.89H2.71c-.1 0-.18.08-.18.18v2.89H.18c-.1 0-.18.08-.18.18v1.17c0 1.93.58 3.73 1.62 5.09 1.44 1.88 3.58 3.03 6.01 3.03 5.48 0 9.87-3.79 10.6-8.86.66.36 1.43.56 2.24.56.59 0 1.15-.11 1.67-.32.48-.19.9-.47 1.25-.82.47-.46.77-1.08.77-1.77 0-.58-.2-1.13-.59-1.57z"
      fill="#2496ED"
    />
    {/* Whale Eye */}
    <circle cx="17.15" cy="13.28" r="0.63" fill="#FFFFFF" />
  </svg>
);

/**
 * Kubernetes - Official CNCF Ship Helm Wheel
 */
export const KubernetesLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Heptagon Base in CNCF Blue */}
    <path
      fill="#326CE5"
      d="M12.44 2.1a1.23 1.23 0 00-.88 0L3.18 5.5a1.24 1.24 0 00-.73 1.05v9.9a1.24 1.24 0 00.73 1.05l8.38 3.4a1.23 1.23 0 00.88 0l8.38-3.4a1.24 1.24 0 00.73-1.05v-9.9a1.24 1.24 0 00-.73-1.05z"
    />
    {/* Outer Wheel Ring */}
    <circle cx="12" cy="12" r="5.2" fill="none" stroke="#FFFFFF" strokeWidth="1.2" />
    {/* Inner Hub Ring */}
    <circle cx="12" cy="12" r="2.2" fill="#326CE5" stroke="#FFFFFF" strokeWidth="1.1" />
    <circle cx="12" cy="12" r="1.1" fill="#FFFFFF" />
    {/* 7 Canonical Spokes */}
    <path
      stroke="#FFFFFF"
      strokeWidth="1.15"
      strokeLinecap="round"
      d="M12 6.8V4.5M15.8 7.6l1.6-1.6M17.2 11.5h2.3M15.4 15.6l1.6 1.6M12 17.2v2.3M8.6 15.6l-1.6 1.6M6.8 11.5H4.5M8.2 7.6L6.6 6"
    />
  </svg>
);

/**
 * Grafana - Official Swirling Flame Vortex
 */
export const GrafanaLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grafanaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF7A00" />
        <stop offset="60%" stopColor="#F46800" />
        <stop offset="100%" stopColor="#EA4800" />
      </linearGradient>
    </defs>
    <path
      fill="url(#grafanaGradient)"
      d="M12.01 2a10 10 0 1 0 10 10A10 10 0 0 0 12.01 2zm4.7 13.78a5.2 5.2 0 0 1-7.25-.66 5.23 5.23 0 0 1 .49-7.26 5.16 5.16 0 0 1 7.2.49 4.2 4.2 0 0 0-2.31 1.7 4.14 4.14 0 0 0-.25 2.87 4.23 4.23 0 0 0 2.12 2.86zm1.18-1.42a6.38 6.38 0 0 0-.64-3.56 6.3 6.3 0 0 0-2.8-2.7 6.4 6.4 0 0 0-7.85 1.7 6.36 6.36 0 0 0 1.25 8.92 6.39 6.39 0 0 0 8.87-.97c.43-.54.81-1.48 1.17-3.39z"
    />
  </svg>
);

/**
 * Amazon Web Services (AWS) - Official Brand Mark with Smile Arrow
 */
export const AwsLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* 'a' */}
    <path
      fill="#FFFFFF"
      d="M8.2 15.3c-.8 0-1.5.3-2 .8v-3.1H4.6v8.4h1.7v-.8c.5.6 1.2.9 2 .9 1.9 0 3.2-1.5 3.2-3.1s-1.4-3.1-3.3-3.1zm-.4 4.8c-1.1 0-1.7-.8-1.7-1.7 0-.9.6-1.7 1.7-1.7 1 0 1.6.8 1.6 1.7 0 .9-.6 1.7-1.6 1.7z"
    />
    {/* 'w' */}
    <path
      fill="#FFFFFF"
      d="M18.8 13h-1.8l-1.4 4.9-1.4-4.9h-1.7l-1.4 4.9-1.4-4.9H8l2.2 8.4h1.9l1.4-4.7 1.4 4.7h1.9l2-8.4z"
    />
    {/* 's' */}
    <path
      fill="#FFFFFF"
      d="M23.4 15.6c-.9-.4-1.8-.7-1.8-1.3 0-.5.5-.8 1.1-.8.7 0 1.4.3 2 .7l.8-1.4c-.8-.6-1.7-.8-2.8-.8-2 0-3.1 1.2-3.1 2.6 0 1.4 1.2 2 2.4 2.5 1 .4 1.6.7 1.6 1.3 0 .6-.6 1-1.4 1-1 0-1.8-.4-2.5-1l-.9 1.4c.9.8 2.1 1.2 3.4 1.2 2.2 0 3.4-1.2 3.4-2.7 0-1.5-1.3-2.1-2.2-2.5z"
    />
    {/* Smile Arrow Path in Amazon Orange */}
    <path
      fill="#FF9900"
      d="M26.8 23.4c-3.3 2.3-7.9 3.5-12.4 3.5-6.4 0-11.7-2.3-14.7-6-.4-.5 0-1.2.5-.8 4.6 2.4 10.2 3.8 16 3.8 4.7 0 9.8-1 13.4-3 .7-.4 1.2.3.4.9z"
    />
    <path
      fill="#FF9900"
      d="M27.9 21.5c-.3-.4-1.2-.1-1.6.1-.4.3-.3 1.2.1 1.5.7.4 1.6 1.1 1.7.4.3-.4-1-1.6-.2-2z"
    />
  </svg>
);

/**
 * Microsoft Azure - Official Fluent 3D Cloud A-Fold
 */
export const AzureLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="azureG1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#114A8B" />
        <stop offset="100%" stopColor="#0078D4" />
      </linearGradient>
      <linearGradient id="azureG2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#50E6FF" />
        <stop offset="100%" stopColor="#0078D4" />
      </linearGradient>
    </defs>
    {/* Left Dark Blue Facet */}
    <path
      fill="url(#azureG1)"
      d="M5.4 2.8A1.8 1.8 0 0 0 3.6 4.3L.1 17.6a1.8 1.8 0 0 0 1.7 2.3h7.6l2.3-8.8L5.4 2.8z"
    />
    {/* Right Cyan-Blue Facet */}
    <path
      fill="url(#azureG2)"
      d="M18.6 2.8a1.8 1.8 0 0 1 1.8 1.5l3.5 13.3a1.8 1.8 0 0 1-1.7 2.3h-8.7a1.8 1.8 0 0 1-1.7-1.3L7.7 7.5l4.8-4.7h6.1z"
    />
  </svg>
);

/**
 * HashiCorp Terraform - Official 3D Isometric Interlocking Facets
 */
export const TerraformLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Facet 1: Upper Left */}
    <path fill="#5C4EE5" d="M1.44 2.4v6.88l5.96 3.44V5.84L1.44 2.4z" />
    {/* Facet 2: Center Isometric */}
    <path fill="#4035B2" d="M8.04 6.24v6.88l5.96 3.44V9.68L8.04 6.24z" />
    {/* Facet 3: Upper Right */}
    <path fill="#844FBA" d="M14.64 2.4v6.88l5.96 3.44V5.84L14.64 2.4z" />
    {/* Facet 4: Bottom Center */}
    <path fill="#5C4EE5" d="M8.04 13.84v6.88l5.96 3.44v-6.88l-5.96-3.44z" />
  </svg>
);

/**
 * GitHub - Official Octocat Silhouette
 */
export const GithubLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-white`} xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"
    />
  </svg>
);

/**
 * Mozilla Firefox - Official Flame Fox and Deep Blue Globe
 */
export const FirefoxLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ffGlobe" cx="60%" cy="60%" r="50%">
        <stop offset="0%" stopColor="#0060df" />
        <stop offset="70%" stopColor="#022e70" />
        <stop offset="100%" stopColor="#250048" />
      </radialGradient>
      <linearGradient id="ffFlame" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE033" />
        <stop offset="35%" stopColor="#FF7A00" />
        <stop offset="80%" stopColor="#E20048" />
        <stop offset="100%" stopColor="#900070" />
      </linearGradient>
    </defs>
    {/* Blue/Violet Globe */}
    <circle cx="12" cy="12" r="8.8" fill="url(#ffGlobe)" />
    {/* Fox Wrap Flame */}
    <path
      fill="url(#ffFlame)"
      d="M21.9 9.8c-.3-.7-.6-1.4-1-2-.1-.2-.4-.2-.5 0-.7 1.1-1.6 1.9-2.7 2.4-.1.1-.3 0-.3-.2.3-1.6-.2-3.3-1.4-4.5-.1-.1-.3 0-.3.1-.2 1.3-.9 2.5-2 3.3-.1.1-.3 0-.3-.2.1-1.3-.4-2.6-1.5-3.4-.1-.1-.3 0-.3.1-.6 1.4-1.7 2.4-3.1 2.8-.2 0-.3-.1-.3-.3.3-1.3 0-2.6-1-3.6-.1-.1-.3 0-.3.2-.2 1.5-1 2.8-2.3 3.6-2.9 1.9-4.2 5.5-3.1 8.8 1.1 3.2 4 5.3 7.4 5.3 4.8 0 8.8-3.6 9.3-8.4.1-1.4-.2-2.7-.7-3.9-.1-.1-.2-.1-.3-.1zm-9.9 8.7c-2.8 0-5-2.2-5-5 0-.8.2-1.6.6-2.3.1-.1.2-.1.3 0 .8 1.3 2.2 2.3 3.8 2.5.2 0 .3.2.3.4 0 1.2.9 2.2 2.1 2.4.2 0 .3.2.3.4 0 .9-.8 1.6-1.8 1.6h-.3z"
    />
  </svg>
);

/**
 * Nautilus - Official Ubuntu 24.04 Yaru Folder Icon
 */
export const NautilusLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="yaruFolder" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FF7733" />
        <stop offset="100%" stopColor="#E95420" />
      </linearGradient>
      <linearGradient id="yaruFolderBack" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#C73E0B" />
        <stop offset="100%" stopColor="#9C2F06" />
      </linearGradient>
    </defs>
    {/* Folder Back Tab */}
    <path fill="url(#yaruFolderBack)" d="M4 6a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h24a3 3 0 0 0 3-3V11a3 3 0 0 0-3-3H15l-3-2H4z" />
    {/* White Paper Inside */}
    <rect x="5" y="9" width="22" height="12" rx="2" fill="#FFFFFF" opacity="0.9" />
    <line x1="8" y1="12" x2="16" y2="12" stroke="#90A4AE" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="8" y1="15" x2="20" y2="15" stroke="#CFD8DC" strokeWidth="1.5" strokeLinecap="round" />
    {/* Folder Front */}
    <path fill="url(#yaruFolder)" d="M1 13a2 2 0 0 1 2-2h26a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V13z" />
  </svg>
);

/**
 * Terminal - Official Ubuntu GNOME Terminal Icon
 */
export const TerminalLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ubuntuTerm" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#300A24" />
        <stop offset="100%" stopColor="#1B0514" />
      </linearGradient>
    </defs>
    {/* Dark Aubergine Frame */}
    <rect x="2" y="3" width="28" height="26" rx="5" fill="url(#ubuntuTerm)" stroke="#5E2750" strokeWidth="1" />
    <line x1="2" y1="9" x2="30" y2="9" stroke="#5E2750" strokeWidth="0.8" />
    {/* 3 Header Dots */}
    <circle cx="6" cy="6" r="1.3" fill="#DF382C" />
    <circle cx="10" cy="6" r="1.3" fill="#EFB73E" />
    <circle cx="14" cy="6" r="1.3" fill="#38B44A" />
    {/* Emerald prompt >_ */}
    <path d="M7 14l5 4-5 4" fill="none" stroke="#48D597" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="14" y1="22" x2="21" y2="22" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * Deploy Dashboard - High-Tech Secure Shield
 */
export const DashboardLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dashShield" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#4C1D95" />
      </linearGradient>
    </defs>
    <path fill="url(#dashShield)" d="M16 2L4 7v8c0 8.5 5.1 14.5 12 16 6.9-1.5 12-7.5 12-16V7L16 2z" />
    <path fill="#10B981" d="M14 19.5l-4-4 1.4-1.4 2.6 2.6 6.6-6.6 1.4 1.4-8 8z" />
  </svg>
);

/**
 * AI Assistant Copilot - Multi-tone Radiant Sparkle
 */
export const AiAssistantLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="copilotG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A855F7" />
        <stop offset="50%" stopColor="#EC4899" />
        <stop offset="100%" stopColor="#6366F1" />
      </linearGradient>
    </defs>
    <path fill="url(#copilotG)" d="M16 2c.8 7 6.2 12.4 13.2 13.2-.8.8-6.2 6.2-13.2 13.2-.8-7-6.2-12.4-13.2-13.2.8-.8 6.2-6.2 13.2-13.2z" />
    <path fill="#F472B6" d="M25 4c.3 2.5 2.2 4.4 4.7 4.7-.3.3-2.2 2.2-4.7 4.7-.3-2.5-2.2-4.4-4.7-4.7.3-.3 2.2-2.2 4.7-4.7z" />
  </svg>
);

/**
 * Settings - GNOME Control Center Gear
 */
export const SettingsLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gnomeGear" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#718096" />
        <stop offset="100%" stopColor="#4A5568" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="url(#gnomeGear)" />
    <circle cx="16" cy="16" r="4.8" fill="#1A202C" />
    <path
      fill="#E2E8F0"
      d="M18 4h-4l-.5 3a9 9 0 0 0-2.3 1L8.5 6.2 5.7 9l1.8 2.7a9 9 0 0 0-1 2.3L3.5 14v4l3 .5a9 9 0 0 0 1 2.3L5.7 23.5 8.5 26.3l2.7-1.8a9 9 0 0 0 2.3 1l.5 3h4l.5-3a9 9 0 0 0 2.3-1l2.7 1.8 2.8-2.8-1.8-2.7a9 9 0 0 0 1-2.3l3-.5v-4l-3-.5a9 9 0 0 0-1-2.3l1.8-2.7-2.8-2.8-2.7 1.8a9 9 0 0 0-2.3-1L18 4zm-2 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"
    />
  </svg>
);

/**
 * Git - Official Git SCM Branching Diamond Logo
 */
export const GitLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#F05032"
      d="M30.6 14.6l-13.2-13.2a2.3 2.3 0 0 0-3.3 0L9.9 5.6l3.8 3.8a2.7 2.7 0 0 1 3.5 3.5l3.6 3.6a2.7 2.7 0 1 1-1.6 1.6l-3.3-3.3v6.7a2.7 2.7 0 1 1-2.3 0v-7.1a2.7 2.7 0 0 1-1.4-3.6L8.4 7l-7 7a2.3 2.3 0 0 0 0 3.3l13.2 13.2a2.3 2.3 0 0 0 3.3 0l12.7-12.6a2.3 2.3 0 0 0 0-3.3z"
    />
  </svg>
);

/**
 * Linux - Authentic Tux Penguin Brand Icon
 */
export const LinuxLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <path
      fill="#1A1A1A"
      d="M16 2c-4 0-7 3.5-7 8 0 2 .5 4 1 5-2 1.5-4 4.5-4 8 0 3 2.5 5 6 5.5-1 .5-2 1-2 1.5 0 .8 2.5 1 6 1s6-.2 6-1c0-.5-1-1-2-1.5 3.5-.5 6-2.5 6-5.5 0-3.5-2-6.5-4-8 .5-1 1-3 1-5 0-4.5-3-8-7-8z"
    />
    {/* White Belly */}
    <ellipse cx="16" cy="19" rx="5" ry="6.5" fill="#FFFFFF" />
    {/* Eyes */}
    <circle cx="14" cy="9.5" r="1.5" fill="#FFFFFF" />
    <circle cx="18" cy="9.5" r="1.5" fill="#FFFFFF" />
    <circle cx="14.3" cy="9.5" r="0.8" fill="#000000" />
    <circle cx="17.7" cy="9.5" r="0.8" fill="#000000" />
    {/* Beak */}
    <path d="M14 11.5c1 1.2 3 1.2 4 0-1 2-3 2-4 0z" fill="#FFA500" stroke="#E67E22" strokeWidth="0.5" />
    {/* Feet */}
    <path d="M10 27.5c2 0 4 .5 4 1.5s-2 1-4 1-3-.3-3-1 1.5-1.5 3-1.5zm12 0c2 0 3 .8 3 1.5s-1 1-3 1-4 0-4-1 2-1.5 4-1.5z" fill="#FFA500" />
  </svg>
);

/**
 * Cloudflare - Official Cloudflare Orange Cloud
 */
export const CloudflareLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#F38020"
      d="M24.8 17.5c-.2-2.5-2-4.4-4.5-4.4-.8 0-1.6.2-2.3.7-.7-2.9-3.3-5.1-6.4-5.1-3.3 0-6 2.3-6.6 5.5-.3 0-.5-.1-.8-.1-2.3 0-4.2 1.9-4.2 4.2 0 2.3 1.9 4.2 4.2 4.2h20.6c1.8 0 3.3-1.5 3.3-3.3 0-1.7-1.3-3.1-3.3-3.2z"
    />
    <path
      fill="#FAAD3F"
      d="M26.2 18.2c-.3 0-.5.1-.8.2-.2-1.5-1.5-2.6-3-2.6-.5 0-.9.1-1.3.3.3.6.5 1.3.5 2.1 0 1.9-1.5 3.4-3.4 3.4h7.9c.7 0 1.2-.5 1.2-1.2 0-.6-.5-1.1-1.1-1.2z"
    />
  </svg>
);

/**
 * YouTube - Official YouTube Red Screen Play Mark
 */
export const YoutubeLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#FF0000"
      d="M31.3 8.3a4 4 0 0 0-2.8-2.8C26 5 16 5 16 5s-10 0-12.5.5A4 4 0 0 0 .7 8.3C0 10.8 0 16 0 16s0 5.2.7 7.7a4 4 0 0 0 2.8 2.8C6 27 16 27 16 27s10 0 12.5-.5a4 4 0 0 0 2.8-2.8c.7-2.5.7-7.7.7-7.7s0-5.2-.7-7.7z"
    />
    <path fill="#FFFFFF" d="M12.7 20.7l8.3-4.7-8.3-4.7v9.4z" />
  </svg>
);

/**
 * Google - Official 4-Color 'G' Logo
 */
export const GoogleLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#4285F4"
      d="M31.6 16.3c0-1.1-.1-2.2-.3-3.2H16v6.1h8.8c-.4 2-1.5 3.7-3.2 4.9v4h5.2c3-2.8 4.8-6.9 4.8-11.8z"
    />
    <path
      fill="#34A853"
      d="M16 32c4.3 0 8-1.4 10.7-3.9l-5.2-4c-1.5 1-3.3 1.6-5.5 1.6-4.2 0-7.8-2.8-9.1-6.7H1.5v4.2C4.2 28.5 9.7 32 16 32z"
    />
    <path
      fill="#FBBC05"
      d="M6.9 19c-.3-1-.5-2.1-.5-3s.2-2 .5-3V8.8H1.5C.5 10.8 0 13.3 0 16s.5 5.2 1.5 7.2L6.9 19z"
    />
    <path
      fill="#EA4335"
      d="M16 6.3c2.4 0 4.5.8 6.1 2.4l4.6-4.6C23.9 1.6 20.3 0 16 0 9.7 0 4.2 3.5 1.5 8.8L6.9 13C8.2 9.1 11.8 6.3 16 6.3z"
    />
  </svg>
);

