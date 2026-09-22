/**
 * CaelumOS Terminal Command Router
 * 
 * Separates user terminal inputs into two deterministic execution channels:
 * 1. REAL LINUX SHELL (Executes directly against the OS / Docker Engine)
 * 2. CAELUMOS AI ASSISTANT (Natural language infrastructure requests / planning)
 */

export const RECOGNIZED_SHELL_BINARIES = new Set<string>([
  // Containers & Orchestration
  'docker', 'docker-compose', 'podman', 'kubectl', 'minikube', 'helm', 'crictl', 'containerd',
  
  // Version Control
  'git', 'gh', 'svn', 'hg',

  // Core Linux Utilities
  'ls', 'cd', 'pwd', 'mkdir', 'rm', 'rmdir', 'cp', 'mv', 'cat', 'grep', 'find', 'ps', 
  'top', 'htop', 'df', 'du', 'free', 'uname', 'whoami', 'id', 'which', 'whereis', 'curl',
  'wget', 'ssh', 'scp', 'chmod', 'chown', 'systemctl', 'journalctl', 'kill', 'killall',
  'head', 'tail', 'less', 'more', 'echo', 'env', 'export', 'source', 'alias', 'touch',
  'tar', 'gzip', 'gunzip', 'unzip', 'zip', 'sed', 'awk', 'man', 'history', 'date', 
  'uptime', 'ping', 'traceroute', 'netstat', 'ss', 'ip', 'ifconfig', 'lsof', 'nano', 
  'vim', 'vi', 'tree', 'diff', 'patch', 'file', 'base64', 'cut', 'sort', 'uniq', 'wc', 
  'tee', 'xargs', 'sudo', 'su',

  // Developer Runtimes & Infrastructure Tools
  'python', 'python3', 'pip', 'pip3', 'node', 'npm', 'npx', 'yarn', 'pnpm', 'bun',
  'terraform', 'tofu', 'ansible', 'ansible-playbook', 'cargo', 'rustc', 'go', 'make',
  'cmake', 'gcc', 'g++', 'clang', 'java', 'javac', 'mvn', 'gradle', 'bash', 'sh', 
  'zsh', 'fish', 'pwsh', 'powershell'
]);

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
  'deploy ',
  'create ',
  'provision ',
  'setup ',
  'set up ',
  'scale ',
  'build ',
  'generate ',
  'architect ',
  'design ',
  'how do i ',
  'how to ',
  'what is ',
  'why is ',
  'explain ',
  'can you ',
  'please ',
  'ai ',
  'ask '
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

  // 2. Tokenize input
  const tokens = trimmed.split(/\s+/);
  let firstToken = tokens[0].toLowerCase();

  // If command starts with sudo, inspect the wrapped binary
  if (firstToken === 'sudo' && tokens.length > 1) {
    firstToken = tokens[1].toLowerCase();
  }

  // Strip path prefix if any (e.g., /usr/bin/docker -> docker)
  const baseBinary = firstToken.includes('/') ? firstToken.split('/').pop() || firstToken : firstToken;

  // 3. Recognized Shell Command Check
  // Check if it's a known binary OR a script path (e.g. ./deploy.sh, /bin/sh)
  const isPathExecution = firstToken.startsWith('./') || firstToken.startsWith('../') || firstToken.startsWith('/') || firstToken.startsWith('~/');
  const isEnvAssignment = /^[A-Za-z_][A-Za-z0-9_]*=/.test(firstToken);
  const isKnownShellBinary = RECOGNIZED_SHELL_BINARIES.has(baseBinary);

  if (isKnownShellBinary || isPathExecution || isEnvAssignment) {
    // Check for potentially destructive commands
    const isDestructive = DESTRUCTIVE_COMMAND_PATTERNS.some(pattern => pattern.test(trimmed));
    const hasForceFlag = tokens.some(t => t === '-f' || t === '--force' || t === '-y' || t === '--yes' || t === '--confirm');

    if (isDestructive && !hasForceFlag && !isConfirmed) {
      return {
        type: 'destructive_warning',
        raw: trimmed,
        binary: baseBinary,
        args: tokens.slice(1),
        isDestructive: true,
        warningMessage: `[Security Guard] Potentially destructive command detected: "${trimmed}"\nType 'yes' to proceed with execution on CaelumOS, or append '--confirm' to bypass.`
      };
    }

    return {
      type: 'shell',
      raw: trimmed,
      binary: baseBinary,
      args: tokens.slice(1),
      isDestructive
    };
  }

  // 4. Explicit AI Prefix or Natural Language Pattern
  const hasNaturalLanguagePrefix = NATURAL_LANGUAGE_PREFIXES.some(prefix => lower.startsWith(prefix));

  if (hasNaturalLanguagePrefix) {
    // Extract cleaned prompt
    let prompt = trimmed;
    if (lower.startsWith('ai ')) prompt = trimmed.slice(3).trim();
    if (lower.startsWith('ask ')) prompt = trimmed.slice(4).trim();

    return {
      type: 'ai',
      raw: trimmed,
      aiPrompt: prompt
    };
  }

  // 5. Fallback heuristics:
  // If the sentence has 3+ words or contains conversational/interrogative verbs, classify as AI
  const isConversationalSentence = tokens.length >= 3 && (
    lower.includes('my ') || 
    lower.includes('the ') || 
    lower.includes('this ') || 
    lower.includes('for ') || 
    lower.includes('with ') || 
    lower.includes('in ') ||
    lower.includes('to ') ||
    lower.endsWith('?')
  );

  if (isConversationalSentence) {
    return {
      type: 'ai',
      raw: trimmed,
      aiPrompt: trimmed
    };
  }

  // Otherwise, default to real shell execution so user never gets unexpected AI output on unrecognized commands
  // (e.g. standard "command not found" from the OS shell)
  return {
    type: 'shell',
    raw: trimmed,
    binary: baseBinary,
    args: tokens.slice(1),
    isDestructive: false
  };
}
