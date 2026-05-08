import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as crypto from 'crypto';
import { PaymentRepository } from './payment.repository';

@Injectable()
export class PaymentService {
  constructor(
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
  }

  async getStatusByReference(
    reference: string,
  ) {
    const payment =
      await this.paymentRepo.findPaymentByReference(
        reference,
      );

    return payment?.status || 'PENDING';
  }
}