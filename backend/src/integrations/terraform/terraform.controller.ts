import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TerraformService } from './terraform.service';
import { TerraformValidateDto } from '../dto/integrations.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Integrations: Terraform Infrastructure')
@Controller('terraform')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TerraformController {
  constructor(private readonly terraformService: TerraformService) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate Terraform code syntax and dependencies' })
  @ApiResponse({ status: 200, description: 'Code evaluated successfully.' })
  validate(@Body() dto: TerraformValidateDto) {
    return this.terraformService.validate(dto.code);
  }

  @Post('plan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate execution dry-run details (terraform plan)' })
  @ApiResponse({ status: 200, description: 'Plan evaluated successfully.' })
  runPlan(@Body() dto: TerraformValidateDto) {
    return this.terraformService.runPlan(dto.code);
  }
}
