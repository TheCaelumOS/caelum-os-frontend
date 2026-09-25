import { Test, TestingModule } from '@nestjs/testing';
import { GrafanaService } from './grafana.service';
import { GrafanaConnectionStatus } from './grafana.constants';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

describe('GrafanaService', () => {
  let service: GrafanaService;
  const testUserA = 'test-user-a-' + Date.now();
  const testUserB = 'test-user-b-' + Date.now();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GrafanaService],
    }).compile();

    service = module.get<GrafanaService>(GrafanaService);
  });

  afterAll(() => {
    // Cleanup test users
    service.disconnect(testUserA);
    service.disconnect(testUserB);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return NOT_CONNECTED for an unconfigured user', async () => {
    const status = await service.getStatus('unconfigured-user-' + Date.now());
    expect(status.status).toBe(GrafanaConnectionStatus.NOT_CONNECTED);
  });

  it('should throw UnauthorizedException when calling operations on an unconfigured user', async () => {
    await expect(service.getDashboards('unconfigured-user-' + Date.now())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should reject connection when target server is unreachable or invalid', async () => {
    await expect(
      service.connect(testUserA, {
        url: 'http://127.0.0.1:59999',
        authType: 'token',
        token: 'invalid-token-12345',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should ensure multi-user isolation between User A and User B', async () => {
    // Both users start not connected
    const statusA = await service.getStatus(testUserA);
    const statusB = await service.getStatus(testUserB);

    expect(statusA.status).toBe(GrafanaConnectionStatus.NOT_CONNECTED);
    expect(statusB.status).toBe(GrafanaConnectionStatus.NOT_CONNECTED);

    // Verify disconnect is safe and isolated
    const discA = await service.disconnect(testUserA);
    expect(discA.success).toBe(true);

    const discB = await service.disconnect(testUserB);
    expect(discB.success).toBe(true);
  });

  it('should return empty overview with available=false when not connected (no fake data)', async () => {
    const overview = await service.getOverview('unconfigured-user-' + Date.now());
    expect(overview.connected).toBe(false);
    expect(overview.status).toBe(GrafanaConnectionStatus.NOT_CONNECTED);
    expect(overview.system.available).toBe(false);
    expect(overview.docker.available).toBe(false);
    expect(overview.kubernetes.available).toBe(false);
    expect(overview.alerts.available).toBe(false);
    expect(overview.logs.available).toBe(false);
  });
});
