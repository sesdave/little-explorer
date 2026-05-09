// src/modules/payment/payment.module.ts
import { Module } from '@nestjs/common';
import { RevenueService } from './revenue.service';
import { RevenueRepository } from './revenue.repository';
import { RevenueController } from './revenue.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [RevenueController],
  providers: [
    RevenueService, 
    RevenueRepository
  ],
  exports: [RevenueService], // Exported in case other modules need to check payment status
})
export class RevenueModule {}