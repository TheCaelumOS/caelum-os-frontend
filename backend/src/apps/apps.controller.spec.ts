import { Test, TestingModule } from '@nestjs/testing';
import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';

describe('AppsController', () => {
  let controller: AppsController;
  let service: AppsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppsController],
      providers: [
        {
          provide: AppsService,
          useValue: {
            getApps: jest.fn().mockResolvedValue([
              { appId: 'docker', name: 'Docker Hub', running: false, installed: true }
            ]),
            getApp: jest.fn().mockResolvedValue(
              { appId: 'docker', name: 'Docker Hub', running: false, installed: true }
            ),
            openApp: jest.fn().mockResolvedValue({ appId: 'docker', running: true }),
            closeApp: jest.fn().mockResolvedValue({ appId: 'docker', running: false }),
            installApp: jest.fn().mockResolvedValue({ appId: 'docker', installed: true }),
            uninstallApp: jest.fn().mockResolvedValue({ appId: 'docker', installed: false }),
          },
        },
      ],
    }).compile();

    controller = module.get<AppsController>(AppsController);
    service = module.get<AppsService>(AppsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list apps', async () => {
    const result = await controller.getApps('user-uuid');
    expect(result).toBeInstanceOf(Array);
    expect(result[0].appId).toBe('docker');
  });

  it('should open app', async () => {
    const result = await controller.openApp('user-uuid', { appId: 'docker' });
    expect(result.running).toBe(true);
  });

  it('should close app', async () => {
    const result = await controller.closeApp('user-uuid', { appId: 'docker' });
    expect(result.running).toBe(false);
  });
});
