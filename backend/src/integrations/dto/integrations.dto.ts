import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TerraformValidateDto {
  @ApiProperty({ 
    example: 'provider "aws" {\n  region = "us-east-1"\n}\nresource "aws_vpc" "main" {\n  cidr_block = "10.0.0.0/16"\n}', 
    description: 'Raw Terraform configuration code code content' 
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class ContainerActionDto {
  @ApiProperty({ example: 'start', description: 'Action to perform on container: start, stop, restart, remove' })
  @IsString()
  @IsNotEmpty()
  action: 'start' | 'stop' | 'restart' | 'remove';
}

export class TerraformActionDto {
  @ApiProperty({ example: 'init', description: 'Terraform action: init, validate, fmt, plan, apply, destroy' })
  @IsString()
  @IsNotEmpty()
  action: 'init' | 'validate' | 'fmt' | 'plan' | 'apply' | 'destroy';

  @ApiProperty({ example: 'provider "aws" {}', description: 'Terraform configuration content' })
  @IsString()
  @IsNotEmpty()
  code: string;
}
