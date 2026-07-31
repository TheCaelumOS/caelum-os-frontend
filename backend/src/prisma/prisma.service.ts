import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Successfully connected to Prisma Database.');
    } catch (err: any) {
      console.error('Prisma connection error during onModuleInit:', err.message);
      console.warn('Backend server remains running without database support.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
