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
      list: procs.list.slice(0, 15).map(p => ({
        pid: p.pid,
        name: p.name,
        cpu: p.cpu,
        mem: p.mem,
        state: p.state,
        user: p.user,
      })),
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
