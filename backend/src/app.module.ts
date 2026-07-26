import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppsModule } from './apps/apps.module';
import { WebsocketModule } from './websocket/websocket.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { FilesystemModule } from './filesystem/filesystem.module';
import { TerminalModule } from './terminal/terminal.module';
import { IntegrationsModule } from './integrations/integrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    AppsModule,
    WebsocketModule,
    MonitoringModule,
    FilesystemModule,
    TerminalModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
