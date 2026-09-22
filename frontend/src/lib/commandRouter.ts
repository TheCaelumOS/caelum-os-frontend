/**
 * CaelumOS Terminal Command Router
 * 
 * Shell-First Execution Architecture:
 * 1. REAL LINUX SHELL (Executes directly against the OS / Docker Engine)
 * 2. CAELUMOS AI ASSISTANT (Secondary capability for natural language infrastructure planning)
 * 
 * NOTE: NO command allowlists. NO command-specific if/else.
 * Arbitrary valid and invalid shell inputs execute against the genuine CaelumOS shell.
 */

export const DESTRUCTIVE_COMMAND_PATTERNS = [
  /^rm\s+(-[a-zA-Z]*r[a-zA-Z]*f?|--recursive|--force)/i,
  /^rm\s+(-[a-zA-Z]*f[a-zA-Z]*r?)/i,
  /^docker\s+(container\s+)?rm\b/i,
  /^docker\s+rmi\b/i,
  /^docker\s+system\s+prune\b/i,
  /^docker\s+(volume|network)\s+rm\b/i,
  /^kubectl\s+delete\b/i,
  /^terraform\s+destroy\b/i,
];

export const NATURAL_LANGUAGE_PREFIXES = [
  'deploy an ',
  'deploy a ',
  'deploy the ',
  'deploy this ',
  'deploy my ',
  'create an ',
  'create a ',
  'create the ',
  'create my ',
  'create terraform ',
  'create k8s ',
  'create kubernetes ',
  'provision an ',
  'provision a ',
  'provision the ',
  'provision my ',
  'architect an ',
  'architect a ',
  'architect the ',
  'generate an ',
  'generate a ',
  'generate terraform ',
  'generate kubernetes ',
  'scale my ',
  'scale the ',
  'scale our ',
  'set up ',
  'setup ',
  'how do i ',
  'how to ',
  'what is ',
  'why is ',
  'explain ',
  'can you ',
  'please ',
  'ai ',
  'ask ',
  'help me '
];

export type CommandRouteType = 'shell' | 'ai' | 'builtin' | 'destructive_warning';

export interface CommandRouteResult {
  type: CommandRouteType;
  raw: string;
  binary?: string;
  args?: string[];
  builtinAction?: 'help' | 'clear' | 'neofetch' | 'show-plan' | 'docker-diagnostics';
  aiPrompt?: string;
  warningMessage?: string;
  isDestructive?: boolean;
}

/**
 * Classifies raw user input into Shell Execution, AI Request, or System Built-in.
 * Follows the Shell-First Rule: all legitimate or unknown command inputs execute in the shell.
 */
export function routeCommand(rawInput: string, isConfirmed = false): CommandRouteResult {
  const trimmed = rawInput.trim();

  if (!trimmed) {
    return { type: 'shell', raw: '', binary: '' };
  }

  // 1. Built-in Terminal Commands
  const lower = trimmed.toLowerCase();
  if (lower === 'clear') {
    return { type: 'builtin', raw: trimmed, builtinAction: 'clear' };
  }
  if (lower === 'help' || lower === '?') {
    return { type: 'builtin', raw: trimmed, builtinAction: 'help' };
  }
  if (lower === 'neofetch' || lower === 'caelum-specs') {
    return { type: 'builtin', raw: trimmed, builtinAction: 'neofetch' };
  }
  if (lower === 'show-plan' || lower === 'dashboard') {
    return { type: 'builtin', raw: trimmed, builtinAction: 'show-plan' };
  }
  if (
    lower === 'caelum doctor docker' || 
    lower === 'caelum-doctor docker' || 
    lower === 'docker diagnose' || 
    lower === 'docker-diagnostics'
  ) {
    return { type: 'builtin', raw: trimmed, builtinAction: 'docker-diagnostics' };
  }

  // 2. Explicit Natural Language AI Intent (Secondary Capability)
  const hasAIPrefix = NATURAL_LANGUAGE_PREFIXES.some(prefix => lower.startsWith(prefix));
  const hasShellOperators = /[|><;&$]/.test(trimmed) || /^\s*-\w+/.test(trimmed);

  if (hasAIPrefix && !hasShellOperators) {
    let prompt = trimmed;
    if (lower.startsWith('ai ')) prompt = trimmed.slice(3).trim();
    if (lower.startsWith('ask ')) prompt = trimmed.slice(4).trim();
    return {
      type: 'ai',
      raw: trimmed,
      aiPrompt: prompt
    };
  }

  // Conversational sentence with question mark or explicit intent (e.g. "Deploy my app to AWS")
  const tokens = trimmed.split(/\s+/);
  const isConversational = tokens.length >= 4 && !hasShellOperators && (
    (lower.includes('for me') || lower.includes('in my') || lower.includes('to aws') || lower.includes('to azure')) &&
    (lower.startsWith('deploy') || lower.startsWith('create') || lower.startsWith('set up') || lower.startsWith('setup') || lower.startsWith('configure') || lower.startsWith('install'))
  );

  if (isConversational) {
    return {
      type: 'ai',
      raw: trimmed,
      aiPrompt: trimmed
    };
  }

  // 3. Security Guard for Destructive Commands
  const isDestructive = DESTRUCTIVE_COMMAND_PATTERNS.some(pattern => pattern.test(trimmed));
  const hasForceFlag = tokens.some(t => t === '-f' || t === '--force' || t === '-y' || t === '--yes' || t === '--confirm');

  if (isDestructive && !hasForceFlag && !isConfirmed) {
    return {
      type: 'destructive_warning',
      raw: trimmed,
      isDestructive: true,
      warningMessage: `[Security Guard] Potentially destructive command detected: "${trimmed}"\nType 'yes' to proceed with execution on CaelumOS, or append '--confirm' to bypass.`
    };
  }

  // 4. SHELL-FIRST RULE:
  // All other inputs route directly to the genuine Linux shell.
  // Unknown executables naturally produce shell error: "command not found".
  return {
    type: 'shell',
    raw: trimmed,
    binary: tokens[0],
    args: tokens.slice(1),
    isDestructive: false
  };
}
