// src/modules/payment/payment.module.ts
import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { EnrollmentModule } from '../enrollment/enrollment.module'; // 👈 Import to use EnrollmentRepo
import { PrismaModule } from '../prisma/prisma.module';
import { EnrollmentRepository } from 'src/enrollment/enrollment.repository';

@Module({
  imports: [
    PrismaModule,
    EnrollmentModule, // 👈 Required for the fulfillApplicationPayment logic
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService, 
    PaymentRepository,
    EnrollmentRepository,
  ],
  exports: [PaymentService], // Exported in case other modules need to check payment status
})
export class PaymentModule {}