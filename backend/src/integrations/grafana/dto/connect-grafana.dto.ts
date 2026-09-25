import { IsString, IsNotEmpty, IsEnum, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConnectGrafanaDto {
  @ApiProperty({
    example: 'http://localhost:3000',
    description: 'The base URL of the Grafana instance',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^https?:\/\/.+/, {
    message: 'URL must start with http:// or https://',
  })
  url: string;

  @ApiProperty({
    enum: ['token', 'basic', 'anonymous'],
    default: 'token',
    description: 'Authentication type for Grafana instance',
  })
  @IsEnum(['token', 'basic', 'anonymous'])
  authType: 'token' | 'basic' | 'anonymous';

  @ApiPropertyOptional({
    description: 'Grafana Service Account Token or API Key',
  })
  @IsOptional()
  @IsString()
  token?: string;

  @ApiPropertyOptional({
    description: 'Basic Auth username (if using basic authentication)',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Basic Auth password (if using basic authentication)',
  })
  @IsOptional()
  @IsString()
  password?: string;
}
