import { Injectable, OnModuleInit, BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs/promises';
import { existsSync, createReadStream } from 'fs';
import { join, resolve, sep } from 'path';

export interface FileItemInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: string;
  created?: string;
  permissions?: string;
  owner?: string;
  group?: string;
  defaultApp?: 'vscode' | 'terminal' | 'browser' | 'text-editor';
  sha256?: string;
}

@Injectable()
export class FilesystemService implements OnModuleInit {
  private storageRoot: string;
  private defaultUserId = 'dev-user-uuid-1234';

  async onModuleInit() {
    this.storageRoot = resolve(
      process.env.CAELUM_STORAGE_PATH || 
      process.env.SANDBOX_ROOT || 
      join(process.cwd(), 'storage')
    );

    if (!existsSync(this.storageRoot)) {
      await fs.mkdir(this.storageRoot, { recursive: true });
    }

    // Seed default developer account storage
    await this.ensureUserStorage(this.defaultUserId);
  }

  getUserHome(userId: string): string {
    const safeUserId = (userId || this.defaultUserId).replace(/[^a-zA-Z0-9_-]/g, '_');
    return resolve(join(this.storageRoot, 'users', safeUserId, 'Home'));
  }

  getSafePath(userIdOrPath: string, relativePath?: string): string {
    let userId: string;
    let targetRelative: string;

    if (relativePath !== undefined) {
      userId = userIdOrPath;
      targetRelative = relativePath;
    } else {
      userId = this.defaultUserId;
      targetRelative = userIdOrPath;
    }

    const userHome = this.getUserHome(userId);
    const cleanRelative = (targetRelative || '').replace(/^[\\/]+/, '');
    const safePath = resolve(join(userHome, cleanRelative));

    if (safePath !== userHome && !safePath.startsWith(userHome + sep)) {
      throw new BadRequestException('Access Denied: Path traversal attempt blocked');
    }

    return safePath;
  }

  async ensureUserStorage(userId: string): Promise<string> {
    const userHome = this.getUserHome(userId);
    if (!existsSync(userHome)) {
      await fs.mkdir(userHome, { recursive: true });
    }

    // Standard CaelumOS User Home Directories
    const standardDirs = ['Desktop', 'Documents', 'Downloads', 'Pictures', 'Projects', 'Videos'];
    for (const dir of standardDirs) {
      const dirPath = join(userHome, dir);
      if (!existsSync(dirPath)) {
        await fs.mkdir(dirPath, { recursive: true });
      }
    }

    // Seed welcome document in Documents
    const welcomeDocPath = join(userHome, 'Documents', 'welcome.txt');
    if (!existsSync(welcomeDocPath)) {
      await fs.writeFile(
        welcomeDocPath,
        `========================================\nWelcome to CaelumOS Persistent Storage\n========================================\n\nThis directory is your private, isolated persistent workspace.\nAll files and folders created here are saved directly to your personal storage.\n\nKey Features:\n- Fast, isolated file access per user account\n- Support for uploading, downloading, moving, copying, and renaming\n- Integrated with CaelumOS Terminal, VS Code, and Text Editors\n- Real disk persistence with quota tracking\n\nEnjoy building on CaelumOS!\n`,
        'utf8'
      );
    }

    // Seed starter project in Projects
    const starterDir = join(userHome, 'Projects', 'caelum-starter');
    if (!existsSync(starterDir)) {
      await fs.mkdir(starterDir, { recursive: true });
      await fs.writeFile(
        join(starterDir, 'app.ts'),
        `// CaelumOS Cloud-Native Starter Project\nconsole.log('CaelumOS Development Engine v2.1 initialized.');\n\nexport interface ServiceConfig {\n  name: string;\n  version: string;\n  env: 'development' | 'production';\n}\n\nexport const config: ServiceConfig = {\n  name: 'caelum-starter',\n  version: '1.0.0',\n  env: 'development',\n};\n`,
        'utf8'
      );
      await fs.writeFile(
        join(starterDir, 'package.json'),
        JSON.stringify(
          {
            name: 'caelum-starter',
            version: '1.0.0',
            description: 'User workspace starter project in CaelumOS',
            scripts: { start: 'ts-node app.ts' },
            dependencies: { typescript: '^5.0.0' },
          },
          null,
          2
        ),
        'utf8'
      );
    }

    // Seed desktop note
    const desktopNote = join(userHome, 'Desktop', 'README.txt');
    if (!existsSync(desktopNote)) {
      await fs.writeFile(
        desktopNote,
        `CaelumOS Desktop Directory\nFiles saved here are readily available in your desktop workspace.\n`,
        'utf8'
      );
    }

    return userHome;
  }

  private inferDefaultApp(name: string, isDirectory: boolean): 'vscode' | 'terminal' | 'browser' | 'text-editor' | undefined {
    if (isDirectory) return undefined;
    const lower = name.toLowerCase();
    if (lower.endsWith('.sh') || lower.endsWith('.bash')) return 'terminal';
    if (lower.endsWith('.html') || lower.endsWith('.svg') || lower.endsWith('.htm')) return 'browser';
    if (
      lower.endsWith('.ts') ||
      lower.endsWith('.tsx') ||
      lower.endsWith('.js') ||
      lower.endsWith('.jsx') ||
      lower.endsWith('.json') ||
      lower.endsWith('.tf') ||
      lower.endsWith('.tfstate') ||
      lower.endsWith('.py') ||
      lower.endsWith('.yaml') ||
      lower.endsWith('.yml') ||
      lower.endsWith('.css')
    ) {
      return 'vscode';
    }
    return 'text-editor';
  }

  async listFiles(userId: string, relativePath = '/'): Promise<FileItemInfo[]> {
    await this.ensureUserStorage(userId);
    const userHome = this.getUserHome(userId);
    const targetPath = this.getSafePath(userId, relativePath);

    try {
      if (!existsSync(targetPath)) {
        return [];
      }

      const stats = await fs.stat(targetPath);
      if (!stats.isDirectory()) {
        throw new BadRequestException('Target path is not a directory');
      }

      const entries = await fs.readdir(targetPath, { withFileTypes: true });
      const items: FileItemInfo[] = [];

      for (const entry of entries) {
        const fullPath = join(targetPath, entry.name);
        try {
          const entryStats = await fs.stat(fullPath);
          const isDir = entryStats.isDirectory();
          
          let itemRelative = fullPath.substring(userHome.length).replace(/\\/g, '/');
          if (!itemRelative.startsWith('/')) {
            itemRelative = '/' + itemRelative;
          }

          items.push({
            name: entry.name,
            path: itemRelative,
            isDirectory: isDir,
            size: isDir ? 4096 : entryStats.size,
            modified: entryStats.mtime.toISOString().replace('T', ' ').slice(0, 16),
            created: entryStats.birthtime.toISOString().replace('T', ' ').slice(0, 16),
            permissions: isDir ? '0755' : entry.name.endsWith('.sh') ? '0755' : '0644',
            owner: 'user',
            group: 'caelum-users',
            defaultApp: this.inferDefaultApp(entry.name, isDir),
          });
        } catch {
          // Skip broken symlinks or unreadable files
        }
      }

      // Sort: Folders first alphabetically, then files alphabetically
      items.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      });

      return items;
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      return [];
    }
  }

  async readFile(userId: string, relativePath: string) {
    await this.ensureUserStorage(userId);
    const targetPath = this.getSafePath(userId, relativePath);

    try {
      if (!existsSync(targetPath)) {
        throw new NotFoundException('File could not be located');
      }
      const stats = await fs.stat(targetPath);
      if (stats.isDirectory()) {
        throw new BadRequestException('Cannot read content of a directory path');
      }
      const content = await fs.readFile(targetPath, 'utf8');
      return { 
        path: relativePath, 
        content,
        size: stats.size,
        modified: stats.mtime
      };
    } catch (e) {
      if (e instanceof BadRequestException || e instanceof NotFoundException) throw e;
      throw new NotFoundException('File could not be located');
    }
  }

  async writeFile(userId: string, relativePath: string, content: string) {
    await this.ensureUserStorage(userId);
    const targetPath = this.getSafePath(userId, relativePath);

    try {
      const parentDir = resolve(join(targetPath, '..'));
      if (!existsSync(parentDir)) {
        await fs.mkdir(parentDir, { recursive: true });
      }
      await fs.writeFile(targetPath, content, 'utf8');
      return { path: relativePath, success: true };
    } catch (e) {
      throw new BadRequestException('Failed to write file content');
    }
  }

  async deleteFile(userId: string, relativePath: string) {
    await this.ensureUserStorage(userId);
    const userHome = this.getUserHome(userId);
    const targetPath = this.getSafePath(userId, relativePath);

    if (targetPath === userHome) {
      throw new BadRequestException('Cannot delete root user home directory');
    }

    try {
      if (!existsSync(targetPath)) {
        throw new NotFoundException('File or directory not found');
      }
      const stats = await fs.stat(targetPath);
      if (stats.isDirectory()) {
        await fs.rm(targetPath, { recursive: true, force: true });
      } else {
        await fs.unlink(targetPath);
      }
      return { path: relativePath, success: true };
    } catch (e) {
      if (e instanceof NotFoundException || e instanceof BadRequestException) throw e;
      throw new BadRequestException('Failed to delete file or directory');
    }
  }

  async mkdir(userId: string, relativePath: string) {
    await this.ensureUserStorage(userId);
    const targetPath = this.getSafePath(userId, relativePath);

    try {
      if (existsSync(targetPath)) {
        throw new BadRequestException('Directory or file already exists');
      }
      await fs.mkdir(targetPath, { recursive: true });
      return { path: relativePath, success: true };
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('Failed to create directory');
    }
  }

  async moveFile(userId: string, sourceRelative: string, destRelative: string) {
    await this.ensureUserStorage(userId);
    const sourcePath = this.getSafePath(userId, sourceRelative);
    const destPath = this.getSafePath(userId, destRelative);

    try {
      if (!existsSync(sourcePath)) {
        throw new NotFoundException('Source file or directory does not exist');
      }
      const parentDir = resolve(join(destPath, '..'));
      if (!existsSync(parentDir)) {
        await fs.mkdir(parentDir, { recursive: true });
      }
      await fs.rename(sourcePath, destPath);
      return { source: sourceRelative, destination: destRelative, success: true };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException('Failed to relocate file or directory');
    }
  }

  async copyFile(userId: string, sourceRelative: string, destRelative: string) {
    await this.ensureUserStorage(userId);
    const sourcePath = this.getSafePath(userId, sourceRelative);
    const destPath = this.getSafePath(userId, destRelative);

    try {
      if (!existsSync(sourcePath)) {
        throw new NotFoundException('Source file or directory does not exist');
      }
      const parentDir = resolve(join(destPath, '..'));
      if (!existsSync(parentDir)) {
        await fs.mkdir(parentDir, { recursive: true });
      }
      await fs.cp(sourcePath, destPath, { recursive: true });
      return { source: sourceRelative, destination: destRelative, success: true };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException('Failed to duplicate file or directory');
    }
  }

  async handleUpload(userId: string, relativePath: string, file: any) {
    await this.ensureUserStorage(userId);
    if (!file || !file.originalname) {
      throw new BadRequestException('No file uploaded');
    }

    const targetPath = this.getSafePath(userId, join(relativePath, file.originalname));
    try {
      const parentDir = resolve(join(targetPath, '..'));
      if (!existsSync(parentDir)) {
        await fs.mkdir(parentDir, { recursive: true });
      }
      await fs.writeFile(targetPath, file.buffer);
      return { 
        filename: file.originalname, 
        size: file.size, 
        path: relativePath,
        success: true 
      };
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('Failed to upload file');
    }
  }

  async searchFiles(userId: string, query: string, startPath = '/'): Promise<FileItemInfo[]> {
    await this.ensureUserStorage(userId);
    const userHome = this.getUserHome(userId);
    const targetPath = this.getSafePath(userId, startPath);

    if (!existsSync(targetPath)) return [];

    const results: FileItemInfo[] = [];
    const lowerQuery = (query || '').toLowerCase().trim();
    if (!lowerQuery) return [];

    const walk = async (currentDir: string) => {
      if (results.length >= 100) return; // Limit results to 100 items

      try {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = join(currentDir, entry.name);
          const isDir = entry.isDirectory();

          if (entry.name.toLowerCase().includes(lowerQuery)) {
            try {
              const entryStats = await fs.stat(fullPath);
              let itemRelative = fullPath.substring(userHome.length).replace(/\\/g, '/');
              if (!itemRelative.startsWith('/')) {
                itemRelative = '/' + itemRelative;
              }

              results.push({
                name: entry.name,
                path: itemRelative,
                isDirectory: isDir,
                size: isDir ? 4096 : entryStats.size,
                modified: entryStats.mtime.toISOString().replace('T', ' ').slice(0, 16),
                created: entryStats.birthtime.toISOString().replace('T', ' ').slice(0, 16),
                permissions: isDir ? '0755' : entry.name.endsWith('.sh') ? '0755' : '0644',
                owner: 'user',
                group: 'caelum-users',
                defaultApp: this.inferDefaultApp(entry.name, isDir),
              });
            } catch {}
          }

          if (isDir) {
            await walk(fullPath);
          }
        }
      } catch {}
    };

    await walk(targetPath);
    return results;
  }

  async getQuota(userId: string) {
    await this.ensureUserStorage(userId);
    const userHome = this.getUserHome(userId);

    let totalBytes = 0;

    const calcDir = async (dir: string) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          if (entry.isDirectory()) {
            await calcDir(fullPath);
          } else {
            try {
              const stats = await fs.stat(fullPath);
              totalBytes += stats.size;
            } catch {}
          }
        }
      } catch {}
    };

    await calcDir(userHome);

    const quotaBytes = 50 * 1024 * 1024 * 1024; // 50 GB
    const freeBytes = Math.max(0, quotaBytes - totalBytes);
    const usedPercent = Math.min(100, Math.round((totalBytes / quotaBytes) * 10000) / 100);

    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return {
      usedBytes: totalBytes,
      quotaBytes,
      freeBytes,
      usedPercent,
      usedFormatted: formatBytes(totalBytes),
      freeFormatted: formatBytes(freeBytes),
      quotaFormatted: formatBytes(quotaBytes),
    };
  }
}
