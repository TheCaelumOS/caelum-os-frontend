import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { DmeValidationReport, InfrastructureSnapshot, DmeRuleResult, DmeViolation, DmeValidationStatus } from './dme.types';
import { DME_DEFAULT_RULES } from './dme.constants';

@Injectable()
export class DmeValidatorService {
  private readonly logger = new Logger(DmeValidatorService.name);
  private pythonScriptPath: string;

  constructor() {
    // Look for python script in development or dist directory
    const candidates = [
      path.resolve(__dirname, 'python', 'dme_validator.py'),
      path.resolve(__dirname, '..', '..', 'src', 'dme', 'python', 'dme_validator.py'),
      path.resolve(process.cwd(), 'src', 'dme', 'python', 'dme_validator.py'),
      path.resolve(process.cwd(), 'backend', 'src', 'dme', 'python', 'dme_validator.py')
    ];

    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        this.pythonScriptPath = cand;
        break;
      }
    }

    if (!this.pythonScriptPath) {
      this.pythonScriptPath = candidates[0];
      this.logger.warn(`dme_validator.py not found at primary paths, default set to: ${this.pythonScriptPath}`);
    } else {
      this.logger.log(`DME validator python script resolved: ${this.pythonScriptPath}`);
    }
  }

  public async validate(snapshot: InfrastructureSnapshot, triggeredBy = 'manual'): Promise<DmeValidationReport> {
    const startTime = Date.now();

    try {
      const pythonResult = await this.runPythonValidator(snapshot);
      const durationMs = Date.now() - startTime;
      return {
        ...pythonResult,
        durationMs,
        triggeredBy
      };
    } catch (err: any) {
      this.logger.warn(`Python validation execution encountered error, falling back to internal evaluator: ${err.message}`);
      const fallbackResult = this.runFallbackValidator(snapshot);
      return {
        ...fallbackResult,
        durationMs: Date.now() - startTime,
        triggeredBy
      };
    }
  }

  private runPythonValidator(snapshot: InfrastructureSnapshot): Promise<DmeValidationReport> {
    return new Promise((resolve, reject) => {
      const pythonCommands = process.platform === 'win32' ? ['python', 'py -3', 'python3'] : ['python3', 'python'];
      const scriptPath = this.pythonScriptPath;

      const payload = JSON.stringify(snapshot);
      let stdout = '';
      let stderr = '';
      let resolved = false;

      const proc = spawn('python', [scriptPath, '--stdin'], {
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          proc.kill();
          reject(new Error('Validation engine execution timed out after 15000ms'));
        }
      }, 15000);

      proc.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      proc.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      proc.on('error', (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          reject(err);
        }
      });

      proc.on('close', (code) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          if (code !== 0) {
            reject(new Error(`Validation script exited with code ${code}: ${stderr}`));
            return;
          }
          try {
            const report = JSON.parse(stdout.trim());
            resolve(report);
          } catch (e: any) {
            reject(new Error(`Failed to parse validator JSON output: ${e.message}. Raw: ${stdout}`));
          }
        }
      });

      proc.stdin.write(payload);
      proc.stdin.end();
    });
  }

  private runFallbackValidator(snapshot: InfrastructureSnapshot): DmeValidationReport {
    const ruleResults: DmeRuleResult[] = [];
    const violations: DmeViolation[] = [];
    const recommendations: string[] = [];
    let deductions = 0;

    for (const rule of DME_DEFAULT_RULES) {
      let status: DmeValidationStatus = 'passed';
      let message = `${rule.name} passed.`;
      let remediation: string | null = null;
      let details: any = {};

      if (rule.category === 'docker') {
        const containers = snapshot.docker?.containers || [];
        if (rule.code === 'DME-DOCKER-001') {
          const rootContainers = containers.filter((c: any) => c.Privileged || c.User === '0' || c.User === 'root');
          if (rootContainers.length > 0) {
            status = 'failed';
            message = `Found ${rootContainers.length} container(s) running with root or privileged permissions.`;
            remediation = rule.remediation;
            details = { violators: rootContainers.map((c: any) => c.Names?.[0] || c.Id) };
          }
        } else if (rule.code === 'DME-DOCKER-002') {
          const restarting = containers.filter((c: any) => String(c.Status || '').toLowerCase().includes('restarting'));
          if (restarting.length > 0) {
            status = 'failed';
            message = `Found ${restarting.length} container(s) trapped in crash-restart loops.`;
            remediation = rule.remediation;
            details = { restarting: restarting.map((c: any) => c.Names?.[0] || c.Id) };
          }
        } else if (rule.code === 'DME-DOCKER-003') {
          const unconstrained = containers.filter((c: any) => !c.HostConfig?.Memory && !c.HostConfig?.NanoCpus);
          if (unconstrained.length > 0) {
            status = 'warning';
            message = `${unconstrained.length} container(s) lack explicit memory/CPU limits.`;
            remediation = rule.remediation;
            details = { unconstrained: unconstrained.map((c: any) => c.Names?.[0] || c.Id) };
          }
        }
      } else if (rule.category === 'jenkins') {
        const jobs = snapshot.jenkins?.jobs || [];
        if (rule.code === 'DME-JENKINS-001' && snapshot.jenkins?.connected) {
          const failing = jobs.filter((j: any) => String(j.color || '').includes('red'));
          if (failing.length > 0) {
            status = 'failed';
            message = `${failing.length} Jenkins job(s) are failing.`;
            remediation = rule.remediation;
            details = { failing: failing.map((j: any) => j.name) };
          }
        }
      }

      ruleResults.push({
        code: rule.code,
        name: rule.name,
        category: rule.category,
        severity: rule.severity as any,
        status,
        message,
        remediation,
        details
      });

      if (status !== 'passed') {
        const penalty = rule.severity === 'critical' ? 25 : rule.severity === 'high' ? 15 : 8;
        deductions += (status as DmeValidationStatus) === 'warning' ? Math.floor(penalty / 2) : penalty;
        violations.push({
          ruleCode: rule.code,
          title: rule.name,
          severity: rule.severity as any,
          status,
          summary: message,
          remediation,
          evidence: details
        });
        if (remediation && !recommendations.includes(remediation)) {
          recommendations.push(remediation);
        }
      }
    }

    const score = Math.max(0, Math.min(100, 100 - deductions));
    const overallStatus = violations.some(v => v.severity === 'critical' && v.status === 'failed')
      ? 'failed'
      : score < 70
      ? 'warning'
      : 'passed';

    return {
      engineVersion: '0.1.0',
      timestamp: new Date().toISOString(),
      status: overallStatus,
      score,
      summary: `DME validation evaluated ${ruleResults.length} rules with score ${score}/100.`,
      totalRulesChecked: ruleResults.length,
      passedRules: ruleResults.filter(r => r.status === 'passed').length,
      warningRules: ruleResults.filter(r => r.status === 'warning').length,
      failedRules: ruleResults.filter(r => r.status === 'failed').length,
      ruleResults,
      violations,
      recommendations
    };
  }
}
