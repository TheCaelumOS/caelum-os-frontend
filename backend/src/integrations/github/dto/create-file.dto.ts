import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFileDto {
  @ApiProperty({ description: 'Relative path of the file in the repository', example: 'docs/architecture.md' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({ description: 'Text content of the file', example: '# Architecture Documentation' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Branch to commit to', example: 'main', required: false })
  @IsString()
  @IsOptional()
  branch?: string;

  @ApiProperty({ description: 'Git commit message', example: 'docs: add architecture overview' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
