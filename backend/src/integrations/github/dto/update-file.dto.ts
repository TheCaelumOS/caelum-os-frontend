import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFileDto {
  @ApiProperty({ description: 'Relative path of the file in the repository', example: 'src/config.ts' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({ description: 'Updated text content of the file' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Branch to commit to', example: 'main', required: false })
  @IsString()
  @IsOptional()
  branch?: string;

  @ApiProperty({ description: 'Git commit message', example: 'fix: update default timeout configuration' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: 'Current blob SHA of the file to prevent overwrite conflicts', example: '763c37b884f3d8194bde1421e1a0f89729be54ff' })
  @IsString()
  @IsNotEmpty()
  sha: string;
}
