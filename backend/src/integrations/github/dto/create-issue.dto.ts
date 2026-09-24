import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIssueDto {
  @ApiProperty({ description: 'Issue title', example: 'Bug: navigation bar overlaps in mobile view' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Markdown body of the issue', example: 'Steps to reproduce...', required: false })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiProperty({ description: 'Labels to apply to the issue', example: ['bug', 'ui'], required: false })
  @IsArray()
  @IsOptional()
  labels?: string[];

  @ApiProperty({ description: 'Usernames to assign to the issue', example: ['octocat'], required: false })
  @IsArray()
  @IsOptional()
  assignees?: string[];
}
