import { Module } from '@nestjs/common';
import { IntegrationsModule } from '../integrations/integrations.module';
import { GithubModule } from '../integrations/github/github.module';
import { GrafanaModule } from '../integrations/grafana/grafana.module';
import { MonitoringModule } from '../monitoring/monitoring.module';
import { InfrastructureController } from './infrastructure.controller';
import { InfrastructureService } from './infrastructure.service';

@Module({
  imports: [
    IntegrationsModule,
    GithubModule,
    GrafanaModule,
    MonitoringModule,
  ],
  controllers: [InfrastructureController],
  providers: [InfrastructureService],
  exports: [InfrastructureService],
})
export class InfrastructureModule {}
