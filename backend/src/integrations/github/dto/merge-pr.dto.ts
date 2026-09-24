import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MergePullRequestDto {
  @ApiProperty({
    description: 'Merge method to use',
    enum: ['merge', 'squash', 'rebase'],
    default: 'merge',
    required: false,
  })
  @IsString()
  @IsIn(['merge', 'squash', 'rebase'])
  @IsOptional()
  mergeMethod?: 'merge' | 'squash' | 'rebase';

  @ApiProperty({ description: 'Title for the automatic commit message', required: false })
  @IsString()
  @IsOptional()
  commitTitle?: string;

  @ApiProperty({ description: 'Extra detail for the commit message', required: false })
  @IsString()
  @IsOptional()
  commitMessage?: string;
}
