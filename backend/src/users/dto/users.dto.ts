import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePreferencesDto {
  @ApiProperty({ example: 'dark', description: 'System UI theme selection', required: false })
  @IsString()
  @IsOptional()
  theme?: string;

  @ApiProperty({ example: 'purple_gradient.png', description: 'Desktop wallpaper selection', required: false })
  @IsString()
  @IsOptional()
  wallpaper?: string;

  @ApiProperty({ example: 80, description: 'Speaker audio volume level (0-100)', required: false })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  volume?: number;

  @ApiProperty({ example: 90, description: 'Display panel brightness percentage (0-100)', required: false })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  brightness?: number;
}
