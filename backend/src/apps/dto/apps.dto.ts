import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AppActionDto {
  @ApiProperty({ example: 'docker', description: 'Unique identifier of the targeted application' })
  @IsString()
  @IsNotEmpty()
  appId: string;
}
