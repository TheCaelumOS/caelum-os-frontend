import { Module } from '@nestjs/common';
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

@Module({
  controllers: [
    DockerController,
    KubernetesController,
    AwsController,
    AzureController,
    TerraformController,
  ],
  providers: [
    DockerService,
    KubernetesService,
    AwsService,
    AzureService,
    TerraformService,
  ],
  exports: [
    DockerService,
    KubernetesService,
    AwsService,
    AzureService,
    TerraformService,
  ],
})
export class IntegrationsModule {}
