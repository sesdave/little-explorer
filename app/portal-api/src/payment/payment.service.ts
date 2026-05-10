import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as crypto from 'crypto';
import { PaymentRepository } from './payment.repository';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentRepo: PaymentRepository,
  ) {}

  verifyPaystackSignature(
    payload: any,
    signature: string,
  ): boolean {
    const secret =
      process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      throw new Error(
        'PAYSTACK_SECRET_KEY missing',
      );
    }

    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }

  async handlePaystackWebhook(
    payload: any,
    signature: string,
  ) {
    const isValid = this.verifyPaystackSignature(payload, signature);
    if (!isValid) throw new UnauthorizedException('Invalid signature');

    const { event, data } = payload;

    // 1. Filter events
    if (event !== 'charge.success') return { received: true };

    const reference = data.reference;
    const applicationId = data.metadata?.applicationId;

    // 2. Transactional Update
    return await this.prisma.$transaction(async (tx) => {
      // Find the payment record we initialized earlier
      const payment = await tx.payment.findUnique({
        where: { externalReference: reference },
      });

      // If no record exists, it might be a direct Paystack payment not initiated by our UI
      // Or we can choose to log this as an error for strict idempotency
      if (!payment) {
        throw new NotFoundException(`Payment reference ${reference} not found in local DB`);
      }

      // 3. IDEMPOTENCY: Check if already processed
      if (payment.status === 'SUCCESSFUL') {
        return { success: true, message: 'Already processed' };
      }

      // 4. Update the Payment to SUCCESSFUL
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESSFUL',
          paidAt: new Date(),
          // Optional: update currency/method if different from initialized
        },
      });

      // 5. Atomic Balance Update
      // We pass 'tx' so this happens in the same transaction
      await this.paymentRepo.updateApplicationBalances(applicationId, tx);

      return { success: true };
    });
  }

  /*async handlePaystackWebhook(
    payload: any,
    signature: string,
  ) {
    const isValid =
      this.verifyPaystackSignature(
        payload,
        signature,
      );

    if (!isValid) {
      throw new UnauthorizedException();
    }

    const { event, data } = payload;

    // Ignore non-success events
    if (
      event !== 'charge.success' ||
      data.status !== 'success'
    ) {
      return;
    }

    const applicationId =
      data.metadata?.applicationId;

    if (!applicationId) {
      throw new Error(
        'Missing applicationId metadata',
      );
    }

    // Idempotency protection
    const existing =
      await this.paymentRepo.findPaymentByReference(
        data.reference,
      );

    if (existing) {
      return existing;
    }

    // Record payment
    await this.paymentRepo.createSuccessfulPayment({
      applicationId,
      amount: data.amount / 100,
      reference: data.reference,
      currency: data.currency,
      method: 'PAYSTACK',
    });

    // Recalculate balances + update statuses
    await this.paymentRepo.updateApplicationBalances(
      applicationId,
    );

    return {
      success: true,
    };
  }*/

  async getStatusByReference(
    reference: string,
  ) {
    const payment =
      await this.paymentRepo.findPaymentByReference(
        reference,
      );

    return payment?.status || 'PENDING';
  }

  async initializePayment(userId: string, applicationId: string, amount: number) {
    // 1. Business Logic: Pre-flight checks
    const application = await this.paymentRepo.getApplicationData(applicationId);
    
    if (!application) throw new NotFoundException('Application not found');
    if (application.parentId !== userId) throw new ForbiddenException('Unauthorized');
    
    const balance = Number(application.totalAmount) - Number(application.amountPaid);
    if (amount > balance) throw new BadRequestException('Amount exceeds balance');
    if (application.status === 'COMPLETED') throw new BadRequestException('Already paid');

    // 2. Logic: Idempotency check
    const existing = await this.paymentRepo.findRecentPending(applicationId, amount);
    if (existing) {
      return { reference: existing.externalReference, email: application.parent.email, amount: Math.round(Number(existing.amount) * 100) };
    }

    // 3. Logic: Orchestrate the Write via Transaction
    const reference = `PAY_${nanoid(10)}`;
    
    return await this.prisma.$transaction(async (tx) => {
      const payment = await this.paymentRepo.createPaymentRecord(
        { applicationId, amount, reference },
        tx // Passing the transaction delegate
      );

      return {
        reference: payment.externalReference,
        email: application.parent.email,
        amount: Math.round(amount * 100)
      };
    });
  }
}