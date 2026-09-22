import { Injectable, OnModuleInit, BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve } from 'path';

@Injectable()
export class FilesystemService implements OnModuleInit {
  private sandboxRoot: string;

  async onModuleInit() {
    // Setup local workspace sandbox directory
    this.sandboxRoot = resolve(process.env.SANDBOX_ROOT || join(process.cwd(), 'sandbox'));
    if (!existsSync(this.sandboxRoot)) {
      await fs.mkdir(this.sandboxRoot, { recursive: true });
    }
    await this.seedDefaultSandboxFiles();
  }

  getSafePath(relativePath: string): string {
    const safePath = resolve(join(this.sandboxRoot, relativePath || ''));
    if (!safePath.startsWith(this.sandboxRoot)) {
      throw new BadRequestException('Access Denied: Path traversal attempt blocked');
    }
    return safePath;
  }

  async listFiles(relativePath: string) {
    const targetPath = this.getSafePath(relativePath);
    try {
      if (!existsSync(targetPath)) {
        return [];
      }

      const stats = await fs.stat(targetPath);
      if (!stats.isDirectory()) {
        throw new BadRequestException('Target path is not a directory');
      }

      const files = await fs.readdir(targetPath);
      const list = [];

      for (const file of files) {
        const filePath = join(targetPath, file);
        const fileStats = await fs.stat(filePath);
        list.push({
          name: file,
          path: filePath.substring(this.sandboxRoot.length).replace(/\\/g, '/'),
          isDirectory: fileStats.isDirectory(),
          size: fileStats.size,
          modified: fileStats.mtime,
        });
      }

      return list;
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      return [];
    }
  }

  async readFile(relativePath: string) {
    const targetPath = this.getSafePath(relativePath);
    try {
      const stats = await fs.stat(targetPath);
      if (stats.isDirectory()) {
        throw new BadRequestException('Cannot read content of a directory path');
      }
      const content = await fs.readFile(targetPath, 'utf8');
      return { path: relativePath, content };
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new NotFoundException('File could not be located');
    }
  }

  async writeFile(relativePath: string, content: string) {
    const targetPath = this.getSafePath(relativePath);
    try {
      // Ensure parent directory exists
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

  async deleteFile(relativePath: string) {
    const targetPath = this.getSafePath(relativePath);
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
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException('Failed to delete file or directory');
    }
  }

  async mkdir(relativePath: string) {
    const targetPath = this.getSafePath(relativePath);
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

  async moveFile(sourceRelative: string, destRelative: string) {
    const sourcePath = this.getSafePath(sourceRelative);
    const destPath = this.getSafePath(destRelative);

    try {
      if (!existsSync(sourcePath)) {
        throw new NotFoundException('Source file or directory does not exist');
      }
      await fs.rename(sourcePath, destPath);
      return { source: sourceRelative, destination: destRelative, success: true };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException('Failed to relocate file or directory');
    }
  }

  async handleUpload(relativePath: string, file: any) {
    const targetPath = this.getSafePath(join(relativePath, file.originalname));
    try {
      const parentDir = resolve(join(targetPath, '..'));
      if (!existsSync(parentDir)) {
        await fs.mkdir(parentDir, { recursive: true });
      }
      await fs.writeFile(targetPath, file.buffer);
      return { filename: file.originalname, size: file.size, success: true };
    } catch (e) {
      throw new BadRequestException('Failed to upload file');
    }
  }

  private async seedDefaultSandboxFiles() {
    try {
      // Seed Projects directory
      const projectsDir = join(this.sandboxRoot, 'Projects');
      await fs.mkdir(join(projectsDir, 'caelum-core'), { recursive: true });
      await fs.mkdir(join(projectsDir, 'cloud-infra'), { recursive: true });

      const appTsPath = join(projectsDir, 'app.ts');
      if (!existsSync(appTsPath)) {
        await fs.writeFile(
          appTsPath,
          `// CaelumOS Core Entrypoint\nconsole.log('CaelumOS Core v2.1 initialized');\nexport const app = { name: 'caelum-core', status: 'running' };\n`,
          'utf8'
        );
      }

      const packageJsonPath = join(projectsDir, 'package.json');
      if (!existsSync(packageJsonPath)) {
        await fs.writeFile(
          packageJsonPath,
          JSON.stringify({
            name: "caelum-workspace",
            version: "1.0.0",
            description: "CaelumOS Development Workspace",
            scripts: { "start": "ts-node app.ts" },
            dependencies: { "@caelum/core": "^2.1.0" }
          }, null, 2),
          'utf8'
        );
      }

      // Seed S3 Buckets, GitHub Repos, and Terraform States directories
      await fs.mkdir(join(this.sandboxRoot, 'S3 Buckets'), { recursive: true });
      await fs.mkdir(join(this.sandboxRoot, 'GitHub Repos'), { recursive: true });
      await fs.mkdir(join(this.sandboxRoot, 'Terraform States'), { recursive: true });

      // Seed files inside S3 Buckets
      const iamRulesPath = join(this.sandboxRoot, 'S3 Buckets', 'iam-policy-rules.json');
      if (!existsSync(iamRulesPath)) {
        await fs.writeFile(
          iamRulesPath,
          JSON.stringify({ Version: "2012-10-17", Statement: [] }, null, 2),
          'utf8'
        );
      }

      // Seed files inside GitHub Repos
      const readmePath = join(this.sandboxRoot, 'GitHub Repos', 'README.md');
      if (!existsSync(readmePath)) {
        await fs.writeFile(
          readmePath,
          '# Caelum OS AI Kernel Project\n\nCloud native orchestration interface.',
          'utf8'
        );
      }

      // Seed files inside Terraform States
      const tfStatePath = join(this.sandboxRoot, 'Terraform States', 'production-vpc.tfstate');
      if (!existsSync(tfStatePath)) {
        await fs.writeFile(
          tfStatePath,
          '{"version": 4, "terraform_version": "1.5.0", "serial": 1, "lineage": "caelum-lineage"}',
          'utf8'
        );
      }
    } catch (err) {
      console.error('Failed to seed default sandbox directories', err);
    }
  }
}
