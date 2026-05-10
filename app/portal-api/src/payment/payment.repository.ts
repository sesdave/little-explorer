import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentRepository } from '../enrollment/enrollment.repository';
import {
  ApplicationStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  RegistrationStatus,
} from '@prisma/client';

type TransactionClient = Omit<
  Prisma.TransactionClient, 
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>

@Injectable()
export class PaymentRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}

  async findPaymentByReference(reference: string) {
    return this.prisma.payment.findUnique({
      where: {
        externalReference: reference,
      },
    });
  }

  async createSuccessfulPayment(data: {
    applicationId: string;
    amount: number;
    reference: string;
    currency?: string;
    method?: PaymentMethod;
  }) {
    return this.prisma.payment.create({
      data: {
        applicationId: data.applicationId,
        amount: data.amount,
        currency: data.currency || 'NGN',
        status: PaymentStatus.SUCCESSFUL,
        method: data.method || PaymentMethod.PAYSTACK,
        externalReference: data.reference,
        paidAt: new Date(),
      },
    });
  }

  async getApplicationWithPayments(
    applicationId: string,
  ) {
    return this.prisma.application.findUniqueOrThrow({
      where: {
        id: applicationId,
      },
      include: {
        payments: true,
        registrations: true,
      },
    });
  }

  /**
   * REFINED: Participates in existing transactions or starts its own.
   * This is key for the Webhook to update both the payment and application at once.
   */
  async updateApplicationBalances(
    applicationId: string,
    tx: TransactionClient = this.prisma // Default to standard prisma if no tx provided
  ) {
    const application = await tx.application.findUniqueOrThrow({
      where: { id: applicationId },
      include: { payments: true },
    });

    const totalPaid = application.payments.reduce(
      (sum, payment) => (payment.status === PaymentStatus.SUCCESSFUL ? sum + Number(payment.amount) : sum),
      0,
    );

    const totalAmount = Number(application.totalAmount);
    const remainingBalance = totalAmount - totalPaid;
    const isFullyPaid = remainingBalance <= 0;

    const updatedApplication = await tx.application.update({
      where: { id: applicationId },
      data: {
        amountPaid: totalPaid,
        balanceDue: Math.max(remainingBalance, 0),
      },
    });

    // Delegate enrollment logic to the enrollment repo, passing the same tx client
    if (isFullyPaid) {
      await this.enrollmentRepo.markApplicationCompleted(applicationId, tx);
      await this.enrollmentRepo.confirmRegistrations(applicationId, tx);
    } else {
      await this.enrollmentRepo.markApplicationPartiallyPaid(applicationId, tx);
      await this.enrollmentRepo.revertRegistrationsToProvisional(applicationId, tx);
    }

    return updatedApplication;
  }

 /* async updateApplicationBalances(
    applicationId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const application =
        await tx.application.findUniqueOrThrow({
          where: {
            id: applicationId,
          },
          include: {
            payments: true,
          },
        });

      const totalPaid =
        application.payments.reduce(
          (sum, payment) =>
            payment.status === 'SUCCESSFUL'
              ? sum + Number(payment.amount)
              : sum,
          0,
        );

      const totalAmount = Number(
        application.totalAmount,
      );

      const remainingBalance =
        totalAmount - totalPaid;

      const isFullyPaid =
        remainingBalance <= 0;

      const updatedApplication = await tx.application.update({
          where: {
            id: applicationId,
          },
          data: {
            amountPaid: totalPaid,
            balanceDue: Math.max(
              remainingBalance,
              0,
            ),
          },
        });

      if (isFullyPaid) {

        await this.enrollmentRepo.markApplicationCompleted(
          applicationId,
          tx,
        );

        await this.enrollmentRepo.confirmRegistrations(
          applicationId,
          tx,
        );

      } else {

        await this.enrollmentRepo.markApplicationPartiallyPaid(
          applicationId,
          tx,
        );

        await this.enrollmentRepo.revertRegistrationsToProvisional(
          applicationId,
          tx,
        );
      }

      return updatedApplication;
    });
  }*/

  async getApplicationPaymentSummary(
    applicationId: string,
  ) {
    const application =
      await this.prisma.application.findUniqueOrThrow({
        where: {
          id: applicationId,
        },
        include: {
          payments: {
            where: {
              status: PaymentStatus.SUCCESSFUL,
            },
          },
        },
      });

    const totalPaid =
      application.payments.reduce(
        (sum, payment) =>
          sum + Number(payment.amount),
        0,
      );

    const totalAmount = Number(
      application.totalAmount,
    );

    const remainingBalance =
      totalAmount - totalPaid;

    return {
      applicationId,
      totalAmount,
      totalPaid,
      remainingBalance,
      isFullyPaid: remainingBalance <= 0,
      status:
        remainingBalance <= 0
          ? 'COMPLETED'
          : 'PARTIALLY_PAID',
    };
  }

 /* async markApplicationCompleted(
    applicationId: string,
    tx: any = this.prisma,
  ) {
    return tx.application.update({
      where: {
        id: applicationId,
      },
      data: {
        status: ApplicationStatus.COMPLETED,
      },
    });
  }

  async markApplicationPartiallyPaid(
    applicationId: string,
    tx: any = this.prisma,
  ) {
    return tx.application.update({
      where: {
        id: applicationId,
      },
      data: {
        status:
          ApplicationStatus.PARTIALLY_PAID,
      },
    });
  }

  async confirmRegistrations(
    applicationId: string,
    tx: any = this.prisma,
  ) {
    return tx.registration.updateMany({
      where: {
        applicationId,
      },
      data: {
        status:
          RegistrationStatus.CONFIRMED,
      },
    });
  }*/

  async revertRegistrationsToProvisional(
    applicationId: string,
    tx: any = this.prisma,
  ) {
    return tx.registration.updateMany({
      where: {
        applicationId,
      },
      data: {
        status:
          RegistrationStatus.PROVISIONAL,
      },
    });
  }

  async getApplicationData(id: string) {
    return this.prisma.application.findUnique({
      where: { id },
      include: { parent: true }
    });
  }

  // Specialized query for idempotency
  async findRecentPending(applicationId: string, amount: number) {
    return this.prisma.payment.findFirst({
      where: {
        applicationId,
        amount,
        status: 'PENDING',
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) }
      }
    });
  }

  // Staff Level: Accepts an optional 'tx' to participate in service-led transactions
  async createPaymentRecord(data: any, tx?: any) {
    const client = tx || this.prisma;
    return client.payment.create({
      data: {
        applicationId: data.applicationId,
        amount: data.amount,
        externalReference: data.reference,
        status: 'PENDING',
        method: 'PAYSTACK'
      }
    });
  }

  /**
   * STAFF LEVEL: Completes a payment and reconciles the application.
   * Wraps everything in a transaction to ensure database integrity.
   */
  async completePayment(paymentId: string, paystackData: any) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Update the Payment record to SUCCESSFUL
      const payment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.SUCCESSFUL,
          paidAt: new Date(),
          // Store any extra metadata from paystack if needed
          channel: paystackData.channel, 
        },
      });

      // 2. Trigger the balance reconciliation logic using the same transaction client
      // This will automatically mark application as COMPLETED and CONFIRM registrations
      await this.updateApplicationBalances(payment.applicationId, tx as TransactionClient);

      return payment;
    });
  }

  /**
   * Batch invalidate pending payments (used by Cron as a fallback)
   */
  async invalidateExpiredPayments(thresholdMinutes: number = 30) {
    const thresholdDate = new Date(Date.now() - thresholdMinutes * 60 * 1000);

    return this.prisma.payment.updateMany({
      where: {
        status: PaymentStatus.PENDING,
        createdAt: {
          lt: thresholdDate,
        },
      },
      data: {
        status: PaymentStatus.FAILED,
      },
    });
  }
}