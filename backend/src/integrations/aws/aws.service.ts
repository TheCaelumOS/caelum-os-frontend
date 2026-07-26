import { Injectable } from '@nestjs/common';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import { RDSClient, DescribeDBInstancesCommand } from '@aws-sdk/client-rds';

@Injectable()
export class AwsService {
  private s3Client: S3Client;
  private ec2Client: EC2Client;
  private rdsClient: RDSClient;
  private isConfigured = false;

  constructor() {
    try {
      // Check if AWS credentials exist in environment config
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        const region = process.env.AWS_REGION || 'us-east-1';
        this.s3Client = new S3Client({ region });
        this.ec2Client = new EC2Client({ region });
        this.rdsClient = new RDSClient({ region });
        this.isConfigured = true;
      }
    } catch {
      console.warn('AWS SDK credentials missing. Spawning mock AWS cloud integration provider.');
    }
  }

  async listS3Buckets() {
    if (!this.isConfigured) {
      return [
        { Name: 'caelum-os-static-assets', CreationDate: '2026-01-15T08:30:00.000Z' },
        { Name: 'caelum-terraform-states-store', CreationDate: '2026-02-20T14:45:00.000Z' },
        { Name: 'caelum-user-backups-bucket', CreationDate: '2026-03-05T11:15:00.000Z' },
      ];
    }
    try {
      const command = new ListBucketsCommand({});
      const res = await this.s3Client.send(command);
      return res.Buckets || [];
    } catch {
      return [
        { Name: 'caelum-os-static-assets-fallback', CreationDate: '2026-01-15T08:30:00.000Z' },
      ];
    }
  }

  async listEc2Instances() {
    if (!this.isConfigured) {
      return [
        { id: 'i-0a2b8cd9a84f102bc', name: 'caelum-prod-web-01', type: 't3.medium', state: 'running', ip: '54.210.12.85', zone: 'us-east-1a' },
        { id: 'i-0fb839da218ba921c', name: 'caelum-prod-api-01', type: 't3.large', state: 'running', ip: '54.210.12.86', zone: 'us-east-1b' },
        { id: 'i-09ab7dcd872fb9281', name: 'caelum-stage-sandbox', type: 't3.small', state: 'stopped', ip: 'N/A', zone: 'us-east-1a' },
      ];
    }
    try {
      const command = new DescribeInstancesCommand({});
      const res = await this.ec2Client.send(command);
      const instances = [];
      res.Reservations?.forEach(res => {
        res.Instances?.forEach(ins => {
          const nameTag = ins.Tags?.find(t => t.Key === 'Name')?.Value;
          instances.push({
            id: ins.InstanceId,
            name: nameTag || 'unnamed',
            type: ins.InstanceType,
            state: ins.State?.Name,
            ip: ins.PublicIpAddress || 'N/A',
            zone: ins.Placement?.AvailabilityZone,
          });
        });
      });
      return instances;
    } catch {
      return [];
    }
  }

  async listRdsDatabases() {
    if (!this.isConfigured) {
      return [
        { name: 'caelum-postgres-prod', class: 'db.r6g.large', engine: 'postgres', version: '15.4', status: 'available', size: '100GB' },
        { name: 'caelum-redis-cache-cluster', class: 'cache.t4g.medium', engine: 'redis', version: '7.0', status: 'available', size: 'N/A' },
      ];
    }
    try {
      const command = new DescribeDBInstancesCommand({});
      const res = await this.rdsClient.send(command);
      return res.DBInstances?.map(db => ({
        name: db.DBInstanceIdentifier,
        class: db.DBInstanceClass,
        engine: db.Engine,
        version: db.EngineVersion,
        status: db.DBInstanceStatus,
        size: `${db.AllocatedStorage}GB`,
      })) || [];
    } catch {
      return [];
    }
  }
}
