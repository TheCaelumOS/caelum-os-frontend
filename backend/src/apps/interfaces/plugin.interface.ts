export interface AppMetadata {
  id: string;
  name: string;
  icon: string;
  category: string;
  launchCommand?: string;
  website?: string;
  description: string;
}

export interface AppStatus {
  installed: boolean;
  running: boolean;
  status: 'running' | 'stopped' | 'error';
  health: 'healthy' | 'unhealthy' | 'unknown';
}

export interface ApplicationPlugin {
  metadata(): AppMetadata;
  install(): Promise<boolean>;
  uninstall(): Promise<boolean>;
  open(): Promise<boolean>;
  close(): Promise<boolean>;
  status(): Promise<AppStatus>;
}
