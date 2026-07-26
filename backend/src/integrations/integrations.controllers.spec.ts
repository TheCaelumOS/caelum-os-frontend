import { Test, TestingModule } from '@nestjs/testing';
import { DockerController } from './docker/docker.controller';
import { DockerService } from './docker/docker.service';
import { KubernetesController } from './kubernetes/kubernetes.controller';
import { KubernetesService } from './kubernetes/kubernetes.service';
import { AwsController } from './aws/aws.controller';
import { AwsService } from './aws/aws.service';
import { AzureController } from './azure/azure.controller';
import { AzureService } from './azure/azure.service';
import { TerraformController } from './terraform/terraform.controller';
import { TerraformService } from './terraform/terraform.service';

// Mock the ESM kubernetes node package to prevent Jest from throwing ESModule syntax errors
jest.mock('@kubernetes/client-node', () => {
  return {
    KubeConfig: jest.fn().mockImplementation(() => {
      return {
        loadFromDefault: jest.fn(),
        makeApiClient: jest.fn(() => ({})),
      };
    }),
    CoreV1Api: jest.fn(),
    AppsV1Api: jest.fn(),
  };
});

describe('IntegrationsControllers', () => {
  let dockerController: DockerController;
  let k8sController: KubernetesController;
  let awsController: AwsController;
  let azureController: AzureController;
  let tfController: TerraformController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        DockerController,
        KubernetesController,
        AwsController,
        AzureController,
        TerraformController,
      ],
      providers: [
        { provide: DockerService, useValue: { listContainers: jest.fn().mockResolvedValue([]), controlContainer: jest.fn(), getContainerLogs: jest.fn() } },
        { provide: KubernetesService, useValue: { listNamespaces: jest.fn().mockResolvedValue(['default']), listPods: jest.fn(), listDeployments: jest.fn() } },
        { provide: AwsService, useValue: { listS3Buckets: jest.fn().mockResolvedValue([]), listEc2Instances: jest.fn(), listRdsDatabases: jest.fn() } },
        { provide: AzureService, useValue: { listVirtualMachines: jest.fn().mockResolvedValue([]), listStorageAccounts: jest.fn(), listResourceGroups: jest.fn() } },
        { provide: TerraformService, useValue: { validate: jest.fn().mockResolvedValue({ valid: true }), runPlan: jest.fn() } },
      ],
    }).compile();

    dockerController = module.get<DockerController>(DockerController);
    k8sController = module.get<KubernetesController>(KubernetesController);
    awsController = module.get<AwsController>(AwsController);
    azureController = module.get<AzureController>(AzureController);
    tfController = module.get<TerraformController>(TerraformController);
  });

  it('should be defined', () => {
    expect(dockerController).toBeDefined();
    expect(k8sController).toBeDefined();
    expect(awsController).toBeDefined();
    expect(azureController).toBeDefined();
    expect(tfController).toBeDefined();
  });

  it('should mock list containers', async () => {
    const result = await dockerController.listContainers();
    expect(result).toBeInstanceOf(Array);
  });

  it('should mock validate terraform', async () => {
    const result = await tfController.validate({ code: 'code' });
    expect(result.valid).toBe(true);
  });
});
