// apps/api/src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './service/admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminBroadcastService } from './service/broadcast.service';
import { CommunicationModule } from 'src/communication/communication.module';

@Module({
  imports: [PrismaModule, CommunicationModule],
  controllers: [AdminController],
  providers: [AdminService, AdminBroadcastService],
  exports: [AdminService, AdminBroadcastService], // Exported in case other modules need admin stats
})
export class AdminModule {}