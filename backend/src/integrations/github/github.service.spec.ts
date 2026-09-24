import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { GithubService } from './github.service';
import { PrismaService } from '../../prisma/prisma.service';
import { encryptToken, decryptToken } from './utils/github-crypto.util';
import { oauthStateStore } from './utils/oauth-state.store';

describe('GithubService', () => {
  let service: GithubService;
  let configService: ConfigService;

  const mockConfig = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'GITHUB_CLIENT_ID':
          return 'mock-client-id';
        case 'GITHUB_CLIENT_SECRET':
          return 'mock-client-secret';
        case 'GITHUB_CALLBACK_URL':
          return 'http://localhost:4000/github/callback';
        case 'JWT_SECRET':
          return 'test-jwt-secret-key-32-chars-long!';
        default:
          return null;
      }
    }),
  };

  const mockPrisma = {
    githubConnection: {
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubService,
        { provide: ConfigService, useValue: mockConfig },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GithubService>(GithubService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('Encryption & Decryption Security', () => {
    it('should securely encrypt and decrypt access tokens using AES-256-GCM', () => {
      const plaintext = 'gho_16C7e42F292c6912E7710c838347Ae178B4a';
      const encrypted = encryptToken(plaintext);

      expect(encrypted).not.toEqual(plaintext);
      expect(encrypted.split(':').length).toBe(3); // iv:authTag:ciphertext

      const decrypted = decryptToken(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should throw on corrupted encrypted token', () => {
      expect(() => decryptToken('invalid:format')).toThrow();
    });
  });

  describe('OAuth State Validation', () => {
    it('should generate a 64-char hex state and consume it once', () => {
      const userId = 'user-123';
      const state = oauthStateStore.generateState(userId);

      expect(state).toHaveLength(64);

      // First validation must succeed and return userId
      const validatedUserId = oauthStateStore.validateAndConsumeState(state);
      expect(validatedUserId).toBe(userId);

      // Second validation must fail (single-use CSRF prevention)
      const secondAttempt = oauthStateStore.validateAndConsumeState(state);
      expect(secondAttempt).toBeNull();
    });

    it('should reject non-existent state tokens', () => {
      expect(oauthStateStore.validateAndConsumeState('fake-state-token')).toBeNull();
    });
  });

  describe('OAuth URL Generation', () => {
    it('should return authorization URL with client_id, state, and scopes', () => {
      const { url, state } = service.getAuthUrl('user-123');

      expect(url).toContain('https://github.com/login/oauth/authorize');
      expect(url).toContain('client_id=mock-client-id');
      expect(url).toContain(`state=${state}`);
      expect(url).toContain('scope=repo+read%3Auser+user%3Aemail+workflow');
    });

    it('should throw HttpException if GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing', () => {
      jest.spyOn(configService, 'get').mockReturnValue(null);
      expect(() => service.getAuthUrl('user-123')).toThrow();
    });
  });

  describe('Connection Status & Multi-User Isolation', () => {
    it('should return connected: false when user has no stored credentials', async () => {
      const status = await service.getStatus('unknown-user-id');
      expect(status.connected).toBe(false);
    });

    it('should throw UnauthorizedException when attempting operations without connection', async () => {
      await expect(service.getRepositories('unconnected-user')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle disconnect cleanly', async () => {
      const res = await service.disconnect('user-123');
      expect(res.success).toBe(true);
      expect(res.message).toContain('disconnected successfully');
    });
  });

  describe('Webhook Signature Validation', () => {
    it('should verify correct HMAC-SHA256 signature', () => {
      const crypto = require('crypto');
      const secret = 'webhook-secret-123';
      jest.spyOn(configService, 'get').mockReturnValue(secret);

      const payload = { action: 'opened', issue: { number: 1 } };
      const hmac = crypto.createHmac('sha256', secret);
      const signature = `sha256=${hmac.update(JSON.stringify(payload)).digest('hex')}`;

      const result = service.handleWebhook(signature, payload);
      expect(result.received).toBe(true);
    });
  });
});
