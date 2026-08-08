import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AzureService } from './azure.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';

@ApiTags('Integrations: Azure Cloud')
@Controller('azure')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AzureController {
  constructor(private readonly azureService: AzureService) {}

  @Post('connect')
  @ApiOperation({ summary: 'Connect and authenticate a custom user Azure account' })
  @ApiResponse({ status: 200, description: 'Authenticated and saved user credentials successfully.' })
  connect(@GetUser('id') userId: string, @Body() body: any) {
    return this.azureService.connect(userId, body);
  }

  @Post('disconnect')
  @ApiOperation({ summary: 'Disconnect and purge custom user Azure credentials' })
  @ApiResponse({ status: 200, description: 'Credentials purged successfully.' })
  disconnect(@GetUser('id') userId: string) {
    return this.azureService.disconnect(userId);
  }

  @Get('health')
  @ApiOperation({ summary: 'Check active Azure connection status and metadata' })
  @ApiResponse({ status: 200, description: 'Connection status retrieved successfully.' })
  getHealth(@GetUser('id') userId: string) {
    return this.azureService.getHealth(userId);
  }

  @Get('subscription')
  @ApiOperation({ summary: 'Get active Azure Subscription details' })
  @ApiResponse({ status: 200, description: 'Subscription info retrieved successfully.' })
  getSubscription(@GetUser('id') userId: string) {
    return this.azureService.getSubscription(userId);
  }

  @Get('resource-groups')
  @ApiOperation({ summary: 'List Azure Resource Groups' })
  @ApiResponse({ status: 200, description: 'Resource groups listed successfully.' })
  listResourceGroups(@GetUser('id') userId: string) {
    return this.azureService.listResourceGroups(userId);
  }

  @Get('resources') // Legacy mapping support
  listResourceGroupsLegacy(@GetUser('id') userId: string) {
    return this.azureService.listResourceGroups(userId);
  }

  @Get('virtual-machines')
  @ApiOperation({ summary: 'List Azure Virtual Machines' })
  @ApiResponse({ status: 200, description: 'VMs listed successfully.' })
  listVirtualMachines(@GetUser('id') userId: string) {
    return this.azureService.listVirtualMachines(userId);
  }

  @Get('vms') // Legacy mapping support
  listVirtualMachinesLegacy(@GetUser('id') userId: string) {
    return this.azureService.listVirtualMachines(userId);
  }

  @Get('storage-accounts')
  @ApiOperation({ summary: 'List Azure Storage Accounts' })
  @ApiResponse({ status: 200, description: 'Storage accounts listed successfully.' })
  listStorageAccounts(@GetUser('id') userId: string) {
    return this.azureService.listStorageAccounts(userId);
  }

  @Get('storage') // Legacy mapping support
  listStorageAccountsLegacy(@GetUser('id') userId: string) {
    return this.azureService.listStorageAccounts(userId);
  }

  @Get('virtual-networks')
  @ApiOperation({ summary: 'List Azure Virtual Networks' })
  @ApiResponse({ status: 200, description: 'VNETs listed successfully.' })
  listVirtualNetworks(@GetUser('id') userId: string) {
    return this.azureService.listVirtualNetworks(userId);
  }

  @Get('network-security-groups')
  @ApiOperation({ summary: 'List Azure Network Security Groups' })
  @ApiResponse({ status: 200, description: 'NSGs listed successfully.' })
  listNetworkSecurityGroups(@GetUser('id') userId: string) {
    return this.azureService.listNetworkSecurityGroups(userId);
  }

  @Get('public-ips')
  @ApiOperation({ summary: 'List Azure Public IPs' })
  @ApiResponse({ status: 200, description: 'Public IPs listed successfully.' })
  listPublicIps(@GetUser('id') userId: string) {
    return this.azureService.listPublicIps(userId);
  }

  @Get('app-services')
  @ApiOperation({ summary: 'List Azure App Services' })
  @ApiResponse({ status: 200, description: 'App Services listed successfully.' })
  listAppServices(@GetUser('id') userId: string) {
    return this.azureService.listAppServices(userId);
  }

  @Get('sql-databases')
  @ApiOperation({ summary: 'List Azure SQL Databases' })
  @ApiResponse({ status: 200, description: 'SQL Databases listed successfully.' })
  listSqlDatabases(@GetUser('id') userId: string) {
    return this.azureService.listSqlDatabases(userId);
  }

  @Get('key-vaults')
  @ApiOperation({ summary: 'List Azure Key Vaults' })
  @ApiResponse({ status: 200, description: 'Key Vaults listed successfully.' })
  listKeyVaults(@GetUser('id') userId: string) {
    return this.azureService.listKeyVaults(userId);
  }

  @Get('container-registries')
  @ApiOperation({ summary: 'List Azure Container Registries' })
  @ApiResponse({ status: 200, description: 'Container Registries listed successfully.' })
  listContainerRegistries(@GetUser('id') userId: string) {
    return this.azureService.listContainerRegistries(userId);
  }
}
