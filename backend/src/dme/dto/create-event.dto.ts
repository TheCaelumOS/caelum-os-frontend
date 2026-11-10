import { IsNotEmpty, IsString, IsIn, IsOptional, IsObject } from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['docker', 'kubernetes', 'git', 'terraform', 'jenkins', 'system', 'correlation'])
  source: string;

  @IsNotEmpty()
  @IsString()
  eventType: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['critical', 'high', 'medium', 'low', 'info'])
  severity: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
