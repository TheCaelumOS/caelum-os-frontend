import { IsOptional, IsString, IsArray } from 'class-validator';

export class RunValidationDto {
  @IsOptional()
  @IsString()
  triggeredBy?: string = 'manual';

  @IsOptional()
  @IsArray()
  targets?: string[]; // e.g. ['docker', 'kubernetes', 'jenkins', 'git', 'terraform']
}
