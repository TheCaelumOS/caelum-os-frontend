import { IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TriggerBuildDto {
  @ApiPropertyOptional({
    example: { BRANCH: 'main', ENVIRONMENT: 'production' },
    description: 'Key-value map of build parameters for parameterized builds',
  })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;
}
