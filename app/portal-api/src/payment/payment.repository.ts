import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentRepository } from '../enrollment/enrollment.repository';
import {
  ApplicationStatus,
  PaymentMethod,
  PaymentStatus,
  RegistrationStatus,
} from '@prisma/client';

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

  async updateApplicationBalances(
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
  }

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
}