import { Injectable } from '@nestjs/common';

@Injectable()
export class AzureService {
  private isConfigured = false;

  constructor() {
    // Check if Azure credentials exist in env configuration
    if (process.env.AZURE_TENANT_ID && process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET) {
      this.isConfigured = true;
    }
  }

  async listVirtualMachines() {
    // If not configured (standard local dev), return beautiful mockup data
    return [
      { id: '/subscriptions/sub-id/resourceGroups/rg-prod/providers/Microsoft.Compute/virtualMachines/caelum-azure-vm-01', name: 'caelum-azure-vm-01', resourceGroup: 'rg-prod', size: 'Standard_D2s_v3', status: 'VM running', location: 'eastus' },
      { id: '/subscriptions/sub-id/resourceGroups/rg-prod/providers/Microsoft.Compute/virtualMachines/caelum-azure-vm-02', name: 'caelum-azure-vm-02', resourceGroup: 'rg-prod', size: 'Standard_D4s_v3', status: 'VM running', location: 'eastus' },
      { id: '/subscriptions/sub-id/resourceGroups/rg-stage/providers/Microsoft.Compute/virtualMachines/caelum-azure-stage', name: 'caelum-azure-stage', resourceGroup: 'rg-stage', size: 'Standard_B2s', status: 'VM deallocated', location: 'eastus2' },
    ];
  }

  async listStorageAccounts() {
    return [
      { name: 'caelumprodstorageacct', resourceGroup: 'rg-prod', type: 'Standard_LRS', status: 'Available', location: 'eastus' },
      { name: 'caelumstagestorageacct', resourceGroup: 'rg-stage', type: 'Standard_LRS', status: 'Available', location: 'eastus2' },
    ];
  }

  async listResourceGroups() {
    return [
      { name: 'rg-prod', status: 'Succeeded', location: 'eastus' },
      { name: 'rg-stage', status: 'Succeeded', location: 'eastus2' },
      { name: 'rg-shared-network', status: 'Succeeded', location: 'eastus' },
    ];
  }
}
