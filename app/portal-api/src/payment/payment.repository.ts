// src/modules/payment/payment.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentRepository } from '../enrollment/enrollment.repository';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService, private readonly enrollmentRepo: EnrollmentRepository) {}

 async fulfillApplicationPayment(data: {
    applicationId: string;
    amount: number;
    reference: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Record the Payment (Payment Domain)
      const payment = await tx.payment.create({
        data: {
          applicationId: data.applicationId,
          amount: data.amount,
          status: 'SUCCESSFUL',
          method: 'PAYSTACK',
          externalReference: data.reference,
        },
      });

      // 2. Delegate Enrollment Status (Enrollment Domain)
      // We pass 'tx' so it happens in the same transaction
      const application = await this.enrollmentRepo.confirmEnrollment(
        data.applicationId, 
        tx
      );

      return { application, payment };
    });
  }

  async findPaymentByReference(reference: string) {
    return this.prisma.payment.findUnique({
      where: { externalReference: reference },
    });
  }
}