import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ example: 'Bash Session', description: 'Friendly name of the terminal session' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'powershell.exe', description: 'Command to spawn shell', required: false })
  @IsString()
  @IsOptional()
  shell?: string;
}
