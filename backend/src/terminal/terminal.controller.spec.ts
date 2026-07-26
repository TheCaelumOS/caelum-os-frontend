import { Test, TestingModule } from '@nestjs/testing';
import { TerminalController } from './terminal.controller';
import { TerminalService } from './terminal.service';

describe('TerminalController', () => {
  let controller: TerminalController;
  let service: TerminalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TerminalController],
      providers: [
        {
          provide: TerminalService,
          useValue: {
            getSessions: jest.fn().mockResolvedValue([{ id: 'sess-uuid', token: 'token-123', status: 'active', active: true }]),
            createSession: jest.fn().mockResolvedValue({ id: 'sess-uuid', token: 'token-123', status: 'active', active: true }),
            deleteSession: jest.fn().mockResolvedValue({ sessionId: 'sess-uuid', success: true }),
          },
        },
      ],
    }).compile();

    controller = module.get<TerminalController>(TerminalController);
    service = module.get<TerminalService>(TerminalService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list terminal sessions', async () => {
    const result = await controller.getSessions('user-uuid');
    expect(result).toBeInstanceOf(Array);
    expect(result[0].token).toBe('token-123');
  });

  it('should spawn a new session', async () => {
    const result = await controller.createSession('user-uuid', { name: 'Bash Session' });
    expect(result).toHaveProperty('token');
    expect(result.token).toBe('token-123');
  });

  it('should close a session', async () => {
    const result = await controller.deleteSession('user-uuid', 'sess-uuid');
    expect(result.success).toBe(true);
  });
});
