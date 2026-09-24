import { IsString, IsOptional, IsArray, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateIssueDto {
  @ApiProperty({ description: 'Updated issue title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Updated markdown body', required: false })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiProperty({ description: 'State of the issue', enum: ['open', 'closed'], required: false })
  @IsString()
  @IsIn(['open', 'closed'])
  @IsOptional()
  state?: 'open' | 'closed';

  @ApiProperty({ description: 'Labels for the issue', example: ['bug'], required: false })
  @IsArray()
  @IsOptional()
  labels?: string[];

  @ApiProperty({ description: 'Assignees for the issue', example: ['octocat'], required: false })
  @IsArray()
  @IsOptional()
  assignees?: string[];
}
