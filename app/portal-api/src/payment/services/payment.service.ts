import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as crypto from 'crypto';
import { PaymentRepository } from '../payment.repository';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentRepo: PaymentRepository,
    private readonly userRepo: UserRepository,
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

      // 3. Branching Logic: REGISTRATION vs DONATION
      if (payment.type === 'DONATION') {
        // If there is a linked donation metadata record, you might want to tag it
        return { success: true, type: 'DONATION' };
      }

      if (payment.type === 'REGISTRATION' && applicationId) {
        // 4. Atomic Balance Update (Your existing Staff Logic)
        await this.paymentRepo.updateApplicationBalances(applicationId, tx as any);
        return { success: true, type: 'REGISTRATION' };
      }

      return { success: true };

      // 5. Atomic Balance Update
      // We pass 'tx' so this happens in the same transaction
      // await this.paymentRepo.updateApplicationBalances(applicationId, tx);

      // return { success: true };
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

  async initializePayment(userId: string, applicationId: string, amount: number, extra_amount: number) {
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
      const combinedTotal = Number(existing.amount) + Number(existing.extra_amount ?? 0);
      return { reference: existing.externalReference, email: application.parent.email, amount: Math.round(combinedTotal * 100) };
    }

    // 3. Logic: Orchestrate the Write via Transaction
    const reference = `PAY_${nanoid(10)}`;
    
    return await this.prisma.$transaction(async (tx) => {
      const payment = await this.paymentRepo.createPaymentRecord(
        { applicationId, amount, reference, extra_amount },
        tx // Passing the transaction delegate
      );

      return {
        reference: payment.externalReference,
        email: application.parent.email,
        amount: Math.round((amount + extra_amount) * 100)
      };
    });
  }

  // payment.service.ts

async initializeDonation(userId: string, dto: { amount: number, donorName: string, message: string }) {
  return await this.prisma.$transaction(async (tx) => {

    const user = await this.userRepo.findById(userId);
    if(!user){
      return
    }
    
    // 1. Create the Donation intent record
    const donation = await tx.donation.create({
      data: {
        amount: dto.amount,
        donorName: dto.donorName || 'Anonymous',
        message: dto.message,
        email: user?.email,
        userId: userId, // null if guest
      },
    });

    // 2. Generate a unique reference
    // Prefixing with 'DON_' makes it easy to identify in Paystack logs
    const reference = `DON_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

    // 3. Create the PENDING Payment record
    // We link it to the donationId we just created
    await tx.payment.create({
      data: {
        amount: dto.amount,
        status: 'PENDING',
        externalReference: reference,
        type: 'DONATION',
        donationId: donation.id, 
        method: 'PAYSTACK',
      },
    });

    // 4. Return the data the frontend needs to trigger the Paystack UI
    return {
      reference,
      amount: Math.round(dto.amount * 100), // Convert to Kobo for Paystack
      email: user?.email,
      donationId: donation.id
    };
  });
}
}