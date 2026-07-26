import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ListFilesDto {
  @ApiProperty({ example: '/', description: 'Relative path to list files from', required: false })
  @IsString()
  @IsOptional()
  path?: string;
}

export class ReadFileDto {
  @ApiProperty({ example: 'src/main.ts', description: 'Relative path to file' })
  @IsString()
  @IsNotEmpty()
  path: string;
}

export class WriteFileDto {
  @ApiProperty({ example: 'src/config.txt', description: 'Relative path to destination file' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({ example: 'key=value\nport=8080', description: 'Raw text content to write' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class DeleteFileDto {
  @ApiProperty({ example: 'src/config.txt', description: 'Relative path to file or directory to delete' })
  @IsString()
  @IsNotEmpty()
  path: string;
}

export class MkdirDto {
  @ApiProperty({ example: 'projects/caelum-app', description: 'Relative path to create directory' })
  @IsString()
  @IsNotEmpty()
  path: string;
}

export class MoveFileDto {
  @ApiProperty({ example: 'temp/logs.txt', description: 'Relative path to source file' })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({ example: 'archive/logs.txt', description: 'Relative path to destination file' })
  @IsString()
  @IsNotEmpty()
  destination: string;
}

export class DownloadFileDto {
  @ApiProperty({ example: 'src/main.ts', description: 'Relative path to file for downloading' })
  @IsString()
  @IsNotEmpty()
  path: string;
}
