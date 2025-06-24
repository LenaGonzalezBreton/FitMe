import { Injectable, Inject } from '@nestjs/common';
import * as os from 'os';
import { PrismaService } from '../../core/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Prisma } from 'generated/prisma';

type DbVersion = { version: string };

@Injectable()
export class StatusService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getDbStatus() {
    try {
      const result = await this.prisma.$queryRaw<DbVersion[]>`SELECT version()`;
      const version = result[0].version.split(',')[0];
      return { status: 'OK', message: version };
    } catch (e) {
      const error = e as Error;
      return { status: 'Error', message: error.message };
    }
  }

  async getRedisStatus() {
    try {
      await this.cacheManager.set('health_check', 'ok', 10 * 1000); // 10 seconds TTL
      const result = await this.cacheManager.get('health_check');
      if (result === 'ok') {
        return { status: 'OK', message: 'Connected' };
      }
      return { status: 'Error', message: 'Health check failed' };
    } catch (e) {
      const error = e as Error;
      return { status: 'Error', message: error.message };
    }
  }

  async getAppStatus() {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const dbStatus = await this.getDbStatus();
    const redisStatus = await this.getRedisStatus();

    return {
      status: 'OK',
      uptime: this.formatUptime(uptime),
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      cpuCount: os.cpus().length,
      memory: {
        rss: this.formatBytes(memoryUsage.rss),
        heapTotal: this.formatBytes(memoryUsage.heapTotal),
        heapUsed: this.formatBytes(memoryUsage.heapUsed),
        external: this.formatBytes(memoryUsage.external),
        raw: {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
        },
      },
      database: {
        status: dbStatus.status,
        message: dbStatus.message,
      },
      prisma: {
        status: dbStatus.status === 'OK' ? 'Connected' : 'Disconnected',
        version: Prisma.prismaVersion.client,
      },
      redis: {
        status: redisStatus.status,
        message: redisStatus.message,
      },
    };
  }

  private formatUptime(seconds: number): string {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  }

  private formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
