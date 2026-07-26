import { ApplicationPlugin, AppMetadata, AppStatus } from '../interfaces/plugin.interface';

export class BaseAppPlugin implements ApplicationPlugin {
  constructor(
    protected readonly meta: AppMetadata,
    protected isInstalled = true,
    protected isRunning = false,
  ) {}

  metadata(): AppMetadata {
    return this.meta;
  }

  async install(): Promise<boolean> {
    this.isInstalled = true;
    return true;
  }

  async uninstall(): Promise<boolean> {
    this.isInstalled = false;
    this.isRunning = false;
    return true;
  }

  async open(): Promise<boolean> {
    if (!this.isInstalled) return false;
    this.isRunning = true;
    return true;
  }

  async close(): Promise<boolean> {
    this.isRunning = false;
    return true;
  }

  async status(): Promise<AppStatus> {
    return {
      installed: this.isInstalled,
      running: this.isRunning,
      status: this.isRunning ? 'running' : 'stopped',
      health: this.isRunning ? 'healthy' : 'unknown',
    };
  }
}
