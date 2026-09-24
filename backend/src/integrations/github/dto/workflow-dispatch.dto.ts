import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WorkflowDispatchDto {
  @ApiProperty({ description: 'The git reference (branch or tag name) for the workflow run', example: 'main' })
  @IsString()
  @IsNotEmpty()
  ref: string;

  @ApiProperty({ description: 'Input keys and values configured in the workflow file', required: false })
  @IsObject()
  @IsOptional()
  inputs?: Record<string, any>;
}
