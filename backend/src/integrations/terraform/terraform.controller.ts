import { Controller, Get, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TerraformService } from './terraform.service';
import { TerraformValidateDto, TerraformActionDto } from '../dto/integrations.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Integrations: Terraform Infrastructure')
@Controller('terraform')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TerraformController {
  constructor(private readonly terraformService: TerraformService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get Terraform CLI installation state, version, and workspace info' })
  @ApiResponse({ status: 200, description: 'Terraform status metadata fetched successfully.' })
  getStatus() {
    return this.terraformService.getStatus();
  }

  @Post('action')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute a specific Terraform CLI action (init, validate, fmt, plan, apply, destroy)' })
  @ApiResponse({ status: 200, description: 'Terraform action execution successfully finished.' })
  runAction(@Body() dto: TerraformActionDto) {
    return this.terraformService.runAction(dto.action, dto.code);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate Terraform code syntax and dependencies (Legacy)' })
  @ApiResponse({ status: 200, description: 'Code evaluated successfully.' })
  validate(@Body() dto: TerraformValidateDto) {
    return this.terraformService.validate(dto.code);
  }

  @Post('plan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate execution dry-run details (Legacy)' })
  @ApiResponse({ status: 200, description: 'Plan evaluated successfully.' })
  runPlan(@Body() dto: TerraformValidateDto) {
    return this.terraformService.runPlan(dto.code);
  }
}
