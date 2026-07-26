import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppsService } from './apps.service';
import { AppActionDto } from './dto/apps.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Application Registry')
@Controller('apps')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get()
  @ApiOperation({ summary: 'List all registered applications in active workspace' })
  @ApiResponse({ status: 200, description: 'Applications listed successfully.' })
  getApps(@GetUser('id') userId: string) {
    return this.appsService.getApps(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific application' })
  @ApiResponse({ status: 200, description: 'Application fetched successfully.' })
  @ApiResponse({ status: 404, description: 'Application not found.' })
  getApp(@GetUser('id') userId: string, @Param('id') appId: string) {
    return this.appsService.getApp(userId, appId);
  }

  @Post('open')
  @ApiOperation({ summary: 'Launch an application in background' })
  @ApiResponse({ status: 200, description: 'Application launched successfully.' })
  openApp(@GetUser('id') userId: string, @Body() dto: AppActionDto) {
    return this.appsService.openApp(userId, dto.appId);
  }

  @Post('close')
  @ApiOperation({ summary: 'Close a running application' })
  @ApiResponse({ status: 200, description: 'Application stopped successfully.' })
  closeApp(@GetUser('id') userId: string, @Body() dto: AppActionDto) {
    return this.appsService.closeApp(userId, dto.appId);
  }

  @Post('install')
  @ApiOperation({ summary: 'Install a new plugin application' })
  @ApiResponse({ status: 200, description: 'Application installed successfully.' })
  installApp(@GetUser('id') userId: string, @Body() dto: AppActionDto) {
    return this.appsService.installApp(userId, dto.appId);
  }

  @Post('uninstall')
  @ApiOperation({ summary: 'Uninstall a plugin application' })
  @ApiResponse({ status: 200, description: 'Application uninstalled successfully.' })
  uninstallApp(@GetUser('id') userId: string, @Body() dto: AppActionDto) {
    return this.appsService.uninstallApp(userId, dto.appId);
  }
}
