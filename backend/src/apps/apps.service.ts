import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { appPluginsList } from './plugins';
import { ApplicationPlugin } from './interfaces/plugin.interface';

@Injectable()
export class AppsService implements OnModuleInit {
  private readonly pluginsMap = new Map<string, ApplicationPlugin>();

  constructor(private readonly prisma: PrismaService) {
    // Register all plugins
    appPluginsList.forEach(plugin => {
      this.pluginsMap.set(plugin.metadata().id, plugin);
    });
  }

  // Seed default applications in database on module boot
  async onModuleInit() {
    const workspaces = await this.prisma.workspace.findMany();
    for (const workspace of workspaces) {
      await this.seedAppsForWorkspace(workspace.id);
    }
  }

  async seedAppsForWorkspace(workspaceId: string) {
    for (const plugin of appPluginsList) {
      const meta = plugin.metadata();
      const existing = await this.prisma.installedApp.findFirst({
        where: {
          workspaceId,
          appId: meta.id,
        },
      });

      if (!existing) {
        const status = await plugin.status();
        await this.prisma.installedApp.create({
          data: {
            appId: meta.id,
            name: meta.name,
            icon: meta.icon,
            category: meta.category,
            launchCommand: meta.launchCommand || null,
            website: meta.website || null,
            description: meta.description,
            installed: status.installed,
            running: status.running,
            status: status.status,
            workspaceId,
          },
        });
      }
    }
  }

  async getApps(userId: string) {
    // Fetch user's active workspace
    const workspace = await this.prisma.workspace.findFirst({
      where: { userId },
    });

    if (!workspace) {
      throw new NotFoundException('Active workspace could not be located');
    }

    // Auto-seed if missing
    await this.seedAppsForWorkspace(workspace.id);

    return this.prisma.installedApp.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { name: 'asc' },
    });
  }

  async getApp(userId: string, appId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: { userId },
    });

    if (!workspace) {
      throw new NotFoundException('Active workspace could not be located');
    }

    const app = await this.prisma.installedApp.findFirst({
      where: { workspaceId: workspace.id, appId },
    });

    if (!app) {
      throw new NotFoundException(`Application '${appId}' is not registered in this workspace`);
    }

    return app;
  }

  async openApp(userId: string, appId: string) {
    const app = await this.getApp(userId, appId);
    const plugin = this.pluginsMap.get(appId);

    if (!plugin) {
      throw new BadRequestException(`No executable plugin installer found for app: ${appId}`);
    }

    const success = await plugin.open();
    if (!success) {
      throw new BadRequestException(`Failed to launch application: ${appId}`);
    }

    return this.prisma.installedApp.update({
      where: { id: app.id },
      data: {
        running: true,
        status: 'running',
      },
    });
  }

  async closeApp(userId: string, appId: string) {
    const app = await this.getApp(userId, appId);
    const plugin = this.pluginsMap.get(appId);

    if (!plugin) {
      throw new BadRequestException(`No executable plugin installer found for app: ${appId}`);
    }

    await plugin.close();

    return this.prisma.installedApp.update({
      where: { id: app.id },
      data: {
        running: false,
        status: 'stopped',
      },
    });
  }

  async installApp(userId: string, appId: string) {
    const app = await this.getApp(userId, appId);
    const plugin = this.pluginsMap.get(appId);

    if (!plugin) {
      throw new BadRequestException(`No executable plugin installer found for app: ${appId}`);
    }

    const success = await plugin.install();
    if (!success) {
      throw new BadRequestException(`Failed to execute installation for app: ${appId}`);
    }

    return this.prisma.installedApp.update({
      where: { id: app.id },
      data: {
        installed: true,
      },
    });
  }

  async uninstallApp(userId: string, appId: string) {
    const app = await this.getApp(userId, appId);
    const plugin = this.pluginsMap.get(appId);

    if (!plugin) {
      throw new BadRequestException(`No executable plugin installer found for app: ${appId}`);
    }

    await plugin.uninstall();

    return this.prisma.installedApp.update({
      where: { id: app.id },
      data: {
        installed: false,
        running: false,
        status: 'stopped',
      },
    });
  }
}
