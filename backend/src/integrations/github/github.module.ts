import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [GithubController],
  providers: [GithubService],
  exports: [GithubService],
})
export class GithubModule {}
