// apps/api/src/communication/communication.module.ts
import { Module, Global } from '@nestjs/common';
import { CommunicationService } from './communication.service';

@Module({
  providers: [CommunicationService],
  exports: [CommunicationService], // 👈 THIS IS THE KEY
})
export class CommunicationModule {}