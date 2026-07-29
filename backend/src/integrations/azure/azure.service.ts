import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DefaultAzureCredential, ClientSecretCredential } from '@azure/identity';
import { ResourceManagementClient } from '@azure/arm-resources';
import { ComputeManagementClient } from '@azure/arm-compute';
import { StorageManagementClient } from '@azure/arm-storage';
import { NetworkManagementClient } from '@azure/arm-network';
import { WebSiteManagementClient } from '@azure/arm-appservice';
import { SqlManagementClient } from '@azure/arm-sql';
import { KeyVaultManagementClient } from '@azure/arm-keyvault';
import { ContainerRegistryManagementClient } from '@azure/arm-containerregistry';

@Injectable()
export class AzureService {
  private getCredential() {
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const tenantId = process.env.AZURE_TENANT_ID;

    if (clientId && clientSecret && tenantId) {
      return new ClientSecretCredential(tenantId, clientId, clientSecret);
    }
    return new DefaultAzureCredential();
  }

  private getCredentialType(): string {
    return process.env.AZURE_CLIENT_ID ? 'ClientSecretCredential' : 'DefaultAzureCredential';
  }

  private async getSubscriptionIdAuto(credential: any): Promise<string> {
    if (process.env.AZURE_SUBSCRIPTION_ID) {
      return process.env.AZURE_SUBSCRIPTION_ID;
    }

    try {
      const tokenRes = await credential.getToken('https://management.azure.com/.default');
      const response = await fetch(
        'https://management.azure.com/subscriptions?api-version=2020-01-01',
        {
          headers: {
            Authorization: `Bearer ${tokenRes.token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Subscriptions list error: ${response.statusText}`);
      }
      const data: any = await response.json();
      if (data.value && data.value.length > 0) {
        return data.value[0].subscriptionId;
      }
      throw new Error('No subscriptions found in this Azure account.');
    } catch (err: any) {
      throw new HttpException(
        `Azure Subscription ID is missing and auto-discovery failed: ${err.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private async getSubscriptionName(credential: any, subId: string): Promise<string> {
    try {
      const tokenRes = await credential.getToken('https://management.azure.com/.default');
      const response = await fetch(
        `https://management.azure.com/subscriptions/${subId}?api-version=2020-01-01`,
        {
          headers: {
            Authorization: `Bearer ${tokenRes.token}`,
          },
        }
      );
      if (!response.ok) return 'Unknown';
      const data: any = await response.json();
      return data.displayName || 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  async getHealth() {
    try {
      const credential = this.getCredential();
      const subId = await this.getSubscriptionIdAuto(credential);
      const subName = await this.getSubscriptionName(credential, subId);

      // Fetch basic counts to verify complete SDK connectivity
      const rgClient = new ResourceManagementClient(credential, subId);
      let rgCount = 0;
      for await (const rg of rgClient.resourceGroups.list()) {
        rgCount++;
      }

      const vmClient = new ComputeManagementClient(credential, subId);
      let vmCount = 0;
      for await (const vm of vmClient.virtualMachines.listAll()) {
        vmCount++;
      }

      const storageClient = new StorageManagementClient(credential, subId);
      let storageCount = 0;
      for await (const acct of storageClient.storageAccounts.list()) {
        storageCount++;
      }

      return {
        connected: true,
        credential: this.getCredentialType(),
        subscriptionId: subId,
        subscriptionName: subName,
        resourceGroups: rgCount,
        virtualMachines: vmCount,
        storageAccounts: storageCount,
      };
    } catch (e: any) {
      console.warn('[AzureService] Health check failed:', e.message);
      return {
        connected: false,
        credential: this.getCredentialType(),
        error: e.message,
      };
    }
  }

  async getSubscription() {
    try {
      const credential = this.getCredential();
      const subId = await this.getSubscriptionIdAuto(credential);
      const subName = await this.getSubscriptionName(credential, subId);
      const tokenRes = await credential.getToken('https://management.azure.com/.default');
      const response = await fetch(
        `https://management.azure.com/subscriptions/${subId}?api-version=2020-01-01`,
        {
          headers: {
            Authorization: `Bearer ${tokenRes.token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Azure API error: ${response.statusText}`);
      }
      const data: any = await response.json();

      console.log(`GET /azure/subscription`);
      console.log(`  Credential: ${this.getCredentialType()}`);
      console.log(`  Subscription ID: ${subId}`);
      console.log(`  Subscription Name: ${subName}`);
      console.log(`  Status: Connected`);

      return {
        subscriptionId: data.subscriptionId,
        displayName: data.displayName,
        state: data.state,
      };
    } catch (e: any) {
      console.error('[AzureService] Failed to fetch subscription details:', e);
      throw new HttpException(
        `Failed to fetch subscription: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async listResourceGroups() {
    try {
      const credential = this.getCredential();
      const subId = await this.getSubscriptionIdAuto(credential);
      const subName = await this.getSubscriptionName(credential, subId);
      const client = new ResourceManagementClient(credential, subId);
      const rgs = [];
      for await (const rg of client.resourceGroups.list()) {
        rgs.push({
          name: rg.name,
          location: rg.location,
          status: rg.properties?.provisioningState || 'Succeeded',
        });
      }

      console.log(`GET /azure/resource-groups`);
      console.log(`  Credential: ${this.getCredentialType()}`);
      console.log(`  Subscription ID: ${subId}`);
      console.log(`  Subscription Name: ${subName}`);
      console.log(`  Resource Groups Count: ${rgs.length}`);

      return rgs;
    } catch (e: any) {
      console.error('[AzureService] Failed to fetch Resource Groups:', e);
      throw new HttpException(
        `Failed to list Resource Groups: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async listVirtualMachines() {
    try {
      const credential = this.getCredential();
      const subId = await this.getSubscriptionIdAuto(credential);
      const subName = await this.getSubscriptionName(credential, subId);
      const client = new ComputeManagementClient(credential, subId);
      const vms = [];
      for await (const vm of client.virtualMachines.listAll()) {
        const rgMatch = vm.id?.match(/resourceGroups\/([^\/]+)/i);
        const rgName = rgMatch ? rgMatch[1] : '';
        vms.push({
          id: vm.id,
          name: vm.name,
          resourceGroup: rgName,
          size: vm.hardwareProfile?.vmSize,
          status: vm.provisioningState,
          location: vm.location,
        });
      }

      console.log(`GET /azure/virtual-machines`);
      console.log(`  Credential: ${this.getCredentialType()}`);
      console.log(`  Subscription ID: ${subId}`);
      console.log(`  Subscription Name: ${subName}`);
      console.log(`  VM Count: ${vms.length}`);

      return vms;
    } catch (e: any) {
      console.error('[AzureService] Failed to fetch Virtual Machines:', e);
      throw new HttpException(
        `Failed to list Virtual Machines: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async listStorageAccounts() {
    try {
      const credential = this.getCredential();
      const subId = await this.getSubscriptionIdAuto(credential);
      const subName = await this.getSubscriptionName(credential, subId);
      const client = new StorageManagementClient(credential, subId);
      const accts = [];
      for await (const acct of client.storageAccounts.list()) {
        const rgMatch = acct.id?.match(/resourceGroups\/([^\/]+)/i);
        const rgName = rgMatch ? rgMatch[1] : '';
        accts.push({
          name: acct.name,
          resourceGroup: rgName,
          type: acct.sku?.name,
          status: acct.provisioningState,
          location: acct.location,
        });
      }

      console.log(`GET /azure/storage-accounts`);
      console.log(`  Credential: ${this.getCredentialType()}`);
      console.log(`  Subscription ID: ${subId}`);
      console.log(`  Subscription Name: ${subName}`);
      console.log(`  Storage Accounts Count: ${accts.length}`);

      return accts;
    } catch (e: any) {
      console.error('[AzureService] Failed to fetch Storage Accounts:', e);
      throw new HttpException(
        `Failed to list Storage Accounts: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async listVirtualNetworks() {
    try {
      const credential = this.getCredential();
      const subId = await this.getSubscriptionIdAuto(credential);
      const subName = await this.getSubscriptionName(credential, subId);
      const client = new NetworkManagementClient(credential, subId);
      const vnets = [];
      for await (const vnet of client.virtualNetworks.listAll()) {
        const rgMatch = vnet.id?.match(/resourceGroups\/([^\/]+)/i);
        const rgName = rgMatch ? rgMatch[1] : '';
        vnets.push({
          name: vnet.name,
          resourceGroup: rgName,
          addressSpace: vnet.addressSpace?.addressPrefixes?.join(', ') || 'N/A',
          status: vnet.provisioningState,
          location: vnet.location,
        });
      }

      console.log(`GET /azure/virtual-networks`);
      console.log(`  Credential: ${this.getCredentialType()}`);
      console.log(`  Subscription ID: ${subId}`);
      console.log(`  Subscription Name: ${subName}`);
      console.log(`  VNet Count: ${vnets.length}`);

      return vnets;
    } catch (e: any) {
      console.error('[AzureService] Failed to fetch Virtual Networks:', e);
      throw new HttpException(
        `Failed to list Virtual Networks: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async listNetworkSecurityGroups() {
    try {
      const credential = this.getCredential();
      const subId = await this.getSubscriptionIdAuto(credential);
      const subName = await this.getSubscriptionName(credential, subId);
      const client = new NetworkManagementClient(credential, subId);
      const nsgs = [];
      for await (const nsg of client.networkSecurityGroups.listAll()) {
        const rgMatch = nsg.id?.match(/resourceGroups\/([^\/]+)/i);
        const rgName = rgMatch ? rgMatch[1] : '';
        nsgs.push({
          name: nsg.name,
          resourceGroup: rgName,
          status: nsg.provisioningState,
          location: nsg.location,
        });
      }

      console.log(`GET /azure/network-security-groups`);
      console.log(`  Credential: ${this.getCredentialType()}`);
      console.log(`  Subscription ID: ${subId}`);
      console.log(`  Subscription Name: ${subName}`);
      console.log(`  NSG Count: ${nsgs.length}`);

      return nsgs;
    } catch (e: any) {
      console.error('[AzureService] Failed to fetch Network Security Groups:', e);
      throw new HttpException(
        `Failed to list Network Security Groups: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async listPublicIps() {
    try {
      const credential = this.getCredential();
      const subId = await this.getSubscriptionIdAuto(credential);
      const subName = await this.getSubscriptionName(credential, subId);
      const client = new NetworkManagementClient(credential, subId);
      const ips = [];
      for await (const ip of client.publicIPAddresses.listAll()) {
        const rgMatch = ip.id?.match(/resourceGroups\/([^\/]+)/i);
        const rgName = rgMatch ? rgMatch[1] : '';
        ips.push({
          name: ip.name,
          resourceGroup: rgName,
          ipAddress: ip.ipAddress || 'Dynamic',
          status: ip.provisioningState,
          location: ip.location,
        });
      }

      console.log(`GET /azure/public-ips`);
      console.log(`  Credential: ${this.getCredentialType()}`);
      console.log(`  Subscription ID: ${subId}`);
      console.log(`  Subscription Name: ${subName}`);
      console.log(`  Public IP Count: ${ips.length}`);

      return ips;
    } catch (e: any) {
      console.error('[AzureService] Failed to fetch Public IPs:', e);
      throw new HttpException(
        `Failed to list Public IPs: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async listAppServices() {
    try {
      const credential = this.getCredential();
      const subId = await this.getSubscriptionIdAuto(credential);
      const subName = await this.getSubscriptionName(credential, subId);
      const client = new WebSiteManagementClient(credential, subId);
      const apps = [];
      for await (const site of client.webApps.list()) {
        const rgMatch = site.id?.match(/resourceGroups\/([^\/]+)/i);
        const rgName = rgMatch ? rgMatch[1] : '';
        apps.push({
          name: site.name,
          resourceGroup: rgName,
          state: site.state,
          defaultHostName: site.defaultHostName,
          location: site.location,
        });
      }

      console.log(`GET /azure/app-services`);
      console.log(`  Credential: ${this.getCredentialType()}`);
      console.log(`  Subscription ID: ${subId}`);
      console.log(`  Subscription Name: ${subName}`);
      console.log(`  App Services Count: ${apps.length}`);

      return apps;
    } catch (e: any) {
      console.error('[AzureService] Failed to fetch App Services:', e);
      throw new HttpException(
        `Failed to list App Services: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async listSqlDatabases() {
    try {
      const credential = this.getCredential();
      const subId = await this.getSubscriptionIdAuto(credential);
      const subName = await this.getSubscriptionName(credential, subId);
      const client = new SqlManagementClient(credential, subId);
      const dbs = [];
      for await (const server of client.servers.list()) {
        const rgMatch = server.id?.match(/resourceGroups\/([^\/]+)/i);
        const rgName = rgMatch ? rgMatch[1] : '';
        try {
          for await (const db of client.databases.listByServer(rgName, server.name!)) {
            dbs.push({
              name: db.name,
              serverName: server.name,
              resourceGroup: rgName,
              status: db.status,
              location: db.location,
            });
          }
        } catch (dbErr) {
          dbs.push({
            name: 'Master/System',
            serverName: server.name,
            resourceGroup: rgName,
            status: 'Online',
            location: server.location,
          });
        }
      }

      console.log(`GET /azure/sql-databases`);
      console.log(`  Credential: ${this.getCredentialType()}`);
      console.log(`  Subscription ID: ${subId}`);
      console.log(`  Subscription Name: ${subName}`);
      console.log(`  SQL Databases Count: ${dbs.length}`);

      return dbs;
    } catch (e: any) {
      console.error('[AzureService] Failed to fetch SQL Databases:', e);
      throw new HttpException(
        `Failed to list SQL Databases: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async listKeyVaults() {
    try {
      const credential = this.getCredential();
      const subId = await this.getSubscriptionIdAuto(credential);
      const subName = await this.getSubscriptionName(credential, subId);
      const client = new KeyVaultManagementClient(credential, subId);
      const vaults = [];
      for await (const vault of client.vaults.list()) {
        const rgMatch = vault.id?.match(/resourceGroups\/([^\/]+)/i);
        const rgName = rgMatch ? rgMatch[1] : '';
        vaults.push({
          name: vault.name,
          resourceGroup: rgName,
          location: vault.location,
        });
      }

      console.log(`GET /azure/key-vaults`);
      console.log(`  Credential: ${this.getCredentialType()}`);
      console.log(`  Subscription ID: ${subId}`);
      console.log(`  Subscription Name: ${subName}`);
      console.log(`  Key Vaults Count: ${vaults.length}`);

      return vaults;
    } catch (e: any) {
      console.error('[AzureService] Failed to fetch Key Vaults:', e);
      throw new HttpException(
        `Failed to list Key Vaults: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async listContainerRegistries() {
    try {
      const credential = this.getCredential();
      const subId = await this.getSubscriptionIdAuto(credential);
      const subName = await this.getSubscriptionName(credential, subId);
      const client = new ContainerRegistryManagementClient(credential, subId);
      const registries = [];
      for await (const cr of client.registries.list()) {
        const rgMatch = cr.id?.match(/resourceGroups\/([^\/]+)/i);
        const rgName = rgMatch ? rgMatch[1] : '';
        registries.push({
          name: cr.name,
          resourceGroup: rgName,
          loginServer: cr.loginServer,
          status: cr.provisioningState,
          location: cr.location,
        });
      }

      console.log(`GET /azure/container-registries`);
      console.log(`  Credential: ${this.getCredentialType()}`);
      console.log(`  Subscription ID: ${subId}`);
      console.log(`  Subscription Name: ${subName}`);
      console.log(`  Container Registries Count: ${registries.length}`);

      return registries;
    } catch (e: any) {
      console.error('[AzureService] Failed to fetch Container Registries:', e);
      throw new HttpException(
        `Failed to list Container Registries: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
