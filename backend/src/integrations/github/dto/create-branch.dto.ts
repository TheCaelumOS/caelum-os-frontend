import { IsNotEmpty, IsString, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ description: 'Name of the new branch to create', example: 'feature/dark-mode' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_\-\.\/]+$/, {
    message: 'Branch name must only contain alphanumeric characters, hyphens, underscores, dots, and slashes',
  })
  name: string;

  @ApiProperty({ description: 'Source branch to branch from', example: 'main', required: false })
  @IsString()
  @IsOptional()
  fromBranch?: string;
}
