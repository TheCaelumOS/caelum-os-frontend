import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConnectJenkinsDto {
  @ApiProperty({
    example: 'http://localhost:8080',
    description: 'The base URL of the Jenkins server',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^https?:\/\/.+/, {
    message: 'Jenkins URL must start with http:// or https://',
  })
  url: string;

  @ApiProperty({
    example: 'admin',
    description: 'Jenkins username',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: '11xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    description: 'Jenkins user API token (generated from Jenkins user profile)',
  })
  @IsString()
  @IsNotEmpty()
  apiToken: string;

  @ApiPropertyOptional({
    example: 'Production CI',
    description: 'Optional friendly name for this Jenkins connection',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
