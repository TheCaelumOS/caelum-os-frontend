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
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string, keyString: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(keyString);
  const key = hash.digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText: string, keyString: string): string {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return '';
    const iv = Buffer.from(parts[0], 'hex');
    const hash = crypto.createHash('sha256');
    hash.update(keyString);
    const key = hash.digest();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return '';
  }
}

@Injectable()
export class AzureService {
  private credentialsMap = new Map<string, any>();

  private async loadCredentials(userId: string) {
    if (this.credentialsMap.has(userId)) {
      return this.credentialsMap.get(userId);
    }
    const dataDir = join(process.cwd(), 'data');
    const filePath = join(dataDir, 'azure_credentials.json');
    try {
      if (!existsSync(filePath)) return null;
      const fileData = await fs.readFile(filePath, 'utf8');
      const allCreds = JSON.parse(fileData);
      const encryptedStr = allCreds[userId];
      if (!encryptedStr) return null;

      const secret = process.env.JWT_SECRET || 'caelum-azure-encryption-fallback-key-2026';
      const decryptedStr = decrypt(encryptedStr, secret);
      if (!decryptedStr) return null;

      const creds = JSON.parse(decryptedStr);
      this.credentialsMap.set(userId, creds);
      return creds;
    } catch (err) {
      console.error('[AzureService] Failed to load credentials for user:', userId, err);
      return null;
    }
  }

  private async saveCredentials(userId: string, creds: any) {
    this.credentialsMap.set(userId, creds);
    const dataDir = join(process.cwd(), 'data');
    const filePath = join(dataDir, 'azure_credentials.json');
    try {
      if (!existsSync(dataDir)) {
        await fs.mkdir(dataDir, { recursive: true });
      }
      let allCreds: any = {};
      if (existsSync(filePath)) {
        const fileData = await fs.readFile(filePath, 'utf8');
        allCreds = JSON.parse(fileData);
      }

      const secret = process.env.JWT_SECRET || 'caelum-azure-encryption-fallback-key-2026';
      const encryptedStr = encrypt(JSON.stringify(creds), secret);
      allCreds[userId] = encryptedStr;
      await fs.writeFile(filePath, JSON.stringify(allCreds, null, 2), 'utf8');
    } catch (err) {
      console.error('[AzureService] Failed to save credentials for user:', userId, err);
    }
  }

  private async removeCredentials(userId: string) {
    this.credentialsMap.delete(userId);
    const dataDir = join(process.cwd(), 'data');
    const filePath = join(dataDir, 'azure_credentials.json');
    try {
      if (!existsSync(filePath)) return;
      const fileData = await fs.readFile(filePath, 'utf8');
      const allCreds = JSON.parse(fileData);
      delete allCreds[userId];
      await fs.writeFile(filePath, JSON.stringify(allCreds, null, 2), 'utf8');
    } catch (err) {
      console.error('[AzureService] Failed to remove credentials for user:', userId, err);
    }
  }

  private async getCredential(userId: string) {
    const creds = await this.loadCredentials(userId);
    if (!creds) {
      throw new HttpException('No Azure account connected for this user.', HttpStatus.UNAUTHORIZED);
    }

    if (creds.authMethod === 'cli') {
      return new DefaultAzureCredential();
    } else if (creds.authMethod === 'servicePrincipal') {
      return new ClientSecretCredential(creds.tenantId, creds.clientId, creds.clientSecret);
    }

    throw new HttpException('Invalid authentication method.', HttpStatus.BAD_REQUEST);
  }

  private getCredentialType(creds: any): string {
    if (!creds) return 'None';
    return creds.authMethod === 'cli' ? 'DefaultAzureCredential (CLI)' : 'ServicePrincipal';
  }

  private async getSubscriptionIdAuto(credential: any, userId: string): Promise<string> {
    const creds = await this.loadCredentials(userId);
    if (creds && creds.subscriptionId) {
      return creds.subscriptionId;
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

  async connect(userId: string, body: any) {
    const { authMethod, clientId, clientSecret, tenantId, subscriptionId } = body;
    console.log(`[AzureService] Connect request received for user: ${userId}. Method: ${authMethod}, Subscription: ${subscriptionId || 'Auto-Discover'}`);

    let credential: any;
    if (authMethod === 'cli') {
      credential = new DefaultAzureCredential();
    } else if (authMethod === 'servicePrincipal') {
      if (!clientId || !clientSecret || !tenantId) {
        console.warn('[AzureService] Connection rejected: Missing SP details.');
        throw new HttpException('Client ID, Client Secret, and Tenant ID are required for Service Principal.', HttpStatus.BAD_REQUEST);
      }
      credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    } else {
      console.warn(`[AzureService] Connection rejected: Invalid authMethod: ${authMethod}`);
      throw new HttpException('Invalid authentication method.', HttpStatus.BAD_REQUEST);
    }

    try {
      console.log('[AzureService] Validating Azure credentials token extraction...');
      const targetSubId = subscriptionId || await this.getSubscriptionIdAuto(credential, userId);
      const tokenRes = await credential.getToken('https://management.azure.com/.default');
      const response = await fetch(
        `https://management.azure.com/subscriptions/${targetSubId}?api-version=2020-01-01`,
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
      console.log(`[AzureService] Connection validated successfully! Subscription detected: ${data.displayName} (${targetSubId})`);

      const savedCreds = {
        authMethod,
        clientId,
        clientSecret,
        tenantId,
        subscriptionId: targetSubId,
      };
      await this.saveCredentials(userId, savedCreds);

      return {
        connected: true,
        subscriptionId: targetSubId,
        subscriptionName: data.displayName,
      };
    } catch (err: any) {
      console.error('[AzureService] Connection validation failed with SDK exception:', err.message);
      throw new HttpException(`Azure Connection Failed: ${err.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async disconnect(userId: string) {
    console.log(`[AzureService] Disconnecting Azure account for user: ${userId}`);
    await this.removeCredentials(userId);
    return { connected: false };
  }

  async getHealth(userId: string) {
    console.log(`[AzureService] Health status check requested for user: ${userId}`);
    const creds = await this.loadCredentials(userId);
    if (!creds) {
      console.log('[AzureService] Health status: Not Connected');
      return {
        connected: false,
        reason: 'No Azure account connected. Please connect your Azure credentials.',
      };
    }

    try {
      const credential = await this.getCredential(userId);
      const subId = await this.getSubscriptionIdAuto(credential, userId);
      const subName = await this.getSubscriptionName(credential, subId);
      console.log(`[AzureService] Health validation succeeded. Subscription: ${subName} (${subId})`);

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

      console.log(`[AzureService] Counts fetched - ResourceGroups: ${rgCount}, VMs: ${vmCount}, StorageAccounts: ${storageCount}`);
      return {
        connected: true,
        credential: this.getCredentialType(creds),
        subscriptionId: subId,
        subscriptionName: subName,
        resourceGroups: rgCount,
        virtualMachines: vmCount,
        storageAccounts: storageCount,
      };
    } catch (e: any) {
      console.error('[AzureService] Health validation failed with credentials check error:', e.message);
      return {
        connected: false,
        credential: this.getCredentialType(creds),
        reason: `Connection error: ${e.message}`,
      };
    }
  }

  async getSubscription(userId: string) {
    try {
      const creds = await this.loadCredentials(userId);
      const credential = await this.getCredential(userId);
      const subId = await this.getSubscriptionIdAuto(credential, userId);
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
      console.log(`  User: ${userId}`);
      console.log(`  Credential: ${this.getCredentialType(creds)}`);
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

  async listResourceGroups(userId: string) {
    try {
      const creds = await this.loadCredentials(userId);
      const credential = await this.getCredential(userId);
      const subId = await this.getSubscriptionIdAuto(credential, userId);
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
      console.log(`  User: ${userId}`);
      console.log(`  Credential: ${this.getCredentialType(creds)}`);
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

  async listVirtualMachines(userId: string) {
    try {
      const creds = await this.loadCredentials(userId);
      const credential = await this.getCredential(userId);
      const subId = await this.getSubscriptionIdAuto(credential, userId);
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
      console.log(`  User: ${userId}`);
      console.log(`  Credential: ${this.getCredentialType(creds)}`);
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

  async listStorageAccounts(userId: string) {
    try {
      const creds = await this.loadCredentials(userId);
      const credential = await this.getCredential(userId);
      const subId = await this.getSubscriptionIdAuto(credential, userId);
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
      console.log(`  User: ${userId}`);
      console.log(`  Credential: ${this.getCredentialType(creds)}`);
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

  async listVirtualNetworks(userId: string) {
    try {
      const creds = await this.loadCredentials(userId);
      const credential = await this.getCredential(userId);
      const subId = await this.getSubscriptionIdAuto(credential, userId);
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
      console.log(`  User: ${userId}`);
      console.log(`  Credential: ${this.getCredentialType(creds)}`);
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

  async listNetworkSecurityGroups(userId: string) {
    try {
      const creds = await this.loadCredentials(userId);
      const credential = await this.getCredential(userId);
      const subId = await this.getSubscriptionIdAuto(credential, userId);
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
      console.log(`  User: ${userId}`);
      console.log(`  Credential: ${this.getCredentialType(creds)}`);
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

  async listPublicIps(userId: string) {
    try {
      const creds = await this.loadCredentials(userId);
      const credential = await this.getCredential(userId);
      const subId = await this.getSubscriptionIdAuto(credential, userId);
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
      console.log(`  User: ${userId}`);
      console.log(`  Credential: ${this.getCredentialType(creds)}`);
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

  async listAppServices(userId: string) {
    try {
      const creds = await this.loadCredentials(userId);
      const credential = await this.getCredential(userId);
      const subId = await this.getSubscriptionIdAuto(credential, userId);
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
      console.log(`  User: ${userId}`);
      console.log(`  Credential: ${this.getCredentialType(creds)}`);
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

  async listSqlDatabases(userId: string) {
    try {
      const creds = await this.loadCredentials(userId);
      const credential = await this.getCredential(userId);
      const subId = await this.getSubscriptionIdAuto(credential, userId);
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
      console.log(`  User: ${userId}`);
      console.log(`  Credential: ${this.getCredentialType(creds)}`);
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

  async listKeyVaults(userId: string) {
    try {
      const creds = await this.loadCredentials(userId);
      const credential = await this.getCredential(userId);
      const subId = await this.getSubscriptionIdAuto(credential, userId);
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
      console.log(`  User: ${userId}`);
      console.log(`  Credential: ${this.getCredentialType(creds)}`);
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

  async listContainerRegistries(userId: string) {
    try {
      const creds = await this.loadCredentials(userId);
      const credential = await this.getCredential(userId);
      const subId = await this.getSubscriptionIdAuto(credential, userId);
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
      console.log(`  User: ${userId}`);
      console.log(`  Credential: ${this.getCredentialType(creds)}`);
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
