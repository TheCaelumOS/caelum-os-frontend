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

  @Get('vms')
  @ApiOperation({ summary: 'List Azure Virtual Machines' })
  @ApiResponse({ status: 200, description: 'VMs listed successfully.' })
  listVirtualMachines() {
    return this.azureService.listVirtualMachines();
  }

  @Get('storage')
  @ApiOperation({ summary: 'List Blob storage account profiles' })
  @ApiResponse({ status: 200, description: 'Storage accounts listed successfully.' })
  listStorageAccounts() {
    return this.azureService.listStorageAccounts();
  }

  @Get('resources')
  @ApiOperation({ summary: 'List active resource group brackets' })
  @ApiResponse({ status: 200, description: 'Resource groups listed successfully.' })
  listResourceGroups() {
    return this.azureService.listResourceGroups();
  }
}
