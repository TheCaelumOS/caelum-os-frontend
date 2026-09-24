import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteFileDto {
  @ApiProperty({ description: 'Relative path of the file to delete', example: 'temp.txt' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({ description: 'Branch from which to delete file', example: 'main', required: false })
  @IsString()
  @IsOptional()
  branch?: string;

  @ApiProperty({ description: 'Current blob SHA of the file', example: '763c37b884f3d8194bde1421e1a0f89729be54ff' })
  @IsString()
  @IsNotEmpty()
  sha: string;

  @ApiProperty({ description: 'Git commit message explaining file deletion', example: 'chore: remove obsolete config file' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
