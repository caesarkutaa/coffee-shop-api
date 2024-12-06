import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Called when the module initializes. Establishes a connection to the database.
   */
  async onModuleInit() {
    await this.$connect();
    console.log('Connected to the database');
  }

  /**
   * Called when the module is destroyed. Disconnects from the database.
   */
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Disconnected from the database');
  }
}
