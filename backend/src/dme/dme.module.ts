import { Module } from '@nestjs/common';
import { DmeController } from './dme.controller';
import { DmeService } from './dme.service';
import { DmeCaptureService } from './dme-capture.service';
import { DmeValidatorService } from './dme-validator.service';
import { IntegrationsModule } from '../integrations/integrations.module';
import { JenkinsModule } from '../integrations/jenkins/jenkins.module';

@Module({
  imports: [IntegrationsModule, JenkinsModule],
  controllers: [DmeController],
  providers: [DmeService, DmeCaptureService, DmeValidatorService],
  exports: [DmeService, DmeCaptureService, DmeValidatorService],
})
export class DmeModule {}
