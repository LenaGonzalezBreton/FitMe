import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { StatusService } from '../../src/modules/status/status.service';
import { PrismaService } from '../../src/core/prisma.service';

describe('StatusService', () => {
  let service: StatusService;
  let prismaService: jest.Mocked<PrismaService>;
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(async () => {
    const mockPrismaService = {
      $queryRaw: jest.fn(),
    };

    const mockCacheManager = {
      set: jest.fn(),
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<StatusService>(StatusService);
    prismaService = module.get(PrismaService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getDbStatus', () => {
    it('should return OK status when database is connected', async () => {
      const mockDbVersion = [{ version: 'PostgreSQL 14.2, compiled by gcc' }];
      prismaService.$queryRaw.mockResolvedValue(mockDbVersion);

      const result = await service.getDbStatus();

      expect(result).toEqual({
        status: 'OK',
        message: 'PostgreSQL 14.2',
      });
      expect(prismaService.$queryRaw).toHaveBeenCalledWith(
        expect.anything(), // Template literal query
      );
    });

    it('should return Error status when database query fails', async () => {
      const mockError = new Error('Connection failed');
      prismaService.$queryRaw.mockRejectedValue(mockError);

      const result = await service.getDbStatus();

      expect(result).toEqual({
        status: 'Error',
        message: 'Connection failed',
      });
    });

    it('should handle different PostgreSQL version formats', async () => {
      const mockDbVersion = [
        { version: 'PostgreSQL 13.8 on x86_64-pc-linux-gnu, compiled by gcc' },
      ];
      prismaService.$queryRaw.mockResolvedValue(mockDbVersion);

      const result = await service.getDbStatus();

      expect(result).toEqual({
        status: 'OK',
        message: 'PostgreSQL 13.8 on x86_64-pc-linux-gnu',
      });
    });
  });

  describe('getRedisStatus', () => {
    it('should return OK status when Redis is connected', async () => {
      cacheManager.set.mockResolvedValue();
      cacheManager.get.mockResolvedValue('ok');

      const result = await service.getRedisStatus();

      expect(result).toEqual({
        status: 'OK',
        message: 'Connected',
      });
      expect(cacheManager.set).toHaveBeenCalledWith(
        'health_check',
        'ok',
        10000,
      );
      expect(cacheManager.get).toHaveBeenCalledWith('health_check');
    });

    it('should return Error status when health check fails', async () => {
      cacheManager.set.mockResolvedValue();
      cacheManager.get.mockResolvedValue('not_ok');

      const result = await service.getRedisStatus();

      expect(result).toEqual({
        status: 'Error',
        message: 'Health check failed',
      });
    });

    it('should return Error status when Redis operations fail', async () => {
      const mockError = new Error('Redis connection failed');
      cacheManager.set.mockRejectedValue(mockError);

      const result = await service.getRedisStatus();

      expect(result).toEqual({
        status: 'Error',
        message: 'Redis connection failed',
      });
    });

    it('should return Error status when cache get returns null', async () => {
      cacheManager.set.mockResolvedValue();
      cacheManager.get.mockResolvedValue(null);

      const result = await service.getRedisStatus();

      expect(result).toEqual({
        status: 'Error',
        message: 'Health check failed',
      });
    });
  });

  describe('getAppStatus', () => {
    beforeEach(() => {
      // Mock process properties
      jest.spyOn(process, 'uptime').mockReturnValue(3661); // 1h 1m 1s
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        rss: 50 * 1024 * 1024, // 50MB
        heapTotal: 30 * 1024 * 1024, // 30MB
        heapUsed: 20 * 1024 * 1024, // 20MB
        external: 5 * 1024 * 1024, // 5MB
        arrayBuffers: 1 * 1024 * 1024, // 1MB
      });

      // Mock os methods
      const os = require('os');
      jest.spyOn(os, 'platform').mockReturnValue('linux');
      jest.spyOn(os, 'arch').mockReturnValue('x64');
      jest.spyOn(os, 'cpus').mockReturnValue(Array(4).fill({})); // 4 CPUs
    });

    it('should return complete app status when all services are OK', async () => {
      // Mock successful database and Redis status
      const mockDbVersion = [{ version: 'PostgreSQL 14.2' }];
      prismaService.$queryRaw.mockResolvedValue(mockDbVersion);
      cacheManager.set.mockResolvedValue();
      cacheManager.get.mockResolvedValue('ok');

      const result = await service.getAppStatus();

      expect(result).toEqual({
        status: 'OK',
        uptime: '0d 1h 1m 1s',
        nodeVersion: process.version,
        platform: 'linux',
        arch: 'x64',
        cpuCount: 4,
        memory: {
          rss: '50 MB',
          heapTotal: '30 MB',
          heapUsed: '20 MB',
          external: '5 MB',
          raw: {
            heapUsed: 20 * 1024 * 1024,
            heapTotal: 30 * 1024 * 1024,
          },
        },
        database: {
          status: 'OK',
          message: 'PostgreSQL 14.2',
        },
        prisma: {
          status: 'Connected',
          version: expect.any(String),
        },
        redis: {
          status: 'OK',
          message: 'Connected',
        },
      });
    });

    it('should return status with failed database connection', async () => {
      // Mock failed database status
      prismaService.$queryRaw.mockRejectedValue(
        new Error('DB connection failed'),
      );
      cacheManager.set.mockResolvedValue();
      cacheManager.get.mockResolvedValue('ok');

      const result = await service.getAppStatus();

      expect(result.database).toEqual({
        status: 'Error',
        message: 'DB connection failed',
      });
      expect(result.prisma.status).toBe('Disconnected');
    });

    it('should return status with failed Redis connection', async () => {
      // Mock successful database but failed Redis
      const mockDbVersion = [{ version: 'PostgreSQL 14.2' }];
      prismaService.$queryRaw.mockResolvedValue(mockDbVersion);
      cacheManager.set.mockRejectedValue(new Error('Redis connection failed'));

      const result = await service.getAppStatus();

      expect(result.redis).toEqual({
        status: 'Error',
        message: 'Redis connection failed',
      });
    });
  });

  describe('formatUptime', () => {
    it('should format uptime correctly for various durations', () => {
      const service = new StatusService({} as any, {} as any);

      // Access private method for testing
      const formatUptime = (service as any).formatUptime;

      expect(formatUptime(0)).toBe('0d 0h 0m 0s');
      expect(formatUptime(61)).toBe('0d 0h 1m 1s');
      expect(formatUptime(3661)).toBe('0d 1h 1m 1s');
      expect(formatUptime(90061)).toBe('1d 1h 1m 1s');
      expect(formatUptime(86400)).toBe('1d 0h 0m 0s');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly for various sizes', () => {
      const service = new StatusService({} as any, {} as any);

      // Access private method for testing
      const formatBytes = (service as any).formatBytes;

      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe('1 TB');
    });

    it('should handle decimal precision', () => {
      const service = new StatusService({} as any, {} as any);
      const formatBytes = (service as any).formatBytes;

      expect(formatBytes(1536, 0)).toBe('2 KB');
      expect(formatBytes(1536, 1)).toBe('1.5 KB');
      expect(formatBytes(1536, 3)).toBe('1.5 KB');
    });

    it('should handle fractional bytes', () => {
      const service = new StatusService({} as any, {} as any);
      const formatBytes = (service as any).formatBytes;

      expect(formatBytes(512)).toBe('512 Bytes');
      expect(formatBytes(1536)).toBe('1.5 KB');
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
