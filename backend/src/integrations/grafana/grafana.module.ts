import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GrafanaController } from './grafana.controller';
import { GrafanaService } from './grafana.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [GrafanaController],
  providers: [GrafanaService],
  exports: [GrafanaService],
})
export class GrafanaModule {}
