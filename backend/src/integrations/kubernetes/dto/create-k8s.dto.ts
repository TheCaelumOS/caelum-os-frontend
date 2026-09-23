import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScaleDeploymentDto {
  @ApiProperty({ description: 'Target replica count', example: 2 })
  @IsInt()
  @Min(0)
  @Max(100)
  replicas!: number;
}

export class CreateDeploymentDto {
  @ApiProperty({ description: 'Deployment name', example: 'nginx-app' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Target namespace', example: 'default' })
  @IsString()
  @IsNotEmpty()
  namespace!: string;

  @ApiProperty({ description: 'Container image', example: 'nginx:alpine' })
  @IsString()
  @IsNotEmpty()
  image!: string;

  @ApiPropertyOptional({ description: 'Desired replicas', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  replicas?: number = 1;

  @ApiPropertyOptional({ description: 'Container port', example: 80 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  port?: number;
}

export class CreateServiceDto {
  @ApiProperty({ description: 'Service name', example: 'nginx-service' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Target namespace', example: 'default' })
  @IsString()
  @IsNotEmpty()
  namespace!: string;

  @ApiPropertyOptional({ description: 'Service type', default: 'ClusterIP', enum: ['ClusterIP', 'NodePort', 'LoadBalancer'] })
  @IsOptional()
  @IsString()
  type?: string = 'ClusterIP';

  @ApiProperty({ description: 'Service exposed port', example: 80 })
  @IsInt()
  @Min(1)
  @Max(65535)
  port!: number;

  @ApiPropertyOptional({ description: 'Target pod port', example: 80 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  targetPort?: number;

  @ApiProperty({ description: 'Pod selector label app value', example: 'nginx-app' })
  @IsString()
  @IsNotEmpty()
  selectorApp!: string;
}
