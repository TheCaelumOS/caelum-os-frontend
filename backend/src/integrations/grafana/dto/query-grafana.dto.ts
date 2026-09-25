import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GrafanaQueryTarget } from '../grafana.types';

export class QueryGrafanaDto {
  @ApiProperty({
    description: 'Array of target query definitions according to Grafana /api/ds/query specifications',
  })
  @IsArray()
  queries: GrafanaQueryTarget[];

  @ApiPropertyOptional({
    description: 'Start time filter for query interval (e.g. now-1h or epoch ms)',
    example: 'now-1h',
  })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({
    description: 'End time filter for query interval (e.g. now or epoch ms)',
    example: 'now',
  })
  @IsOptional()
  @IsString()
  to?: string;
}
