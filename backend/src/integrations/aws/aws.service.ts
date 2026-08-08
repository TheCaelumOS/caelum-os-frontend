import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { EC2Client, DescribeInstancesCommand, DescribeVpcsCommand, DescribeSubnetsCommand, DescribeSecurityGroupsCommand } from '@aws-sdk/client-ec2';
import { RDSClient, DescribeDBInstancesCommand } from '@aws-sdk/client-rds';
import { LambdaClient, ListFunctionsCommand } from '@aws-sdk/client-lambda';
import { IAMClient, ListUsersCommand } from '@aws-sdk/client-iam';
import { CloudWatchClient, DescribeAlarmsCommand } from '@aws-sdk/client-cloudwatch';
import { CostExplorerClient, GetCostAndUsageCommand } from '@aws-sdk/client-cost-explorer';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string, keyString: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(keyString);
  const key = hash.digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText: string, keyString: string): string {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return '';
    const iv = Buffer.from(parts[0], 'hex');
    const hash = crypto.createHash('sha256');
    hash.update(keyString);
    const key = hash.digest();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return '';
  }
}

@Injectable()
export class AwsService {
  private credentialsMap = new Map<string, any>();

  private async loadCredentials(userId: string) {
    if (this.credentialsMap.has(userId)) {
      return this.credentialsMap.get(userId);
    }
    const dataDir = join(process.cwd(), 'data');
    const filePath = join(dataDir, 'aws_credentials.json');
    try {
      if (!existsSync(filePath)) return null;
      const fileData = await fs.readFile(filePath, 'utf8');
      const allCreds = JSON.parse(fileData);
      const encryptedStr = allCreds[userId];
      if (!encryptedStr) return null;

      const secret = process.env.JWT_SECRET || 'caelum-aws-encryption-fallback-key-2026';
      const decryptedStr = decrypt(encryptedStr, secret);
      if (!decryptedStr) return null;

      const creds = JSON.parse(decryptedStr);
      this.credentialsMap.set(userId, creds);
      return creds;
    } catch (err) {
      console.error('[AwsService] Failed to load credentials for user:', userId, err);
      return null;
    }
  }

  private async saveCredentials(userId: string, creds: any) {
    this.credentialsMap.set(userId, creds);
    const dataDir = join(process.cwd(), 'data');
    const filePath = join(dataDir, 'aws_credentials.json');
    try {
      if (!existsSync(dataDir)) {
        await fs.mkdir(dataDir, { recursive: true });
      }
      let allCreds: any = {};
      if (existsSync(filePath)) {
        const fileData = await fs.readFile(filePath, 'utf8');
        allCreds = JSON.parse(fileData);
      }

      const secret = process.env.JWT_SECRET || 'caelum-aws-encryption-fallback-key-2026';
      const encryptedStr = encrypt(JSON.stringify(creds), secret);
      allCreds[userId] = encryptedStr;
      await fs.writeFile(filePath, JSON.stringify(allCreds, null, 2), 'utf8');
    } catch (err) {
      console.error('[AwsService] Failed to save credentials for user:', userId, err);
    }
  }

  private async removeCredentials(userId: string) {
    this.credentialsMap.delete(userId);
    const dataDir = join(process.cwd(), 'data');
    const filePath = join(dataDir, 'aws_credentials.json');
    try {
      if (!existsSync(filePath)) return;
      const fileData = await fs.readFile(filePath, 'utf8');
      const allCreds = JSON.parse(fileData);
      delete allCreds[userId];
      await fs.writeFile(filePath, JSON.stringify(allCreds, null, 2), 'utf8');
    } catch (err) {
      console.error('[AwsService] Failed to remove credentials for user:', userId, err);
    }
  }

  private async getClientConfig(userId: string) {
    const creds = await this.loadCredentials(userId);
    if (!creds) {
      throw new HttpException('No AWS credentials connected.', HttpStatus.UNAUTHORIZED);
    }

    const region = creds.region || 'us-east-1';
    if (creds.authMethod === 'cli') {
      return { region };
    } else if (creds.authMethod === 'iamUser') {
      return {
        region,
        credentials: {
          accessKeyId: creds.accessKeyId,
          secretAccessKey: creds.secretAccessKey,
        },
      };
    }
    throw new HttpException('Invalid authentication method.', HttpStatus.BAD_REQUEST);
  }

  async connect(userId: string, body: any) {
    const { authMethod, accessKeyId, secretAccessKey, region } = body;
    console.log(`[AwsService] Connect request received for user: ${userId}. Method: ${authMethod}, Region: ${region || 'us-east-1'}`);

    const testConfig: any = { region: region || 'us-east-1' };

    if (authMethod === 'iamUser') {
      if (!accessKeyId || !secretAccessKey) {
        console.warn('[AwsService] Connection rejected: Missing IAM keys.');
        throw new HttpException('Access Key ID and Secret Access Key are required for IAM User auth.', HttpStatus.BAD_REQUEST);
      }
      testConfig.credentials = { accessKeyId, secretAccessKey };
    }

    try {
      const sts = new STSClient(testConfig);
      console.log('[AwsService] Attempting caller identity query to verify credentials...');
      const testRes = await sts.send(new GetCallerIdentityCommand({}));
      if (!testRes.Account) {
        throw new Error('Caller identity did not return an Account ID.');
      }

      console.log(`[AwsService] Connection successful! Account ID detected: ${testRes.Account}`);
      const connectionDetails = {
        authMethod,
        accessKeyId: authMethod === 'iamUser' ? accessKeyId : undefined,
        secretAccessKey: authMethod === 'iamUser' ? secretAccessKey : undefined,
        region: region || 'us-east-1',
        accountId: testRes.Account,
      };

      await this.saveCredentials(userId, connectionDetails);
      return { connected: true, accountId: testRes.Account };
    } catch (err: any) {
      console.error('[AwsService] Connection validation failed with SDK exception:', err.message);
      throw new HttpException(
        `AWS Authentication failed: ${err.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async disconnect(userId: string) {
    console.log(`[AwsService] Disconnecting AWS credentials for user: ${userId}`);
    await this.removeCredentials(userId);
    return { connected: false };
  }

  async getHealth(userId: string) {
    console.log(`[AwsService] Health status check requested for user: ${userId}`);
    const creds = await this.loadCredentials(userId);
    if (!creds) {
      console.log('[AwsService] Health status: Not Connected');
      return { connected: false, reason: 'No AWS account connected.' };
    }

    try {
      const config = await this.getClientConfig(userId);
      const sts = new STSClient(config);
      const stsRes = await sts.send(new GetCallerIdentityCommand({}));
      console.log(`[AwsService] Health validation succeeded. Account ID: ${stsRes.Account}`);

      // Gather count statistics
      let ec2Count = 0;
      let s3Count = 0;
      let rdsCount = 0;
      let lambdaCount = 0;

      try {
        const ec2 = new EC2Client(config);
        const ec2Res = await ec2.send(new DescribeInstancesCommand({}));
        ec2Res.Reservations?.forEach(r => {
          ec2Count += r.Instances?.length || 0;
        });
      } catch (e) {
        console.warn('[AwsService] Health count EC2 query failed:', e.message);
      }

      try {
        const s3 = new S3Client(config);
        const s3Res = await s3.send(new ListBucketsCommand({}));
        s3Count = s3Res.Buckets?.length || 0;
      } catch (e) {
        console.warn('[AwsService] Health count S3 query failed:', e.message);
      }

      try {
        const rds = new RDSClient(config);
        const rdsRes = await rds.send(new DescribeDBInstancesCommand({}));
        rdsCount = rdsRes.DBInstances?.length || 0;
      } catch (e) {
        console.warn('[AwsService] Health count RDS query failed:', e.message);
      }

      try {
        const lambda = new LambdaClient(config);
        const lambdaRes = await lambda.send(new ListFunctionsCommand({}));
        lambdaCount = lambdaRes.Functions?.length || 0;
      } catch (e) {
        console.warn('[AwsService] Health count Lambda query failed:', e.message);
      }

      console.log(`[AwsService] Counts fetched - EC2: ${ec2Count}, S3: ${s3Count}, RDS: ${rdsCount}, Lambda: ${lambdaCount}`);
      return {
        connected: true,
        authentication: creds.authMethod === 'cli' ? 'AWS CLI' : 'IAM User',
        accountId: stsRes.Account || creds.accountId || 'Unknown',
        region: config.region,
        ec2: ec2Count,
        s3: s3Count,
        rds: rdsCount,
        lambda: lambdaCount,
      };
    } catch (err: any) {
      console.error('[AwsService] Health check failed with credentials validation error:', err.message);
      return { connected: false, error: err.message };
    }
  }

  async listS3Buckets(userId: string) {
    console.log(`[AwsService] listS3Buckets called for user: ${userId}`);
    try {
      const config = await this.getClientConfig(userId);
      const s3 = new S3Client(config);
      const res = await s3.send(new ListBucketsCommand({}));
      const buckets = res.Buckets || [];
      console.log(`[AwsService] S3 list successful. Found ${buckets.length} buckets.`);
      return buckets;
    } catch (err: any) {
      console.error('[AwsService] listS3Buckets failed:', err.message);
      return [];
    }
  }

  async listEc2Instances(userId: string) {
    console.log(`[AwsService] listEc2Instances called for user: ${userId}`);
    try {
      const config = await this.getClientConfig(userId);
      const ec2 = new EC2Client(config);
      const res = await ec2.send(new DescribeInstancesCommand({}));
      const instances = [];
      res.Reservations?.forEach(r => {
        r.Instances?.forEach(ins => {
          const nameTag = ins.Tags?.find(t => t.Key === 'Name')?.Value;
          instances.push({
            id: ins.InstanceId || 'N/A',
            name: nameTag || 'unnamed',
            type: ins.InstanceType || 'N/A',
            state: ins.State?.Name || 'unknown',
            ip: ins.PublicIpAddress || 'N/A',
            zone: ins.Placement?.AvailabilityZone || 'N/A',
          });
        });
      });
      console.log(`[AwsService] EC2 list successful. Found ${instances.length} instances.`);
      return instances;
    } catch (err: any) {
      console.error('[AwsService] listEc2Instances failed:', err.message);
      return [];
    }
  }

  async listRdsDatabases(userId: string) {
    console.log(`[AwsService] listRdsDatabases called for user: ${userId}`);
    try {
      const config = await this.getClientConfig(userId);
      const rds = new RDSClient(config);
      const res = await rds.send(new DescribeDBInstancesCommand({}));
      const dbs = res.DBInstances?.map(db => ({
        name: db.DBInstanceIdentifier || 'N/A',
        class: db.DBInstanceClass || 'N/A',
        engine: db.Engine || 'N/A',
        version: db.EngineVersion || 'N/A',
        status: db.DBInstanceStatus || 'unknown',
        size: db.AllocatedStorage ? `${db.AllocatedStorage}GB` : 'N/A',
      })) || [];
      console.log(`[AwsService] RDS list successful. Found ${dbs.length} DB instances.`);
      return dbs;
    } catch (err: any) {
      console.error('[AwsService] listRdsDatabases failed:', err.message);
      return [];
    }
  }

  async listLambdaFunctions(userId: string) {
    console.log(`[AwsService] listLambdaFunctions called for user: ${userId}`);
    try {
      const config = await this.getClientConfig(userId);
      const lambda = new LambdaClient(config);
      const res = await lambda.send(new ListFunctionsCommand({}));
      const fns = res.Functions?.map(fn => ({
        name: fn.FunctionName || 'N/A',
        runtime: fn.Runtime || 'N/A',
        handler: fn.Handler || 'N/A',
        lastModified: fn.LastModified || 'N/A',
        codeSize: fn.CodeSize ? `${(fn.CodeSize / 1024 / 1024).toFixed(2)} MB` : 'N/A',
      })) || [];
      console.log(`[AwsService] Lambda list successful. Found ${fns.length} functions.`);
      return fns;
    } catch (err: any) {
      console.error('[AwsService] listLambdaFunctions failed:', err.message);
      return [];
    }
  }

  async listVpcs(userId: string) {
    console.log(`[AwsService] listVpcs called for user: ${userId}`);
    try {
      const config = await this.getClientConfig(userId);
      const ec2 = new EC2Client(config);
      const res = await ec2.send(new DescribeVpcsCommand({}));
      const vpcs = res.Vpcs?.map(vpc => {
        const nameTag = vpc.Tags?.find(t => t.Key === 'Name')?.Value;
        return {
          id: vpc.VpcId || 'N/A',
          cidrBlock: vpc.CidrBlock || 'N/A',
          state: vpc.State || 'unknown',
          name: nameTag || 'unnamed',
        };
      }) || [];
      console.log(`[AwsService] VPC list successful. Found ${vpcs.length} VPCs.`);
      return vpcs;
    } catch (err: any) {
      console.error('[AwsService] listVpcs failed:', err.message);
      return [];
    }
  }

  async listSubnets(userId: string) {
    console.log(`[AwsService] listSubnets called for user: ${userId}`);
    try {
      const config = await this.getClientConfig(userId);
      const ec2 = new EC2Client(config);
      const res = await ec2.send(new DescribeSubnetsCommand({}));
      const subnets = res.Subnets?.map(sub => {
        const nameTag = sub.Tags?.find(t => t.Key === 'Name')?.Value;
        return {
          id: sub.SubnetId || 'N/A',
          vpcId: sub.VpcId || 'N/A',
          cidrBlock: sub.CidrBlock || 'N/A',
          state: sub.State || 'unknown',
          name: nameTag || 'unnamed',
          zone: sub.AvailabilityZone || 'N/A',
        };
      }) || [];
      console.log(`[AwsService] Subnets list successful. Found ${subnets.length} subnets.`);
      return subnets;
    } catch (err: any) {
      console.error('[AwsService] listSubnets failed:', err.message);
      return [];
    }
  }

  async listSecurityGroups(userId: string) {
    console.log(`[AwsService] listSecurityGroups called for user: ${userId}`);
    try {
      const config = await this.getClientConfig(userId);
      const ec2 = new EC2Client(config);
      const res = await ec2.send(new DescribeSecurityGroupsCommand({}));
      const sgs = res.SecurityGroups?.map(sg => ({
        id: sg.GroupId || 'N/A',
        name: sg.GroupName || 'unnamed',
        vpcId: sg.VpcId || 'N/A',
        description: sg.Description || 'N/A',
      })) || [];
      console.log(`[AwsService] Security groups list successful. Found ${sgs.length} groups.`);
      return sgs;
    } catch (err: any) {
      console.error('[AwsService] listSecurityGroups failed:', err.message);
      return [];
    }
  }

  async listIamUsers(userId: string) {
    console.log(`[AwsService] listIamUsers called for user: ${userId}`);
    try {
      const config = await this.getClientConfig(userId);
      const iam = new IAMClient(config);
      const res = await iam.send(new ListUsersCommand({}));
      const users = res.Users?.map(user => ({
        username: user.UserName || 'N/A',
        userId: user.UserId || 'N/A',
        arn: user.Arn || 'N/A',
        createDate: user.CreateDate || 'N/A',
      })) || [];
      console.log(`[AwsService] IAM list successful. Found ${users.length} users.`);
      return users;
    } catch (err: any) {
      console.error('[AwsService] listIamUsers failed:', err.message);
      return [];
    }
  }

  async listCloudWatchAlarms(userId: string) {
    console.log(`[AwsService] listCloudWatchAlarms called for user: ${userId}`);
    try {
      const config = await this.getClientConfig(userId);
      const cw = new CloudWatchClient(config);
      const res = await cw.send(new DescribeAlarmsCommand({}));
      const alarms = res.MetricAlarms?.map(alarm => ({
        name: alarm.AlarmName || 'N/A',
        state: alarm.StateValue || 'unknown',
        metric: alarm.MetricName || 'N/A',
        namespace: alarm.Namespace || 'N/A',
        threshold: alarm.Threshold || 0,
      })) || [];
      console.log(`[AwsService] CloudWatch alarms list successful. Found ${alarms.length} alarms.`);
      return alarms;
    } catch (err: any) {
      console.error('[AwsService] listCloudWatchAlarms failed:', err.message);
      return [];
    }
  }

  async listBillingReports(userId: string) {
    console.log(`[AwsService] listBillingReports called for user: ${userId}`);
    try {
      const config = await this.getClientConfig(userId);
      const ce = new CostExplorerClient({
        ...config,
        region: 'us-east-1', // Cost Explorer is us-east-1 only
      });

      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      const format = (d: Date) => d.toISOString().split('T')[0];

      const res = await ce.send(new GetCostAndUsageCommand({
        TimePeriod: { Start: format(start), End: format(end) },
        Granularity: 'MONTHLY',
        Metrics: ['UnblendedCost'],
      }));

      const results = [];
      res.ResultsByTime?.forEach(r => {
        results.push({
          start: r.TimePeriod?.Start || 'N/A',
          end: r.TimePeriod?.End || 'N/A',
          amount: parseFloat(r.Total?.UnblendedCost?.Amount || '0').toFixed(2),
          unit: r.Total?.UnblendedCost?.Unit || 'USD',
        });
      });
      console.log(`[AwsService] CostExplorer query successful. Found ${results.length} results.`);
      return results;
    } catch (err: any) {
      console.warn('[AwsService] listBillingReports failed (CostExplorer access not enabled or lack permissions):', err.message);
      return [{ start: 'Last 30 Days', end: 'Today', amount: '0.00', unit: 'USD (Simulated Fallback)' }];
    }
  }
}
