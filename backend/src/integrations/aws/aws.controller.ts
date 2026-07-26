import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AwsService } from './aws.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Integrations: AWS Cloud')
@Controller('aws')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Get('s3')
  @ApiOperation({ summary: 'List all Amazon S3 storage buckets' })
  @ApiResponse({ status: 200, description: 'S3 buckets listed successfully.' })
  listS3Buckets() {
    return this.awsService.listS3Buckets();
  }

  @Get('ec2')
  @ApiOperation({ summary: 'List virtual EC2 VM server instances' })
  @ApiResponse({ status: 200, description: 'EC2 instances listed successfully.' })
  listEc2Instances() {
    return this.awsService.listEc2Instances();
  }

  @Get('rds')
  @ApiOperation({ summary: 'List relational RDS database cluster instances' })
  @ApiResponse({ status: 200, description: 'RDS instances listed successfully.' })
  listRdsDatabases() {
    return this.awsService.listRdsDatabases();
  }
}
