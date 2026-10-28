import { Test, TestingModule } from '@nestjs/testing';
import { JenkinsService } from './jenkins.service';
import { JenkinsConnectionStatus, JenkinsBuildResult, parseJenkinsColor } from './jenkins.constants';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { encryptJenkinsSecret, decryptJenkinsSecret } from './utils/jenkins-crypto.util';

describe('JenkinsService', () => {
  let service: JenkinsService;
  const testUserA = 'test-jenkins-user-a-' + Date.now();
  const testUserB = 'test-jenkins-user-b-' + Date.now();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JenkinsService],
    }).compile();

    service = module.get<JenkinsService>(JenkinsService);
  });

  afterAll(async () => {
    await service.disconnect(testUserA);
    await service.disconnect(testUserB);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Crypto & Security', () => {
    it('should encrypt and decrypt secrets symmetrically using AES-256-GCM', () => {
      const secret = '11abcdef0123456789jenkins-api-token-secret!';
      const encrypted = encryptJenkinsSecret(secret);
      expect(encrypted).not.toEqual(secret);
      expect(encrypted.split(':').length).toBe(3); // iv:authTag:ciphertext

      const decrypted = decryptJenkinsSecret(encrypted);
      expect(decrypted).toEqual(secret);
    });

    it('should return empty string when encrypting or decrypting empty values', () => {
      expect(encryptJenkinsSecret('')).toBe('');
      expect(decryptJenkinsSecret('')).toBe('');
    });
  });

  describe('Jenkins Color Parsing', () => {
    it('should correctly map standard Jenkins color codes to statuses', () => {
      expect(parseJenkinsColor('blue')).toEqual({ status: JenkinsBuildResult.SUCCESS, isBuilding: false });
      expect(parseJenkinsColor('blue_anime')).toEqual({ status: JenkinsBuildResult.SUCCESS, isBuilding: true });
      expect(parseJenkinsColor('red')).toEqual({ status: JenkinsBuildResult.FAILURE, isBuilding: false });
      expect(parseJenkinsColor('red_anime')).toEqual({ status: JenkinsBuildResult.FAILURE, isBuilding: true });
      expect(parseJenkinsColor('yellow')).toEqual({ status: JenkinsBuildResult.UNSTABLE, isBuilding: false });
      expect(parseJenkinsColor('aborted')).toEqual({ status: JenkinsBuildResult.ABORTED, isBuilding: false });
      expect(parseJenkinsColor('grey')).toEqual({ status: JenkinsBuildResult.NOT_BUILT, isBuilding: false });
      expect(parseJenkinsColor('disabled')).toEqual({ status: JenkinsBuildResult.NOT_BUILT, isBuilding: false });
      expect(parseJenkinsColor('')).toEqual({ status: JenkinsBuildResult.UNKNOWN, isBuilding: false });
    });
  });

  describe('Connection Lifecycle & Isolation', () => {
    it('should return NOT_CONNECTED for an unconfigured user', async () => {
      const status = await service.getStatus('unconfigured-user-' + Date.now());
      expect(status.status).toBe(JenkinsConnectionStatus.NOT_CONNECTED);
    });

    it('should throw NotFoundException when calling operations on an unconfigured user', async () => {
      await expect(service.getJobs('unconfigured-user-' + Date.now())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should reject connection when target server is unreachable or invalid', async () => {
      await expect(
        service.connect(testUserA, {
          url: 'http://127.0.0.1:59998',
          username: 'admin',
          apiToken: 'fake-token-12345',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should isolate connections between multiple users', async () => {
      const statusA = await service.getStatus(testUserA);
      const statusB = await service.getStatus(testUserB);

      expect(statusA.status).toBe(JenkinsConnectionStatus.NOT_CONNECTED);
      expect(statusB.status).toBe(JenkinsConnectionStatus.NOT_CONNECTED);

      const discA = await service.disconnect(testUserA);
      expect(discA.disconnected).toBe(true);

      const discB = await service.disconnect(testUserB);
      expect(discB.disconnected).toBe(true);
    });
  });
});
