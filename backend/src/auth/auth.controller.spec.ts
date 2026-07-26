import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from './dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue({ id: 'user-uuid', email: 'test@caelum-os.io', role: 'USER' }),
            login: jest.fn().mockResolvedValue({ accessToken: 'access_tok', refreshToken: 'ref_tok' }),
            refresh: jest.fn().mockResolvedValue({ accessToken: 'new_access_tok', refreshToken: 'new_ref_tok' }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register user', async () => {
    const dto = { email: 'test@caelum-os.io', password: 'password123' };
    const result = await controller.register(dto);
    expect(result).toHaveProperty('id');
    expect(result.email).toBe(dto.email);
  });

  it('should login user', async () => {
    const dto = { email: 'test@caelum-os.io', password: 'password123' };
    const result = await controller.login(dto);
    expect(result).toHaveProperty('accessToken');
  });
});
