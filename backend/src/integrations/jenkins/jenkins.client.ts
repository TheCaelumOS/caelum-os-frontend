import { Logger, HttpException, HttpStatus } from '@nestjs/common';
import {
  JenkinsJob,
  JenkinsBuildDetail,
  JenkinsConsoleOutput,
  JenkinsQueueItem,
  JenkinsNode,
  JenkinsOverview,
  JenkinsCrumbResponse,
  JenkinsParameterDefinition,
  JenkinsBuildArtifact,
  JenkinsBuildCause,
} from './jenkins.types';
import {
  JENKINS_REQUEST_TIMEOUT_MS,
  JENKINS_CONSOLE_TIMEOUT_MS,
  JENKINS_USER_AGENT,
  JenkinsConnectionStatus,
  JenkinsBuildResult,
  parseJenkinsColor,
} from './jenkins.constants';

export class JenkinsClient {
  private readonly logger = new Logger(JenkinsClient.name);
  private readonly baseUrl: string;
  private readonly authHeader: string;
  private cachedCrumb: JenkinsCrumbResponse | null = null;
  private crumbFetched = false;

  constructor(
    url: string,
    private readonly username: string,
    private readonly apiToken: string,
  ) {
    // Validate protocol and sanitize base URL
    const trimmed = (url || '').trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      throw new HttpException(
        'Invalid Jenkins URL protocol. Must start with http:// or https://',
        HttpStatus.BAD_REQUEST,
      );
    }
    this.baseUrl = trimmed.replace(/\/+$/, '');
    const credentials = Buffer.from(`${username.trim()}:${apiToken.trim()}`).toString('base64');
    this.authHeader = `Basic ${credentials}`;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Helper to format job path for nested folders:
   * e.g. "team-a/backend/api-service" -> "/job/team-a/job/backend/job/api-service"
   */
  public formatJobPath(jobPath: string): string {
    if (!jobPath) return '';
    const clean = jobPath.replace(/^\/+|\/+$/g, '');
    const segments = clean.split('/').filter(Boolean);
    
    // If it already starts with 'job/' repeatedly, strip it down
    const jobParts: string[] = [];
    for (let i = 0; i < segments.length; i++) {
      if (segments[i] === 'job' && i + 1 < segments.length) {
        // Skip literal 'job' keyword in raw paths
        continue;
      }
      jobParts.push(encodeURIComponent(segments[i]));
    }
    return jobParts.length > 0 ? `/job/${jobParts.join('/job/')}` : '';
  }

  /**
   * Fetch CSRF crumb if enabled on the Jenkins master.
   */
  public async getCrumb(): Promise<JenkinsCrumbResponse | null> {
    if (this.crumbFetched) {
      return this.cachedCrumb;
    }

    try {
      const crumbUrl = `${this.baseUrl}/crumbIssuer/api/json`;
      const res = await fetch(crumbUrl, {
        method: 'GET',
        headers: {
          Authorization: this.authHeader,
          Accept: 'application/json',
          'User-Agent': JENKINS_USER_AGENT,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.crumb && data?.crumbRequestField) {
          this.cachedCrumb = {
            crumb: data.crumb,
            crumbRequestField: data.crumbRequestField,
          };
        }
      }
    } catch {
      // CSRF protection may be disabled or crumb issuer not present; safe to ignore
      this.cachedCrumb = null;
    } finally {
      this.crumbFetched = true;
    }

    return this.cachedCrumb;
  }

  private async request<T = any>(
    path: string,
    options: {
      method?: string;
      body?: any;
      isForm?: boolean;
      timeoutMs?: number;
      returnRawResponse?: boolean;
    } = {},
  ): Promise<{ data: T; headers: Headers; status: number }> {
    const {
      method = 'GET',
      body,
      isForm = false,
      timeoutMs = JENKINS_REQUEST_TIMEOUT_MS,
    } = options;

    const targetUrl = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const headers: Record<string, string> = {
      Authorization: this.authHeader,
      'User-Agent': JENKINS_USER_AGENT,
      Accept: 'application/json, text/plain, */*',
    };

    // Attach Crumb on mutating methods
    if (method !== 'GET' && method !== 'HEAD') {
      const crumb = await this.getCrumb();
      if (crumb) {
        headers[crumb.crumbRequestField] = crumb.crumb;
      }
    }

    let payload: any;
    if (body !== undefined && body !== null) {
      if (isForm) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        payload = typeof body === 'string' ? body : new URLSearchParams(body).toString();
      } else {
        headers['Content-Type'] = 'application/json';
        payload = typeof body === 'string' ? body : JSON.stringify(body);
      }
    }

    try {
      const res = await fetch(targetUrl, {
        method,
        headers,
        body: payload,
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (res.status === 401) {
        throw new HttpException(
          'Jenkins authentication failed. Check your username and API token.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (res.status === 403) {
        throw new HttpException(
          'Jenkins access forbidden. The provided user lacks necessary permissions or CSRF crumb failed.',
          HttpStatus.FORBIDDEN,
        );
      }

      if (res.status === 404) {
        throw new HttpException(
          `Jenkins endpoint not found: ${path}`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (!res.ok && res.status !== 201 && res.status !== 200 && res.status !== 302) {
        let msg = `Jenkins API request failed with status ${res.status}`;
        try {
          const txt = await res.text();
          if (txt) msg += `: ${txt.slice(0, 300)}`;
        } catch {
          // ignore
        }
        throw new HttpException(msg, res.status);
      }

      const contentType = res.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        data = await res.json().catch(() => null);
      } else {
        data = await res.text().catch(() => '');
      }

      return { data: data as T, headers: res.headers, status: res.status };
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err;
      }
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        throw new HttpException(
          'Connection to Jenkins timed out. Please check server availability and network.',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }
      const safeMsg = err.message || 'Failed to reach Jenkins server.';
      this.logger.warn(`Jenkins request to ${path} failed: ${safeMsg}`);
      throw new HttpException(
        `Unable to reach Jenkins: ${safeMsg}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  // =========================================================================
  // CONNECTION & SYSTEM INFORMATION
  // =========================================================================

  public async testConnection(): Promise<{
    healthy: boolean;
    version: string;
    nodeName?: string;
    numExecutors?: number;
    description?: string;
  }> {
    const { data, headers } = await this.request<any>(
      '/api/json?tree=nodeName,mode,nodeDescription,numExecutors,description,quietingDown',
    );
    const version = headers.get('x-jenkins') || 'Unknown';
    return {
      healthy: true,
      version,
      nodeName: data?.nodeName || 'Jenkins Master',
      numExecutors: data?.numExecutors,
      description: data?.description || data?.nodeDescription,
    };
  }

  public async getServerInfo(): Promise<{
    version: string;
    nodeName: string;
    mode: string;
    description: string;
    quietingDown: boolean;
    numExecutors: number;
  }> {
    const { data, headers } = await this.request<any>(
      '/api/json?tree=nodeName,mode,nodeDescription,numExecutors,description,quietingDown',
    );
    return {
      version: headers.get('x-jenkins') || 'Unknown',
      nodeName: data?.nodeName || 'Jenkins Controller',
      mode: data?.mode || 'NORMAL',
      description: data?.description || data?.nodeDescription || '',
      quietingDown: Boolean(data?.quietingDown),
      numExecutors: data?.numExecutors || 0,
    };
  }

  // =========================================================================
  // OVERVIEW & METRICS
  // =========================================================================

  public async getOverview(connectionName: string = 'Jenkins'): Promise<JenkinsOverview> {
    const [info, rootData, queueData, computerData] = await Promise.all([
      this.getServerInfo(),
      this.request<any>(
        '/api/json?tree=jobs[name,url,color,_class,description,buildable,inQueue,lastBuild[number,url,timestamp,duration,result,building],lastSuccessfulBuild[number,url,timestamp],lastFailedBuild[number,url,timestamp]]',
      ),
      this.getQueue().catch(() => []),
      this.getNodes().catch(() => []),
    ]);

    const rawJobs = rootData.data?.jobs || [];
    const jobs = this.normalizeJobs(rawJobs);

    let totalJobs = 0;
    let enabledJobs = 0;
    let disabledJobs = 0;
    let successfulJobs = 0;
    let failedJobs = 0;
    let buildingJobs = 0;

    const recentBuilds: Array<{
      jobName: string;
      number: number;
      result: string;
      timestamp: number;
      duration: number;
      url: string;
      building: boolean;
    }> = [];

    for (const job of jobs) {
      totalJobs++;
      if (job.buildable) {
        enabledJobs++;
      } else {
        disabledJobs++;
      }

      if (job.isBuilding) {
        buildingJobs++;
      } else if (job.status === JenkinsBuildResult.SUCCESS) {
        successfulJobs++;
      } else if (job.status === JenkinsBuildResult.FAILURE) {
        failedJobs++;
      }

      if (job.lastBuild) {
        recentBuilds.push({
          jobName: job.name,
          number: job.lastBuild.number,
          result: job.lastBuild.result || (job.lastBuild.building ? 'BUILDING' : 'UNKNOWN'),
          timestamp: job.lastBuild.timestamp,
          duration: job.lastBuild.duration,
          url: job.lastBuild.url,
          building: Boolean(job.lastBuild.building),
        });
      }
    }

    recentBuilds.sort((a, b) => b.timestamp - a.timestamp);

    let totalExecutors = 0;
    let busyExecutors = 0;
    let onlineNodes = 0;
    let offlineNodes = 0;

    for (const node of computerData) {
      if (node.offline) {
        offlineNodes++;
      } else {
        onlineNodes++;
      }
      totalExecutors += node.numExecutors;
      const busyCount = (node.executors || []).filter(
        (e) => e.currentExecutable !== undefined && e.currentExecutable !== null,
      ).length;
      busyExecutors += busyCount;
    }

    return {
      connected: true,
      status: JenkinsConnectionStatus.CONNECTED,
      url: this.baseUrl,
      name: connectionName,
      version: info.version,
      nodeName: info.nodeName,
      nodeDescription: info.description,
      quietingDown: info.quietingDown,
      stats: {
        totalJobs,
        enabledJobs,
        disabledJobs,
        successfulJobs,
        failedJobs,
        buildingJobs,
        queueLength: queueData.length,
        totalNodes: computerData.length,
        onlineNodes,
        offlineNodes,
        totalExecutors,
        busyExecutors,
      },
      recentBuilds: recentBuilds.slice(0, 15),
      queue: queueData,
      nodes: computerData,
    };
  }

  // =========================================================================
  // JOBS MANAGEMENT
  // =========================================================================

  private determineJobType(rawClass?: string): JenkinsJob['type'] {
    if (!rawClass) return 'other';
    const c = rawClass.toLowerCase();
    if (c.includes('freestyleproject')) return 'freestyle';
    if (c.includes('workflowmultibranchproject')) return 'multibranch';
    if (c.includes('workflowjob')) return 'pipeline';
    if (c.includes('folder') || c.includes('organizationfolder')) return 'folder';
    if (c.includes('matrixproject')) return 'matrix';
    if (c.includes('mavenmoduleset')) return 'maven';
    return 'other';
  }

  private extractParameterDefinitions(propertyList: any[]): JenkinsParameterDefinition[] {
    if (!Array.isArray(propertyList)) return [];
    for (const prop of propertyList) {
      if (prop?._class?.includes('ParametersDefinitionProperty') && Array.isArray(prop.parameterDefinitions)) {
        return prop.parameterDefinitions.map((p: any) => ({
          name: p.name || '',
          type: (p._class || p.type || '').split('.').pop() || 'StringParameterDefinition',
          description: p.description || '',
          defaultValue: p.defaultParameterValue?.value,
          choices: Array.isArray(p.choices) ? p.choices : undefined,
        }));
      }
    }
    return [];
  }

  private normalizeJobs(rawJobs: any[]): JenkinsJob[] {
    if (!Array.isArray(rawJobs)) return [];

    return rawJobs.map((raw: any) => {
      const colorInfo = parseJenkinsColor(raw.color);
      const jobType = this.determineJobType(raw._class);

      const params = this.extractParameterDefinitions(raw.property || []);

      return {
        name: raw.name || '',
        fullName: raw.fullName || raw.name || '',
        url: raw.url || '',
        color: raw.color,
        status: colorInfo.status,
        isBuilding: colorInfo.isBuilding || Boolean(raw.lastBuild?.building),
        buildable: Boolean(raw.buildable !== false),
        inQueue: Boolean(raw.inQueue),
        type: jobType,
        rawClass: raw._class,
        description: raw.description || '',
        lastBuild: raw.lastBuild
          ? {
              number: raw.lastBuild.number,
              url: raw.lastBuild.url,
              timestamp: raw.lastBuild.timestamp,
              duration: raw.lastBuild.duration,
              result: raw.lastBuild.result,
              building: Boolean(raw.lastBuild.building),
            }
          : null,
        lastSuccessfulBuild: raw.lastSuccessfulBuild
          ? {
              number: raw.lastSuccessfulBuild.number,
              url: raw.lastSuccessfulBuild.url,
              timestamp: raw.lastSuccessfulBuild.timestamp,
            }
          : null,
        lastFailedBuild: raw.lastFailedBuild
          ? {
              number: raw.lastFailedBuild.number,
              url: raw.lastFailedBuild.url,
              timestamp: raw.lastFailedBuild.timestamp,
            }
          : null,
        parameters: params,
        subJobsCount: Array.isArray(raw.jobs) ? raw.jobs.length : undefined,
      };
    });
  }

  public async getJobs(folderPath?: string): Promise<JenkinsJob[]> {
    const pathPrefix = folderPath ? this.formatJobPath(folderPath) : '';
    const tree =
      'jobs[name,fullName,url,color,_class,description,buildable,inQueue,jobs[name],lastBuild[number,url,timestamp,duration,result,building],lastSuccessfulBuild[number,url,timestamp],lastFailedBuild[number,url,timestamp],property[_class,parameterDefinitions[name,type,description,defaultParameterValue[value],choices]]]';

    const { data } = await this.request<any>(`${pathPrefix}/api/json?tree=${encodeURIComponent(tree)}`);
    return this.normalizeJobs(data?.jobs || []);
  }

  public async getJobDetails(jobPath: string): Promise<JenkinsJob & { builds: Array<{ number: number; url: string; result?: string; timestamp?: number; duration?: number }> }> {
    const formatted = this.formatJobPath(jobPath);
    const tree =
      'name,fullName,url,color,_class,description,buildable,inQueue,nextBuildNumber,builds[number,url,timestamp,duration,result,building],lastBuild[number,url,timestamp,duration,result,building],lastSuccessfulBuild[number,url,timestamp],lastFailedBuild[number,url,timestamp],property[_class,parameterDefinitions[name,type,description,defaultParameterValue[value],choices]]';

    const { data } = await this.request<any>(`${formatted}/api/json?tree=${encodeURIComponent(tree)}`);
    const colorInfo = parseJenkinsColor(data.color);
    const jobType = this.determineJobType(data._class);
    const params = this.extractParameterDefinitions(data.property || []);

    return {
      name: data.name || '',
      fullName: data.fullName || data.name || '',
      url: data.url || '',
      color: data.color,
      status: colorInfo.status,
      isBuilding: colorInfo.isBuilding || Boolean(data.lastBuild?.building),
      buildable: Boolean(data.buildable !== false),
      inQueue: Boolean(data.inQueue),
      type: jobType,
      rawClass: data._class,
      description: data.description || '',
      lastBuild: data.lastBuild
        ? {
            number: data.lastBuild.number,
            url: data.lastBuild.url,
            timestamp: data.lastBuild.timestamp,
            duration: data.lastBuild.duration,
            result: data.lastBuild.result,
            building: Boolean(data.lastBuild.building),
          }
        : null,
      lastSuccessfulBuild: data.lastSuccessfulBuild
        ? {
            number: data.lastSuccessfulBuild.number,
            url: data.lastSuccessfulBuild.url,
            timestamp: data.lastSuccessfulBuild.timestamp,
          }
        : null,
      lastFailedBuild: data.lastFailedBuild
        ? {
            number: data.lastFailedBuild.number,
            url: data.lastFailedBuild.url,
            timestamp: data.lastFailedBuild.timestamp,
          }
        : null,
      parameters: params,
      builds: (data.builds || []).map((b: any) => ({
        number: b.number,
        url: b.url,
        result: b.result,
        timestamp: b.timestamp,
        duration: b.duration,
        building: Boolean(b.building),
      })),
    };
  }

  // =========================================================================
  // BUILD OPERATIONS & QUEUE
  // =========================================================================

  public async triggerBuild(
    jobPath: string,
    parameters?: Record<string, any>,
  ): Promise<{
    queued: boolean;
    queueItemUrl?: string;
    queueItemId?: number;
    message: string;
  }> {
    const formatted = this.formatJobPath(jobPath);
    const hasParams = parameters && Object.keys(parameters).length > 0;

    let endpoint = `${formatted}/build`;
    let isForm = false;
    let body: any = undefined;

    if (hasParams) {
      endpoint = `${formatted}/buildWithParameters`;
      isForm = true;
      body = parameters;
    }

    const { headers, status } = await this.request<any>(endpoint, {
      method: 'POST',
      body,
      isForm,
    });

    const location = headers.get('location') || '';
    let queueItemId: number | undefined;

    const match = location.match(/\/queue\/item\/(\d+)\/?/);
    if (match && match[1]) {
      queueItemId = parseInt(match[1], 10);
    }

    return {
      queued: status === 201 || status === 200 || status === 302,
      queueItemUrl: location || undefined,
      queueItemId,
      message: queueItemId
        ? `Build request accepted and queued as item #${queueItemId}`
        : 'Build request triggered successfully',
    };
  }

  public async stopBuild(jobPath: string, buildNumber: number): Promise<{ stopped: boolean; message: string }> {
    const formatted = this.formatJobPath(jobPath);
    await this.request<any>(`${formatted}/${buildNumber}/stop`, {
      method: 'POST',
    });
    return {
      stopped: true,
      message: `Build #${buildNumber} abort signal sent successfully`,
    };
  }

  public async getQueue(): Promise<JenkinsQueueItem[]> {
    const tree = 'items[id,why,blocked,buildable,stuck,params,inQueueSince,task[name,url,_class],executable[number,url]]';
    const { data } = await this.request<any>(`/queue/api/json?tree=${encodeURIComponent(tree)}`);
    const rawItems = data?.items || [];

    return rawItems.map((item: any) => ({
      id: item.id,
      why: item.why || 'In build queue',
      blocked: Boolean(item.blocked),
      buildable: Boolean(item.buildable),
      stuck: Boolean(item.stuck),
      inQueueSince: item.inQueueSince || Date.now(),
      jobName: item.task?.name || 'Unknown Job',
      jobUrl: item.task?.url || '',
      executable: item.executable
        ? {
            number: item.executable.number,
            url: item.executable.url,
          }
        : null,
      params: item.params || '',
    }));
  }

  public async cancelQueueItem(id: number): Promise<{ cancelled: boolean; message: string }> {
    await this.request<any>(`/queue/cancelItem?id=${id}`, {
      method: 'POST',
    });
    return {
      cancelled: true,
      message: `Queue item #${id} cancelled`,
    };
  }

  // =========================================================================
  // BUILD DETAILS & CONSOLE
  // =========================================================================

  public async getBuild(jobPath: string, buildNumber: number): Promise<JenkinsBuildDetail> {
    const formatted = this.formatJobPath(jobPath);
    const tree =
      'number,url,displayName,fullDisplayName,building,result,duration,estimatedDuration,timestamp,queueId,builtOn,changeSets[items[commitId,msg,author[fullName],timestamp]],culprits[fullName],actions[causes[shortDescription,userName,userId],parameters[name,value],failCount,skipCount,totalCount],artifacts[displayPath,fileName,relativePath]';

    const { data } = await this.request<any>(
      `${formatted}/${buildNumber}/api/json?tree=${encodeURIComponent(tree)}`,
    );

    const causes: JenkinsBuildCause[] = [];
    let parameters: Array<{ name: string; value: any }> | undefined;
    let testSummary: any = null;

    if (Array.isArray(data.actions)) {
      for (const action of data.actions) {
        if (Array.isArray(action.causes)) {
          for (const c of action.causes) {
            causes.push({
              shortDescription: c.shortDescription || 'Triggered',
              userName: c.userName,
              userId: c.userId,
            });
          }
        }
        if (Array.isArray(action.parameters)) {
          parameters = action.parameters.map((p: any) => ({
            name: p.name,
            value: p.value,
          }));
        }
        if (action.totalCount !== undefined && action.failCount !== undefined) {
          testSummary = {
            totalCount: action.totalCount || 0,
            failCount: action.failCount || 0,
            skipCount: action.skipCount || 0,
            passCount: Math.max(0, (action.totalCount || 0) - (action.failCount || 0) - (action.skipCount || 0)),
          };
        }
      }
    }

    let commitInfo: JenkinsBuildDetail['commitInfo'];
    if (Array.isArray(data.changeSets)) {
      for (const cs of data.changeSets) {
        if (Array.isArray(cs.items) && cs.items.length > 0) {
          const item = cs.items[0];
          commitInfo = {
            commitId: item.commitId,
            message: item.msg,
            author: item.author?.fullName,
            timestamp: item.timestamp,
          };
          break;
        }
      }
    }

    const artifacts: JenkinsBuildArtifact[] = Array.isArray(data.artifacts)
      ? data.artifacts.map((a: any) => ({
          displayPath: a.displayPath || a.fileName,
          fileName: a.fileName,
          relativePath: a.relativePath,
        }))
      : [];

    let resultStatus = data.result as JenkinsBuildResult | null;
    if (data.building) {
      resultStatus = JenkinsBuildResult.BUILDING;
    }

    return {
      number: data.number,
      url: data.url,
      displayName: data.displayName || `#${data.number}`,
      fullDisplayName: data.fullDisplayName || `#${data.number}`,
      building: Boolean(data.building),
      result: resultStatus,
      duration: data.duration || 0,
      estimatedDuration: data.estimatedDuration || 0,
      timestamp: data.timestamp || 0,
      queueId: data.queueId,
      builtOn: data.builtOn || 'master',
      causes,
      commitInfo,
      parameters,
      artifacts,
      testSummary,
    };
  }

  public async getConsoleOutput(
    jobPath: string,
    buildNumber: number,
    startOffset: number = 0,
  ): Promise<JenkinsConsoleOutput> {
    const formatted = this.formatJobPath(jobPath);

    try {
      // Use Jenkins Progressive Console Output API
      const { data, headers } = await this.request<string>(
        `${formatted}/${buildNumber}/logText/progressiveText?start=${startOffset}`,
        {
          method: 'POST',
          timeoutMs: JENKINS_CONSOLE_TIMEOUT_MS,
        },
      );

      const textSizeHeader = headers.get('x-text-size');
      const moreDataHeader = headers.get('x-more-data');

      const nextOffset = textSizeHeader ? parseInt(textSizeHeader, 10) : startOffset + (data ? data.length : 0);
      const hasMore = moreDataHeader === 'true';

      return {
        output: typeof data === 'string' ? data : '',
        startOffset,
        nextOffset,
        hasMore,
        building: hasMore,
      };
    } catch (err: any) {
      if (err.status === HttpStatus.NOT_FOUND) {
        // Fallback to plain consoleText endpoint
        const { data } = await this.request<string>(`${formatted}/${buildNumber}/consoleText`, {
          method: 'GET',
        });
        const out = typeof data === 'string' ? data : '';
        return {
          output: out,
          startOffset: 0,
          nextOffset: out.length,
          hasMore: false,
          building: false,
        };
      }
      throw err;
    }
  }

  public async getTestReport(jobPath: string, buildNumber: number): Promise<any | null> {
    const formatted = this.formatJobPath(jobPath);
    try {
      const { data } = await this.request<any>(`${formatted}/${buildNumber}/testReport/api/json`);
      return data;
    } catch (err: any) {
      if (err.status === HttpStatus.NOT_FOUND) {
        return null; // Test report plugin not configured or no tests run
      }
      throw err;
    }
  }

  // =========================================================================
  // NODES / AGENTS
  // =========================================================================

  public async getNodes(): Promise<JenkinsNode[]> {
    const tree = 'computer[displayName,offline,temporarilyOffline,offlineCauseReason,numExecutors,idle,executors[currentExecutable[number,url]],assignedLabels[name],description]';
    const { data } = await this.request<any>(`/computer/api/json?tree=${encodeURIComponent(tree)}`);
    const rawNodes = data?.computer || [];

    return rawNodes.map((n: any) => ({
      displayName: n.displayName || 'Built-In Node',
      offline: Boolean(n.offline),
      temporarilyOffline: Boolean(n.temporarilyOffline),
      offlineCause: n.offlineCauseReason || null,
      numExecutors: n.numExecutors || 0,
      idle: Boolean(n.idle),
      executors: Array.isArray(n.executors)
        ? n.executors.map((e: any) => ({
            currentExecutable: e.currentExecutable
              ? {
                  number: e.currentExecutable.number,
                  url: e.currentExecutable.url,
                }
              : undefined,
          }))
        : [],
      assignedLabels: Array.isArray(n.assignedLabels)
        ? n.assignedLabels.map((l: any) => l.name).filter(Boolean)
        : [],
      description: n.description || '',
    }));
  }
}
