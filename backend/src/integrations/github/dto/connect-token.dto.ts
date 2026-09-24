import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConnectTokenDto {
  @ApiProperty({ description: 'GitHub Personal Access Token or OAuth Token', example: 'ghp_...' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
