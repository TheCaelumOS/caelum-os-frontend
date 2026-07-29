import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AzureService } from './azure.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Integrations: Azure Cloud')
@Controller('azure')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AzureController {
  constructor(private readonly azureService: AzureService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check Azure connection status and resources metadata' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully.' })
  getHealth() {
    return this.azureService.getHealth();
  }

  @Get('subscription')
  @ApiOperation({ summary: 'Get active Azure Subscription details' })
  @ApiResponse({ status: 200, description: 'Subscription info retrieved successfully.' })
  getSubscription() {
    return this.azureService.getSubscription();
  }

  @Get('resource-groups')
  @ApiOperation({ summary: 'List Azure Resource Groups' })
  @ApiResponse({ status: 200, description: 'Resource groups listed successfully.' })
  listResourceGroups() {
    return this.azureService.listResourceGroups();
  }

  @Get('resources') // Legacy mapping support
  listResourceGroupsLegacy() {
    return this.azureService.listResourceGroups();
  }

  @Get('virtual-machines')
  @ApiOperation({ summary: 'List Azure Virtual Machines' })
  @ApiResponse({ status: 200, description: 'VMs listed successfully.' })
  listVirtualMachines() {
    return this.azureService.listVirtualMachines();
  }

  @Get('vms') // Legacy mapping support
  listVirtualMachinesLegacy() {
    return this.azureService.listVirtualMachines();
  }

  @Get('storage-accounts')
  @ApiOperation({ summary: 'List Azure Storage Accounts' })
  @ApiResponse({ status: 200, description: 'Storage accounts listed successfully.' })
  listStorageAccounts() {
    return this.azureService.listStorageAccounts();
  }

  @Get('storage') // Legacy mapping support
  listStorageAccountsLegacy() {
    return this.azureService.listStorageAccounts();
  }

  @Get('virtual-networks')
  @ApiOperation({ summary: 'List Azure Virtual Networks' })
  @ApiResponse({ status: 200, description: 'VNETs listed successfully.' })
  listVirtualNetworks() {
    return this.azureService.listVirtualNetworks();
  }

  @Get('network-security-groups')
  @ApiOperation({ summary: 'List Azure Network Security Groups' })
  @ApiResponse({ status: 200, description: 'NSGs listed successfully.' })
  listNetworkSecurityGroups() {
    return this.azureService.listNetworkSecurityGroups();
  }

  @Get('public-ips')
  @ApiOperation({ summary: 'List Azure Public IPs' })
  @ApiResponse({ status: 200, description: 'Public IPs listed successfully.' })
  listPublicIps() {
    return this.azureService.listPublicIps();
  }

  @Get('app-services')
  @ApiOperation({ summary: 'List Azure App Services' })
  @ApiResponse({ status: 200, description: 'App Services listed successfully.' })
  listAppServices() {
    return this.azureService.listAppServices();
  }

  @Get('sql-databases')
  @ApiOperation({ summary: 'List Azure SQL Databases' })
  @ApiResponse({ status: 200, description: 'SQL Databases listed successfully.' })
  listSqlDatabases() {
    return this.azureService.listSqlDatabases();
  }

  @Get('key-vaults')
  @ApiOperation({ summary: 'List Azure Key Vaults' })
  @ApiResponse({ status: 200, description: 'Key Vaults listed successfully.' })
  listKeyVaults() {
    return this.azureService.listKeyVaults();
  }

  @Get('container-registries')
  @ApiOperation({ summary: 'List Azure Container Registries' })
  @ApiResponse({ status: 200, description: 'Container Registries listed successfully.' })
  listContainerRegistries() {
    return this.azureService.listContainerRegistries();
  }
}
