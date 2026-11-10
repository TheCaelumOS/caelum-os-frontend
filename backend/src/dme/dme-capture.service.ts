import { Injectable, Logger } from '@nestjs/common';
import { DockerService } from '../integrations/docker/docker.service';
import { KubernetesService } from '../integrations/kubernetes/kubernetes.service';
import { TerraformService } from '../integrations/terraform/terraform.service';
import { JenkinsService } from '../integrations/jenkins/jenkins.service';
import { InfrastructureSnapshot, DmeEventRecord } from './dme.types';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DmeCaptureService {
  private readonly logger = new Logger(DmeCaptureService.name);

  constructor(
    private readonly dockerService: DockerService,
    private readonly kubernetesService: KubernetesService,
    private readonly terraformService: TerraformService,
    private readonly jenkinsService: JenkinsService,
  ) {}

  /**
   * Captures a unified live infrastructure snapshot across all supported integrations.
   */
  public async captureSnapshot(userId = 'default'): Promise<InfrastructureSnapshot> {
    const [docker, kubernetes, git, terraform, jenkins] = await Promise.all([
      this.captureDockerState(),
      this.captureKubernetesState(),
      this.captureGitState(),
      this.captureTerraformState(),
      this.captureJenkinsState(userId),
    ]);

    return {
      docker,
      kubernetes,
      git,
      terraform,
      jenkins,
      events: [],
    };
  }

  /**
   * Extracts actionable events from the live snapshot to feed the event stream.
   */
  public extractLiveEvents(snapshot: InfrastructureSnapshot, userId = 'default'): DmeEventRecord[] {
    const events: DmeEventRecord[] = [];
    const now = new Date();

    // 1. Docker events
    if (snapshot.docker.connected) {
      for (const c of snapshot.docker.containers) {
        const status = String(c.Status || '').toLowerCase();
        const state = String(c.State || '').toLowerCase();
        const name = Array.isArray(c.Names) ? c.Names[0] : (c.Names || c.Id || 'container');

        if (status.includes('restarting') || state.includes('restarting')) {
          events.push({
            id: `evt-docker-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            source: 'docker',
            eventType: 'CONTAINER_CRASH_LOOP',
            severity: 'critical',
            title: `Container ${name} is restarting`,
            message: `Container ${name} has entered a restart loop. Status: ${c.Status}`,
            metadata: { containerId: c.Id, name, status: c.Status },
            timestamp: now,
            userId,
          });
        } else if (status.includes('exited') && (status.includes('exited (1') || status.includes('exited (137'))) {
          events.push({
            id: `evt-docker-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            source: 'docker',
            eventType: 'CONTAINER_DIED',
            severity: 'high',
            title: `Container ${name} exited with non-zero code`,
            message: `Container ${name} terminated unexpectedly: ${c.Status}`,
            metadata: { containerId: c.Id, name, status: c.Status },
            timestamp: now,
            userId,
          });
        }
      }
    }

    // 2. Kubernetes events
    if (snapshot.kubernetes.connected) {
      for (const p of snapshot.kubernetes.pods) {
        const podName = p.metadata?.name || 'unknown-pod';
        const phase = p.status?.phase;
        const cs = p.status?.containerStatuses || [];

        for (const c of cs) {
          const waiting = c.state?.waiting;
          if (waiting && (waiting.reason === 'CrashLoopBackOff' || waiting.reason === 'ImagePullBackOff')) {
            events.push({
              id: `evt-k8s-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              source: 'kubernetes',
              eventType: 'POD_CRASH_LOOP_BACKOFF',
              severity: 'critical',
              title: `Pod ${podName} ${waiting.reason}`,
              message: `Container ${c.name} in pod ${podName} is failing: ${waiting.message || waiting.reason}`,
              metadata: { podName, containerName: c.name, reason: waiting.reason },
              timestamp: now,
              userId,
            });
          }
        }

        if (phase === 'Failed') {
          events.push({
            id: `evt-k8s-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            source: 'kubernetes',
            eventType: 'POD_PHASE_FAILED',
            severity: 'high',
            title: `Pod ${podName} failed`,
            message: `Kubernetes pod ${podName} reported Failed phase.`,
            metadata: { podName, phase },
            timestamp: now,
            userId,
          });
        }
      }

      // K8s Warning events
      const warningEvents = (snapshot.kubernetes.events || []).filter((e: any) => e.type === 'Warning');
      for (const we of warningEvents.slice(0, 5)) {
        events.push({
          id: `evt-k8s-warn-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          source: 'kubernetes',
          eventType: 'CLUSTER_WARNING_EVENT',
          severity: 'medium',
          title: `K8s Warning: ${we.reason || 'Warning'}`,
          message: we.message || 'Warning event detected in cluster',
          metadata: { reason: we.reason, involvedObject: we.involvedObject },
          timestamp: now,
          userId,
        });
      }
    }

    // 3. Jenkins events
    if (snapshot.jenkins.connected) {
      for (const job of snapshot.jenkins.jobs) {
        const color = String(job.color || '').toLowerCase();
        if (color.includes('red')) {
          events.push({
            id: `evt-jenkins-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            source: 'jenkins',
            eventType: 'PIPELINE_BUILD_FAILED',
            severity: 'high',
            title: `Jenkins Job '${job.name}' build failed`,
            message: `Latest build for job '${job.name}' concluded with failure status.`,
            metadata: { jobName: job.name, url: job.url, color: job.color },
            timestamp: now,
            userId,
          });
        }
      }

      for (const node of snapshot.jenkins.nodes) {
        if (node.offline) {
          events.push({
            id: `evt-jenkins-node-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            source: 'jenkins',
            eventType: 'NODE_OFFLINE',
            severity: 'medium',
            title: `Jenkins Node '${node.displayName || node.name}' is offline`,
            message: `Agent node is offline or unmonitored: ${node.offlineCauseReason || 'No reason specified'}`,
            metadata: { nodeName: node.displayName || node.name, offline: true },
            timestamp: now,
            userId,
          });
        }
      }
    }

    return events;
  }

  // --- Private Subsystem Captures ---

  private async captureDockerState(): Promise<InfrastructureSnapshot['docker']> {
    try {
      const health = await this.dockerService.getHealth();
      if (!health || !health.connected) {
        return { connected: false, containers: [], images: [], summary: health };
      }

      const containers = await this.dockerService.listContainers();
      const images = await this.dockerService.listImages();
      return {
        connected: true,
        containers: Array.isArray(containers) ? containers : [],
        images: Array.isArray(images) ? images : [],
        summary: health,
      };
    } catch (err: any) {
      this.logger.debug(`Docker state capture: ${err.message}`);
      return { connected: false, containers: [], images: [] };
    }
  }

  private async captureKubernetesState(): Promise<InfrastructureSnapshot['kubernetes']> {
    try {
      const summary = await this.kubernetesService.getClusterSummary();
      if (!summary || !summary.connected) {
        return { connected: false, pods: [], events: [], deployments: [], summary };
      }

      const [pods, events, deployments] = await Promise.all([
        this.kubernetesService.listPods('all').catch(() => []),
        this.kubernetesService.listEvents('all').catch(() => []),
        this.kubernetesService.listDeployments('all').catch(() => []),
      ]);

      return {
        connected: true,
        pods: Array.isArray(pods) ? pods : [],
        events: Array.isArray(events) ? events : [],
        deployments: Array.isArray(deployments) ? deployments : [],
        summary,
      };
    } catch (err: any) {
      this.logger.debug(`Kubernetes state capture: ${err.message}`);
      return { connected: false, pods: [], events: [], deployments: [] };
    }
  }

  private async captureGitState(): Promise<InfrastructureSnapshot['git']> {
    try {
      let branch = 'main';
      let commits: any[] = [];
      const status: any = { modified: [], untracked: [], staged: [] };

      try {
        branch = execSync('git rev-parse --abbrev-ref HEAD', {
          cwd: process.cwd(),
          encoding: 'utf8',
          timeout: 3000,
          stdio: ['pipe', 'pipe', 'ignore'],
        }).trim();

        const logRaw = execSync('git log -n 5 --pretty=format:"%H|%an|%ad|%s" --date=iso', {
          cwd: process.cwd(),
          encoding: 'utf8',
          timeout: 3000,
          stdio: ['pipe', 'pipe', 'ignore'],
        });

        commits = logRaw
          .split('\n')
          .filter(Boolean)
          .map((line) => {
            const [hash, author, date, message] = line.split('|');
            return { hash, author, date, message };
          });

        const statusRaw = execSync('git status --porcelain', {
          cwd: process.cwd(),
          encoding: 'utf8',
          timeout: 3000,
          stdio: ['pipe', 'pipe', 'ignore'],
        });

        statusRaw
          .split('\n')
          .filter(Boolean)
          .forEach((line) => {
            const code = line.substring(0, 2).trim();
            const file = line.substring(3).trim();
            if (code === '??') status.untracked.push(file);
            else if (code.includes('M')) status.modified.push(file);
            else status.staged.push(file);
          });
      } catch {}

      return {
        connected: true,
        branch,
        commits,
        status,
      };
    } catch (err: any) {
      return { connected: false, commits: [], status: {} };
    }
  }

  private async captureTerraformState(): Promise<InfrastructureSnapshot['terraform']> {
    try {
      const status = await this.terraformService.getStatus();
      return {
        connected: !!status?.installed,
        status: status?.version ? `v${status.version}` : 'Not Installed',
        plan: { toAdd: 0, toChange: 0, toDestroy: 0 },
        backendType: 'local',
        stateLockingEnabled: true,
      };
    } catch (err: any) {
      return { connected: false, status: 'unavailable' };
    }
  }

  private async captureJenkinsState(userId = 'default'): Promise<InfrastructureSnapshot['jenkins']> {
    try {
      const connStatus = await this.jenkinsService.getStatus(userId);
      const isConnected = connStatus && String(connStatus.status).toLowerCase() === 'connected';
      if (!isConnected) {
        return { connected: false, jobs: [], queue: [], nodes: [], overview: connStatus };
      }

      const [jobs, queue, nodes, overview] = await Promise.all([
        this.jenkinsService.getJobs(userId).catch(() => []),
        this.jenkinsService.getQueue(userId).catch(() => []),
        this.jenkinsService.getNodes(userId).catch(() => []),
        this.jenkinsService.getOverview(userId).catch(() => null),
      ]);

      return {
        connected: true,
        jobs: Array.isArray(jobs) ? jobs : [],
        queue: Array.isArray(queue) ? queue : [],
        nodes: Array.isArray(nodes) ? nodes : [],
        overview,
      };
    } catch (err: any) {
      this.logger.debug(`Jenkins state capture: ${err.message}`);
      return { connected: false, jobs: [], queue: [], nodes: [] };
    }
  }
}
