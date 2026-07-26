import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getPreferences: jest.fn().mockResolvedValue({ userId: 'user-uuid', theme: 'dark', volume: 80, brightness: 90 }),
            updatePreferences: jest.fn().mockResolvedValue({ userId: 'user-uuid', theme: 'light', volume: 70, brightness: 85 }),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get user preferences', async () => {
    const result = await controller.getPreferences('user-uuid');
    expect(result).toHaveProperty('theme');
    expect(result.theme).toBe('dark');
  });

  it('should update user preferences', async () => {
    const result = await controller.updatePreferences('user-uuid', { theme: 'light' });
    expect(result).toHaveProperty('theme');
    expect(result.theme).toBe('light');
  });
});
