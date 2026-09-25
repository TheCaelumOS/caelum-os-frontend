import React from 'react';

/**
 * Caelum - Official brand mark emblem.
 * Sourced directly from the official CaelumOS brand asset.
 */
export const CaleumLogo = ({ className = "w-7 h-7", alt = "Caelum" }: { className?: string; alt?: string }) => (
  <img
    src="/branding/caelumos-icon.png"
    alt={alt}
    className={`${className} object-contain`}
  />
);

/**
 * CaelumOS - Flagship product mark (canonical emblem).
 */
export const CaelumOsLogo = CaleumLogo;
export const CaelumLogo = CaleumLogo;

/**
 * CaelumFullLogo - Official brand logo lockup (emblem + wordmark).
 */
export const CaelumFullLogo = ({ className = "h-8", alt = "CaelumOS", dark = false }: { className?: string; alt?: string; dark?: boolean }) => (
  <img
    src={dark ? "/branding/caelumos-logo-dark.png" : "/branding/caelumos-logo.png"}
    alt={alt}
    className={`${className} w-auto object-contain`}
  />
);

export {
  AwsLogo,
  AzureLogo,
  DockerLogo,
  TerraformLogo,
  KubernetesLogo,
  GithubLogo,
  VscodeLogo as VsCodeLogo,
  GrafanaLogo,
  GitLogo,
  LinuxLogo,
  CloudflareLogo,
} from '../icons/RealBrandLogos';

export const JenkinsLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 4.5a2.5 2.5 0 0 1 2.5 2.5v.5h-5V9A2.5 2.5 0 0 1 13 6.5zm-3 4.5h6v2.5a3 3 0 0 1-6 0zm-2 7a4 4 0 0 1 8 0H8z" />
  </svg>
);

export const PostgreSqlLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.8 14.7c-.5.3-1.1.5-1.8.5-1.2 0-2.2-.6-2.7-1.6-.3-.6-.4-1.3-.4-2.1 0-.8.2-1.5.5-2.1.5-1 1.5-1.6 2.7-1.6.7 0 1.3.2 1.8.5.5.3.8.8 1 1.4h-1.4c-.2-.3-.5-.5-.9-.5-.6 0-1.1.3-1.4.9-.2.4-.3.9-.3 1.4s.1 1 .3 1.4c.3.6.8.9 1.4.9.4 0 .7-.2.9-.5h1.4c-.2.6-.5 1.1-1 1.4z" />
  </svg>
);

export const RedisLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M21.2 7.7l-8.5-4.8a1.5 1.5 0 0 0-1.4 0L2.8 7.7a1.5 1.5 0 0 0-.8 1.3v9.6a1.5 1.5 0 0 0 .8 1.3l8.5 4.8a1.5 1.5 0 0 0 1.4 0l8.5-4.8a1.5 1.5 0 0 0 .8-1.3V9a1.5 1.5 0 0 0-.8-1.3zm-9.2 13L4 16.2v-6.7l8 4.5v6.7zm1-8.2l-7.7-4.4 7.7-4.3 7.7 4.3-7.7 4.4zm7-1.6l-6 3.4V7.6l6-3.4v6.7z" />
  </svg>
);

export const NginxLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2l10 5.8v11.5L12 25.1 2 19.3V7.8L12 2zm-3.5 6.4v7.3h1.8l3.4-5v5h1.8V8.4h-1.8l-3.4 5v-5H8.5z" />
  </svg>
);

export const NodeJsLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2l9.5 5.5v11L12 24 2.5 18.5v-11L12 2zm1.2 5.3c-.6-.3-1.4-.4-2.1-.2-.7.2-1.3.6-1.6 1.2-.4.7-.4 1.6-.2 2.4.2.7.7 1.3 1.3 1.7.5.3 1 .6 1.6.8.5.2 1 .5 1.4.9.4.4.6.9.5 1.5-.1.6-.4 1.1-.9 1.4-.6.4-1.3.5-2 .4-.7-.1-1.4-.4-1.9-.9l-.8 1.2c.7.6 1.6 1 2.5 1.1.9.1 1.9 0 2.7-.5.8-.5 1.3-1.2 1.4-2.1.1-.8-.2-1.6-.7-2.2-.5-.5-1.1-.9-1.8-1.1-.5-.2-1-.4-1.5-.7-.4-.2-.8-.6-.9-1-.2-.5-.1-1 .2-1.4.3-.4.8-.7 1.3-.8.6-.1 1.2 0 1.7.3l.8-1.2z" />
  </svg>
);

export const PythonLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M11.9 2c-3.5 0-3.3 1.5-3.3 1.5v1.6h6.7v1H5.1S2 5.7 2 9.2s2.7 3.4 2.7 3.4h1.6v-2.4s-.1-2.8 2.8-2.8h4.8s2.7.1 2.7-2.6S15.4 2 11.9 2zm-1.8 1.4c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9zm2 18.6c3.5 0 3.3-1.5 3.3-1.5v-1.6H8.7v-1h10.2s3.1.4 3.1-3.1-2.7-3.4-2.7-3.4h-1.6v2.4s.1 2.8-2.8 2.8h-4.8s-2.7-.1-2.7 2.6S8.6 22 12.1 22zm1.8-1.4c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z" />
  </svg>
);
