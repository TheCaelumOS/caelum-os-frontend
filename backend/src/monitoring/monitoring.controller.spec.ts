import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';

describe('MonitoringController', () => {
  let controller: MonitoringController;
  let service: MonitoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [
        {
          provide: MonitoringService,
          useValue: {
            getSystemInfo: jest.fn().mockResolvedValue({ distro: 'Ubuntu', arch: 'x64' }),
            getCpuStats: jest.fn().mockResolvedValue({ load: 20.5, cores: 4 }),
            getMemoryStats: jest.fn().mockResolvedValue({ total: 16000, used: 8000, percentage: 50 }),
            getNetworkStats: jest.fn().mockResolvedValue({ interfaces: [] }),
            getStorageStats: jest.fn().mockResolvedValue({ volumes: [] }),
            getProcessesStats: jest.fn().mockResolvedValue({ running: 5, list: [] }),
          },
        },
      ],
    }).compile();

    controller = module.get<MonitoringController>(MonitoringController);
    service = module.get<MonitoringService>(MonitoringService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get system specifications', async () => {
    const result = await controller.getSystemInfo();
    expect(result).toHaveProperty('distro');
    expect(result.distro).toBe('Ubuntu');
  });

  it('should get memory allocations', async () => {
    const result = await controller.getMemoryStats();
    expect(result).toHaveProperty('percentage');
    expect(result.percentage).toBe(50);
  });
});
