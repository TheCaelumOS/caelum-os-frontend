import { IsObject, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDashboardDto {
  @ApiProperty({
    description: 'Complete Grafana dashboard JSON schema model',
  })
  @IsObject()
  dashboard: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Unique ID of the parent folder in Grafana',
  })
  @IsOptional()
  @IsString()
  folderUid?: string;

  @ApiPropertyOptional({
    description: 'Commit or change message for dashboard revision history',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    description: 'Whether to overwrite an existing dashboard with the same title or UID',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  overwrite?: boolean;
}
