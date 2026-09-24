import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Markdown body of the comment', example: 'Thanks for reporting this! Looking into it now.' })
  @IsString()
  @IsNotEmpty()
  body: string;
}
