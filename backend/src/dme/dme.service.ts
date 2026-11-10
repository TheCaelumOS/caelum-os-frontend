import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DmeCaptureService } from './dme-capture.service';
import { DmeValidatorService } from './dme-validator.service';
import {
  DmeEventRecord,
  DmeOverviewMetrics,
  DmeValidationReport,
  DmeEventSource,
  DmeSeverity,
  DmeValidationStatus,
} from './dme.types';
import { DME_DEFAULT_RULES } from './dme.constants';
import { QueryEventsDto } from './dto/query-events.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { RunValidationDto } from './dto/run-validation.dto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DmeService {
  private readonly logger = new Logger(DmeService.name);
  private readonly eventsFilePath: string;
  private readonly runsFilePath: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly captureService: DmeCaptureService,
    private readonly validatorService: DmeValidatorService,
  ) {
    const dataDir = path.resolve(process.cwd(), '.caelum_data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err: any) {
        this.logger.warn(`Could not create .caelum_data directory: ${err.message}`);
      }
    }
    this.eventsFilePath = path.join(dataDir, 'dme_events.json');
    this.runsFilePath = path.join(dataDir, 'dme_runs.json');

    this.initLocalStorage();
  }

  private initLocalStorage() {
    try {
      if (!fs.existsSync(this.eventsFilePath)) {
        fs.writeFileSync(this.eventsFilePath, JSON.stringify([]), 'utf8');
      }
      if (!fs.existsSync(this.runsFilePath)) {
        fs.writeFileSync(this.runsFilePath, JSON.stringify([]), 'utf8');
      }
    } catch (err: any) {
      this.logger.warn(`Local file storage initialization error: ${err.message}`);
    }
  }

  private readLocalEvents(): DmeEventRecord[] {
    try {
      if (fs.existsSync(this.eventsFilePath)) {
        const raw = fs.readFileSync(this.eventsFilePath, 'utf8');
        return JSON.parse(raw);
      }
    } catch {}
    return [];
  }

  private writeLocalEvents(events: DmeEventRecord[]) {
    try {
      fs.writeFileSync(this.eventsFilePath, JSON.stringify(events.slice(0, 500), null, 2), 'utf8');
    } catch (err: any) {
      this.logger.warn(`Failed to write local DME events: ${err.message}`);
    }
  }

  private readLocalRuns(): DmeValidationReport[] {
    try {
      if (fs.existsSync(this.runsFilePath)) {
        const raw = fs.readFileSync(this.runsFilePath, 'utf8');
        return JSON.parse(raw);
      }
    } catch {}
    return [];
  }

  private writeLocalRuns(runs: DmeValidationReport[]) {
    try {
      fs.writeFileSync(this.runsFilePath, JSON.stringify(runs.slice(0, 100), null, 2), 'utf8');
    } catch (err: any) {
      this.logger.warn(`Failed to write local DME runs: ${err.message}`);
    }
  }

  // =========================================================================
  // OVERVIEW & METRICS
  // =========================================================================

  public async getOverview(userId = 'default'): Promise<DmeOverviewMetrics> {
    const integrations = await this.getIntegrations(userId);
    const events = await this.getEvents({ limit: 200 }, userId);
    const runs = await this.getRuns(userId);
    const lastRun = runs.length > 0 ? runs[0] : null;

    const severityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    const sourceCounts: Record<string, number> = {};

    for (const evt of events) {
      const sev = evt.severity?.toLowerCase() as keyof typeof severityCounts;
      if (severityCounts[sev] !== undefined) {
        severityCounts[sev]++;
      } else {
        severityCounts.info++;
      }

      const src = evt.source || 'system';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    }

    const connectedIntegrationsCount = integrations.filter((i) => i.connected).length;
    const activeViolationsCount = (lastRun?.violations || []).length;
    const healthScore = lastRun ? lastRun.score : 100.0;
    const overallStatus: DmeValidationStatus = lastRun ? lastRun.status : 'passed';

    return {
      healthScore,
      overallStatus,
      totalEvents: events.length,
      severityCounts,
      sourceCounts,
      activeViolationsCount,
      connectedIntegrationsCount,
      totalIntegrationsCount: integrations.length,
      lastValidationRun: lastRun
        ? {
            id: lastRun.id || 'last-run',
            timestamp: lastRun.timestamp,
            score: lastRun.score,
            status: lastRun.status,
            summary: lastRun.summary,
          }
        : null,
      integrations,
    };
  }

  // =========================================================================
  // EVENTS MANAGEMENT
  // =========================================================================

  public async getEvents(query: QueryEventsDto = {}, userId = 'default'): Promise<DmeEventRecord[]> {
    let events: DmeEventRecord[] = [];

    try {
      const where: any = {};
      if (query.source) where.source = query.source;
      if (query.severity) where.severity = query.severity;
      if (query.search) {
        where.OR = [
          { title: { contains: query.search, mode: 'insensitive' } },
          { message: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      const dbEvents = await this.prisma.dmeEvent.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: query.limit || 50,
        skip: query.offset || 0,
      });

      if (dbEvents && dbEvents.length > 0) {
        return dbEvents.map((e) => ({
          id: e.id,
          source: e.source as DmeEventSource,
          eventType: e.eventType,
          severity: e.severity as DmeSeverity,
          title: e.title,
          message: e.message,
          metadata: e.metadata as Record<string, any>,
          timestamp: e.timestamp,
          userId: e.userId,
          createdAt: e.createdAt,
        }));
      }
    } catch {
      // Prisma offline, fallback to local storage
    }

    events = this.readLocalEvents();

    if (query.source) {
      events = events.filter((e) => e.source.toLowerCase() === query.source.toLowerCase());
    }
    if (query.severity) {
      events = events.filter((e) => e.severity.toLowerCase() === query.severity.toLowerCase());
    }
    if (query.search) {
      const term = query.search.toLowerCase();
      events = events.filter(
        (e) => e.title.toLowerCase().includes(term) || e.message.toLowerCase().includes(term),
      );
    }

    const offset = query.offset || 0;
    const limit = query.limit || 50;
    return events.slice(offset, offset + limit);
  }

  public async recordEvent(dto: CreateEventDto, userId = 'default'): Promise<DmeEventRecord> {
    const event: DmeEventRecord = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      source: dto.source as DmeEventSource,
      eventType: dto.eventType,
      severity: dto.severity as DmeSeverity,
      title: dto.title,
      message: dto.message,
      metadata: dto.metadata || {},
      timestamp: new Date().toISOString(),
      userId,
      createdAt: new Date().toISOString(),
    };

    // Attempt Prisma persistence
    try {
      await this.prisma.dmeEvent.create({
        data: {
          id: event.id,
          source: event.source,
          eventType: event.eventType,
          severity: event.severity,
          title: event.title,
          message: event.message,
          metadata: event.metadata,
          userId: userId === 'default' ? null : userId,
        },
      });
    } catch {
      // Fallback local storage
    }

    const localList = this.readLocalEvents();
    localList.unshift(event);
    this.writeLocalEvents(localList);

    return event;
  }

  public async captureAndSync(userId = 'default'): Promise<{ capturedEventsCount: number }> {
    const snapshot = await this.captureService.captureSnapshot(userId);
    const extracted = this.captureService.extractLiveEvents(snapshot, userId);

    for (const evt of extracted) {
      await this.recordEvent(
        {
          source: evt.source,
          eventType: evt.eventType,
          severity: evt.severity,
          title: evt.title,
          message: evt.message,
          metadata: evt.metadata,
        },
        userId,
      );
    }

    return { capturedEventsCount: extracted.length };
  }

  // =========================================================================
  // VALIDATION ENGINE EXECUTION
  // =========================================================================

  public async runValidation(dto: RunValidationDto = {}, userId = 'default'): Promise<DmeValidationReport> {
    const snapshot = await this.captureService.captureSnapshot(userId);
    const existingEvents = await this.getEvents({ limit: 50 }, userId);
    snapshot.events = existingEvents;

    const report = await this.validatorService.validate(snapshot, dto.triggeredBy || 'manual');
    report.id = `run-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // Attempt Prisma persistence
    try {
      await this.prisma.dmeValidationRun.create({
        data: {
          id: report.id,
          status: report.status,
          score: report.score,
          summary: report.summary,
          details: report as any,
          durationMs: report.durationMs || 0,
          triggeredBy: report.triggeredBy || 'manual',
          userId: userId === 'default' ? null : userId,
        },
      });
    } catch {
      // Fallback local storage
    }

    const runs = this.readLocalRuns();
    runs.unshift(report);
    this.writeLocalRuns(runs);

    return report;
  }

  public async getRuns(userId = 'default'): Promise<DmeValidationReport[]> {
    try {
      const dbRuns = await this.prisma.dmeValidationRun.findMany({
        orderBy: { createdAt: 'desc' },
        take: 30,
      });

      if (dbRuns && dbRuns.length > 0) {
        return dbRuns.map((r) => ({
          ...(r.details as unknown as DmeValidationReport),
          id: r.id,
          status: r.status as DmeValidationStatus,
          score: r.score,
          summary: r.summary,
          durationMs: r.durationMs,
          triggeredBy: r.triggeredBy,
          timestamp: r.createdAt.toISOString(),
        }));
      }
    } catch {}

    return this.readLocalRuns();
  }

  public getRules() {
    return DME_DEFAULT_RULES;
  }

  public async getIntegrations(userId = 'default') {
    const snapshot = await this.captureService.captureSnapshot(userId);

    return [
      {
        name: 'Docker Engine',
        source: 'docker' as DmeEventSource,
        connected: snapshot.docker.connected,
        status: snapshot.docker.connected
          ? `Connected (${snapshot.docker.containers.length} containers, ${snapshot.docker.images.length} images)`
          : 'Disconnected (Daemon unreachable)',
        itemCount: snapshot.docker.containers.length,
        details: snapshot.docker.connected ? 'Active container socket responding' : 'Start Docker Desktop',
      },
      {
        name: 'Kubernetes Cluster',
        source: 'kubernetes' as DmeEventSource,
        connected: snapshot.kubernetes.connected,
        status: snapshot.kubernetes.connected
          ? `Connected (${snapshot.kubernetes.pods.length} pods, ${snapshot.kubernetes.deployments.length} deploys)`
          : 'Disconnected (kubectl unreachable)',
        itemCount: snapshot.kubernetes.pods.length,
        details: snapshot.kubernetes.connected ? 'Cluster API responding' : 'Configure kubeconfig context',
      },
      {
        name: 'Git Version Control',
        source: 'git' as DmeEventSource,
        connected: snapshot.git.connected,
        status: snapshot.git.connected ? `Branch: ${snapshot.git.branch || 'main'}` : 'Not a Git repository',
        itemCount: snapshot.git.commits?.length || 0,
        details: snapshot.git.connected ? `${snapshot.git.commits.length} recent commits tracked` : '',
      },
      {
        name: 'Terraform Engine',
        source: 'terraform' as DmeEventSource,
        connected: snapshot.terraform.connected,
        status: snapshot.terraform.connected ? `Installed (${snapshot.terraform.status})` : 'Not Installed',
        itemCount: 0,
        details: snapshot.terraform.connected ? 'CLI available in PATH' : 'Install terraform binary',
      },
      {
        name: 'Jenkins CI/CD',
        source: 'jenkins' as DmeEventSource,
        connected: snapshot.jenkins.connected,
        status: snapshot.jenkins.connected
          ? `Connected (${snapshot.jenkins.jobs.length} jobs, ${snapshot.jenkins.nodes.length} nodes)`
          : 'Disconnected',
        itemCount: snapshot.jenkins.jobs.length,
        details: snapshot.jenkins.connected ? 'Jenkins API authenticated' : 'Connect Jenkins instance in app',
      },
    ];
  }
}
