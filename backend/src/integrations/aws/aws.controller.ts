import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AwsService } from './aws.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';

@ApiTags('Integrations: AWS Cloud')
@Controller('aws')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Post('connect')
  @ApiOperation({ summary: 'Connect and authenticate a custom user AWS account' })
  @ApiResponse({ status: 200, description: 'Authenticated and saved user credentials successfully.' })
  connect(@GetUser('id') userId: string, @Body() body: any) {
    return this.awsService.connect(userId, body);
  }

  @Post('disconnect')
  @ApiOperation({ summary: 'Disconnect and purge custom user AWS credentials' })
  @ApiResponse({ status: 200, description: 'Credentials purged successfully.' })
  disconnect(@GetUser('id') userId: string) {
    return this.awsService.disconnect(userId);
  }

  @Get('health')
  @ApiOperation({ summary: 'Check active AWS connection status and metadata' })
  @ApiResponse({ status: 200, description: 'Connection status retrieved successfully.' })
  getHealth(@GetUser('id') userId: string) {
    return this.awsService.getHealth(userId);
  }

  @Get('s3')
  @ApiOperation({ summary: 'List all Amazon S3 storage buckets' })
  @ApiResponse({ status: 200, description: 'S3 buckets listed successfully.' })
  listS3Buckets(@GetUser('id') userId: string) {
    return this.awsService.listS3Buckets(userId);
  }

  @Get('ec2')
  @ApiOperation({ summary: 'List virtual EC2 VM server instances' })
  @ApiResponse({ status: 200, description: 'EC2 instances listed successfully.' })
  listEc2Instances(@GetUser('id') userId: string) {
    return this.awsService.listEc2Instances(userId);
  }

  @Get('rds')
  @ApiOperation({ summary: 'List relational RDS database cluster instances' })
  @ApiResponse({ status: 200, description: 'RDS instances listed successfully.' })
  listRdsDatabases(@GetUser('id') userId: string) {
    return this.awsService.listRdsDatabases(userId);
  }

  @Get('lambda')
  @ApiOperation({ summary: 'List AWS Lambda functions' })
  @ApiResponse({ status: 200, description: 'Lambda functions listed successfully.' })
  listLambdaFunctions(@GetUser('id') userId: string) {
    return this.awsService.listLambdaFunctions(userId);
  }

  @Get('vpc')
  @ApiOperation({ summary: 'List AWS VPCs' })
  @ApiResponse({ status: 200, description: 'VPCs listed successfully.' })
  listVpcs(@GetUser('id') userId: string) {
    return this.awsService.listVpcs(userId);
  }

  @Get('subnets')
  @ApiOperation({ summary: 'List AWS VPC Subnets' })
  @ApiResponse({ status: 200, description: 'Subnets listed successfully.' })
  listSubnets(@GetUser('id') userId: string) {
    return this.awsService.listSubnets(userId);
  }

  @Get('security-groups')
  @ApiOperation({ summary: 'List AWS VPC Security Groups' })
  @ApiResponse({ status: 200, description: 'Security groups listed successfully.' })
  listSecurityGroups(@GetUser('id') userId: string) {
    return this.awsService.listSecurityGroups(userId);
  }

  @Get('iam')
  @ApiOperation({ summary: 'List IAM Users' })
  @ApiResponse({ status: 200, description: 'IAM users listed successfully.' })
  listIamUsers(@GetUser('id') userId: string) {
    return this.awsService.listIamUsers(userId);
  }

  @Get('cloudwatch')
  @ApiOperation({ summary: 'List CloudWatch Metric Alarms' })
  @ApiResponse({ status: 200, description: 'Alarms listed successfully.' })
  listCloudWatchAlarms(@GetUser('id') userId: string) {
    return this.awsService.listCloudWatchAlarms(userId);
  }

  @Get('billing')
  @ApiOperation({ summary: 'Get AWS Billing monthly usage details' })
  @ApiResponse({ status: 200, description: 'Billing reports retrieved successfully.' })
  listBillingReports(@GetUser('id') userId: string) {
    return this.awsService.listBillingReports(userId);
  }
}
