import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as si from 'systeminformation';
import { WebsocketService } from '../websocket/websocket.service';

@Injectable()
export class MonitoringService implements OnModuleInit, OnModuleDestroy {
  private statsInterval: NodeJS.Timeout;

  constructor(private readonly websocketService: WebsocketService) {}

  onModuleInit() {
    // Broadcast live hardware metrics every 1.5 seconds
    this.statsInterval = setInterval(async () => {
      try {
        const stats = await this.getLiveStats();
        this.websocketService.broadcast('system-stats', stats);
      } catch (err) {
        console.error('Failed to broadcast live system statistics', err);
      }
    }, 1500);
  }

  onModuleDestroy() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
  }

  async getSystemInfo() {
    const [staticInfo, osInfo, uuid] = await Promise.all([
      si.system(),
      si.osInfo(),
      si.uuid(),
    ]);

    return {
      manufacturer: staticInfo.manufacturer,
      model: staticInfo.model,
      platform: osInfo.platform,
      distro: osInfo.distro,
      release: osInfo.release,
      arch: osInfo.arch,
      hostname: osInfo.hostname,
      uuid: uuid.os,
    };
  }

  async getCpuStats() {
    const [cpu, currentLoad, temp] = await Promise.all([
      si.cpu(),
      si.currentLoad(),
      this.safeGetCpuTemp(),
    ]);

    return {
      manufacturer: cpu.manufacturer,
      brand: cpu.brand,
      cores: cpu.cores,
      speed: cpu.speed,
      load: currentLoad.currentLoad,
      loadPerCore: currentLoad.cpus.map(c => c.load),
      temperature: temp.main,
    };
  }

  async getMemoryStats() {
    const mem = await si.mem();
    const used = typeof mem.used === 'number' && mem.used > 0 
      ? mem.used 
      : (typeof mem.active === 'number' && mem.active > 0 ? mem.active : Math.max(0, mem.total - mem.free));
    const total = typeof mem.total === 'number' && mem.total > 0 ? mem.total : 1;
    const percentage = (used / total) * 100;

    return {
      total: mem.total,
      free: mem.free,
      used,
      active: mem.active || used,
      percentage: Number.isFinite(percentage) ? percentage : 0,
    };
  }

  async getNetworkStats() {
    const [interfaces, stats] = await Promise.all([
      si.networkInterfaces(),
      si.networkStats(),
    ]);

    return {
      interfaces: (interfaces as any[]).map(i => ({
        iface: i.iface,
        ip4: i.ip4,
        mac: i.mac,
        speed: i.speed,
      })),
      stats: stats.map(s => ({
        iface: s.iface,
        rx_sec: s.rx_sec,
        tx_sec: s.tx_sec,
        operstate: s.operstate,
      })),
    };
  }

  async getStorageStats() {
    const [disks, fs] = await Promise.all([
      si.diskLayout(),
      si.fsSize(),
    ]);

    return {
      devices: disks.map(d => ({
        device: d.device,
        name: d.name,
        type: d.type,
        size: d.size,
      })),
      volumes: fs.map(f => ({
        fs: f.fs,
        type: f.type,
        size: f.size,
        used: f.used,
        available: f.available,
        use: f.use,
        mount: f.mount,
      })),
    };
  }

  async getProcessesStats() {
    const procs = await si.processes();
    return {
      all: procs.all,
      running: procs.running,
      blocked: procs.blocked,
      sleeping: procs.sleeping,
      list: procs.list.slice(0, 25).map(p => ({
        pid: p.pid,
        name: p.name,
        cpu: typeof p.cpu === 'number' ? Math.round(p.cpu * 10) / 10 : 0,
        mem: typeof p.mem === 'number' ? Math.round(p.mem * 10) / 10 : 0,
        state: p.state,
        user: p.user,
      })),
    };
  }

  async getMetrics() {
    const [cpu, load, mem, net, fs, time] = await Promise.all([
      si.cpu(),
      si.currentLoad(),
      si.mem(),
      si.networkStats(),
      si.fsSize(),
      si.time(),
    ]);

    const memUsed = typeof mem.used === 'number' && mem.used > 0 
      ? mem.used 
      : (typeof mem.active === 'number' && mem.active > 0 ? mem.active : Math.max(0, mem.total - mem.free));
    const memTotal = typeof mem.total === 'number' && mem.total > 0 ? mem.total : 1;
    const memFree = Math.max(0, memTotal - memUsed);
    const memPercentage = Math.min(100, Math.max(0, (memUsed / memTotal) * 100));

    const cpuLoad = typeof load.currentLoad === 'number' && Number.isFinite(load.currentLoad)
      ? Math.round(load.currentLoad * 10) / 10
      : 0;

    let diskTotal = 0;
    let diskUsed = 0;
    let diskAvailable = 0;
    if (Array.isArray(fs) && fs.length > 0) {
      for (const f of fs) {
        diskTotal += f.size || 0;
        diskUsed += f.used || 0;
        diskAvailable += f.available || 0;
      }
    }
    const diskPercentage = diskTotal > 0 ? Math.min(100, Math.round((diskUsed / diskTotal) * 1000) / 10) : 0;

    let rxSec = 0;
    let txSec = 0;
    if (Array.isArray(net) && net.length > 0) {
      for (const n of net) {
        rxSec += Math.max(0, n.rx_sec || 0);
        txSec += Math.max(0, n.tx_sec || 0);
      }
    }

    const uptimeSec = time?.uptime || process.uptime() || 0;
    const days = Math.floor(uptimeSec / 86400);
    const hours = Math.floor((uptimeSec % 86400) / 3600);
    const mins = Math.floor((uptimeSec % 3600) / 60);
    const uptimeFormatted = days > 0 ? `${days}d ${hours}h ${mins}m` : `${hours}h ${mins}m`;

    const formatBytes = (bytes: number): string => {
      if (bytes <= 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatRate = (bytesPerSec: number): string => {
      if (bytesPerSec <= 0) return '0 KB/s';
      if (bytesPerSec < 1024 * 1024) return (bytesPerSec / 1024).toFixed(1) + ' KB/s';
      return (bytesPerSec / (1024 * 1024)).toFixed(1) + ' MB/s';
    };

    return {
      timestamp: new Date().toISOString(),
      cpu: {
        load: cpuLoad,
        cores: cpu.cores || 4,
        speed: cpu.speed || 2.4,
        brand: cpu.brand || 'Processor',
        manufacturer: cpu.manufacturer || '',
      },
      memory: {
        total: memTotal,
        used: memUsed,
        free: memFree,
        percentage: Math.round(memPercentage * 10) / 10,
        totalFormatted: formatBytes(memTotal),
        usedFormatted: formatBytes(memUsed),
        freeFormatted: formatBytes(memFree),
      },
      disk: {
        total: diskTotal,
        used: diskUsed,
        available: diskAvailable,
        percentage: diskPercentage,
        totalFormatted: formatBytes(diskTotal),
        usedFormatted: formatBytes(diskUsed),
        availableFormatted: formatBytes(diskAvailable),
      },
      network: {
        rx_sec: rxSec,
        tx_sec: txSec,
        rxFormatted: formatRate(rxSec),
        txFormatted: formatRate(txSec),
      },
      uptime: {
        seconds: Math.floor(uptimeSec),
        formatted: uptimeFormatted,
      },
    };
  }

  private async getLiveStats() {
    const [load, mem, net, temp, battery] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.networkStats(),
      this.safeGetCpuTemp(),
      this.safeGetBattery(),
    ]);

    const memUsed = typeof mem.used === 'number' && mem.used > 0 
      ? mem.used 
      : (typeof mem.active === 'number' && mem.active > 0 ? mem.active : Math.max(0, mem.total - mem.free));
    const memTotal = typeof mem.total === 'number' && mem.total > 0 ? mem.total : 1;
    const memPercentage = (memUsed / memTotal) * 100;

    const cpuLoad = typeof load.currentLoad === 'number' && Number.isFinite(load.currentLoad) ? load.currentLoad : 0;

    return {
      timestamp: new Date().toISOString(),
      cpu: {
        load: cpuLoad,
        temp: temp.main,
      },
      memory: {
        total: mem.total,
        used: memUsed,
        active: mem.active || memUsed,
        percentage: Number.isFinite(memPercentage) ? memPercentage : 0,
      },
      network: (net || []).map(n => ({
        iface: n.iface,
        rx: Math.max(0, n.rx_sec || 0),
        tx: Math.max(0, n.tx_sec || 0),
        rx_sec: Math.max(0, n.rx_sec || 0),
        tx_sec: Math.max(0, n.tx_sec || 0),
      })),
      battery: {
        hasBattery: battery.hasBattery,
        percent: battery.percent,
        isCharging: battery.isCharging,
      },
    };
  }

  private async safeGetCpuTemp() {
    try {
      return await si.cpuTemperature();
    } catch {
      return { main: 0, cores: [], max: 0 };
    }
  }

  private async safeGetBattery() {
    try {
      return await si.battery();
    } catch {
      return { hasBattery: false, percent: 0, isCharging: false };
    }
  }
}
