import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ListFilesDto {
  @ApiProperty({ example: '/', description: 'Relative path to list files from', required: false })
  @IsString()
  @IsOptional()
  path?: string;
}

export class ReadFileDto {
  @ApiProperty({ example: 'Documents/welcome.txt', description: 'Relative path to file' })
  @IsString()
  @IsNotEmpty()
  path: string;
}

export class WriteFileDto {
  @ApiProperty({ example: 'Documents/notes.txt', description: 'Relative path to destination file' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({ example: 'key=value\nport=8080', description: 'Raw text content to write' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class DeleteFileDto {
  @ApiProperty({ example: 'Documents/notes.txt', description: 'Relative path to file or directory to delete' })
  @IsString()
  @IsNotEmpty()
  path: string;
}

export class MkdirDto {
  @ApiProperty({ example: 'Projects/new-app', description: 'Relative path to create directory' })
  @IsString()
  @IsNotEmpty()
  path: string;
}

export class MoveFileDto {
  @ApiProperty({ example: 'Documents/old-name.txt', description: 'Relative path to source file' })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({ example: 'Documents/new-name.txt', description: 'Relative path to destination file' })
  @IsString()
  @IsNotEmpty()
  destination: string;
}

export class CopyFileDto {
  @ApiProperty({ example: 'Documents/template.txt', description: 'Relative path to source file or directory' })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({ example: 'Documents/copy-of-template.txt', description: 'Relative path to destination' })
  @IsString()
  @IsNotEmpty()
  destination: string;
}

export class DownloadFileDto {
  @ApiProperty({ example: 'Documents/welcome.txt', description: 'Relative path to file for downloading' })
  @IsString()
  @IsNotEmpty()
  path: string;
}

export class SearchFilesDto {
  @ApiProperty({ example: 'welcome', description: 'Search term to find matching files or folders' })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({ example: '/', description: 'Starting directory for search (optional)', required: false })
  @IsString()
  @IsOptional()
  path?: string;
}
