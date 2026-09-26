import { Test, TestingModule } from '@nestjs/testing';
import { FilesystemController } from './filesystem.controller';
import { FilesystemService } from './filesystem.service';

describe('FilesystemController', () => {
  let controller: FilesystemController;
  let service: FilesystemService;
  const mockUser = { id: 'test-user-id', email: 'test@caelum-os.io' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesystemController],
      providers: [
        {
          provide: FilesystemService,
          useValue: {
            listFiles: jest.fn().mockResolvedValue([{ name: 'README.md', isDirectory: false, size: 100 }]),
            readFile: jest.fn().mockResolvedValue({ path: 'README.md', content: '# CaelumOS' }),
            writeFile: jest.fn().mockResolvedValue({ path: 'README.md', success: true }),
            deleteFile: jest.fn().mockResolvedValue({ path: 'README.md', success: true }),
            mkdir: jest.fn().mockResolvedValue({ path: 'projects', success: true }),
            moveFile: jest.fn().mockResolvedValue({ source: 'src', destination: 'dst', success: true }),
          },
        },
      ],
    }).compile();

    controller = module.get<FilesystemController>(FilesystemController);
    service = module.get<FilesystemService>(FilesystemService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list directory files', async () => {
    const result = await controller.listFiles(mockUser, { path: '/' });
    expect(result).toBeInstanceOf(Array);
    expect(result[0].name).toBe('README.md');
  });

  it('should read file content', async () => {
    const result = await controller.readFile(mockUser, { path: 'README.md' });
    expect(result).toHaveProperty('content');
    expect(result.content).toBe('# CaelumOS');
  });

  it('should write file content', async () => {
    const result = await controller.writeFile(mockUser, { path: 'README.md', content: 'test' });
    expect(result.success).toBe(true);
  });
});
