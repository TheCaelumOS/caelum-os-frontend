import { Injectable, BadRequestException } from '@nestjs/common';
import { execSync, spawn } from 'child_process';
import * as fs from 'fs/promises';
import { join } from 'path';
import { WebsocketService } from '../../websocket/websocket.service';

@Injectable()
export class TerraformService {
  constructor(private readonly websocketService: WebsocketService) {}

  async getStatus() {
    const tempDir = join(process.cwd(), 'sandbox', 'terraform');
    try {
      await fs.mkdir(tempDir, { recursive: true });
    } catch {}
    
    try {
      const versionOutput = execSync('terraform version', { encoding: 'utf8', timeout: 2000 });
      const versionLine = versionOutput.split('\n')[0] || 'Unknown';
      const cleanVersion = versionLine.replace('Terraform ', '').trim();
      
      let workspace = 'default';
      try {
        const workspaceOutput = execSync('terraform workspace show', { cwd: tempDir, encoding: 'utf8', timeout: 2000 });
        workspace = workspaceOutput.trim();
      } catch {}

      return {
        installed: true,
        version: cleanVersion,
        workspace,
      };
    } catch (err: any) {
      return {
        installed: false,
        version: 'None',
        workspace: 'None',
        error: 'Terraform CLI is not installed or unreachable in System PATH.',
      };
    }
  }

  async runAction(action: 'init' | 'validate' | 'fmt' | 'plan' | 'apply' | 'destroy', code: string): Promise<any> {
    const tempDir = join(process.cwd(), 'sandbox', 'terraform');
    const tempFile = join(tempDir, 'main.tf');

    try {
      await fs.mkdir(tempDir, { recursive: true });
      await fs.writeFile(tempFile, code, 'utf8');

      let args: string[] = [];
      if (action === 'init') {
        args = ['init', '-no-color'];
      } else if (action === 'validate') {
        args = ['validate', '-no-color'];
      } else if (action === 'fmt') {
        args = ['fmt', '-no-color'];
      } else if (action === 'plan') {
        args = ['plan', '-no-color'];
      } else if (action === 'apply') {
        args = ['apply', '-auto-approve', '-no-color'];
      } else if (action === 'destroy') {
        args = ['destroy', '-auto-approve', '-no-color'];
      } else {
        throw new BadRequestException(`Unsupported action: ${action}`);
      }

      console.log(`[TerraformService] Spawning terraform ${args.join(' ')}`);
      
      return new Promise((resolve) => {
        const child = spawn('terraform', args, { cwd: tempDir, shell: true });
        
        child.stdout.on('data', (data) => {
          const text = data.toString();
          this.websocketService.broadcast('terraform-output', { text });
        });

        child.stderr.on('data', (data) => {
          const text = data.toString();
          this.websocketService.broadcast('terraform-output', { text, isError: true });
        });

        child.on('close', async (exitCode) => {
          console.log(`[TerraformService] Process exited with code ${exitCode}`);
          const success = exitCode === 0;
          
          let updatedCode: string | undefined;
          if (action === 'fmt' && success) {
            try {
              updatedCode = await fs.readFile(tempFile, 'utf8');
            } catch (err) {
              console.error('Failed to read reformatted Terraform code:', err);
            }
          }
          
          resolve({ success, exitCode, updatedCode });
        });

        child.on('error', (err) => {
          console.error('[TerraformService] Failed to spawn Terraform process:', err);
          this.websocketService.broadcast('terraform-output', { text: `\nError: Failed to execute Terraform CLI. Ensure Terraform is installed and in system PATH.\nDetails: ${err.message}\n`, isError: true });
          resolve({ success: false, exitCode: -1 });
        });
      });
    } catch (err: any) {
      throw new BadRequestException(`Terraform execution failed: ${err.message}`);
    }
  }

  // Legacy validate & plan methods maintained for retro-compatibility and Swagger if required
  async validate(code: string) {
    const res = await this.runAction('validate', code);
    return { valid: res.success, errorCount: res.success ? 0 : 1, diagnostics: [] };
  }

  async runPlan(code: string) {
    const res = await this.runAction('plan', code);
    return { plan: 'Plan executed successfully. Check logs above.', success: res.success };
  }
}
