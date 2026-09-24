import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePullRequestDto {
  @ApiProperty({ description: 'Pull request title', example: 'feat: add dark theme support' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Pull request markdown description', example: 'Implements theme switcher and dark mode tokens', required: false })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiProperty({ description: 'The name of the branch where your changes are implemented', example: 'feature/dark-mode' })
  @IsString()
  @IsNotEmpty()
  head: string;

  @ApiProperty({ description: 'The name of the branch you want the changes pulled into', example: 'main' })
  @IsString()
  @IsNotEmpty()
  base: string;

  @ApiProperty({ description: 'Whether to create this PR as a draft', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  draft?: boolean;
}
