import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentRepository } from '../payment.repository';
import { PaystackService } from './paystack.service';
import { Cron } from '@nestjs/schedule';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentCronService {
  private readonly logger = new Logger(PaymentCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentRepo: PaymentRepository,
    private readonly paystackService: PaystackService,
  ) {}

  /**
   * Cron Job: Runs every 15 minutes.
   * Purpose: Syncs payments that missed webhooks and cleans up stale/expired attempts.
   */
  //@Cron('0 */5 * * * *')
  async syncAndCleanupPayments() {
    // Determine the cutoff point (30 minutes ago)
    const threshold = new Date(Date.now() - 30 * 60 * 1000);

    this.logger.log(`Starting payment reconciliation. Target: PENDING created before ${threshold.toISOString()}`);

    // 1. Fetch only "stale" pending payments
    const pendingPayments = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.PENDING,
        createdAt: { lt: threshold },
      },
    });

    if (pendingPayments.length === 0) {
      this.logger.log('No stale pending payments found. Skipping cycle.');
      return;
    }

    this.logger.log(`Processing ${pendingPayments.length} payments...`);

    for (const payment of pendingPayments) {
      try {
        // 2. Guard: Handle missing references (records that can't be verified)
        if (!payment.externalReference) {
          this.logger.warn(`Payment ${payment.id} missing reference. Marking as EXPIRED.`);
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.EXPIRED },
          });
          continue;
        }

        // 3. Verify status with Paystack
        const paystackData = await this.paystackService.verifyTransaction(payment.externalReference);

        // CASE: Transaction not found on Paystack at all
        if (!paystackData) {
          this.logger.warn(`Reference ${payment.externalReference} not found on Paystack. Marking as EXPIRED.`);
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.EXPIRED },
          });
          continue;
        }

        // 4. Act based on Paystack's real-time status
        if (paystackData.status === 'success') {
          // Success: Run the repository method to complete enrollment
          await this.paymentRepo.completePayment(payment.id, paystackData);
          this.logger.log(`✅ [SYNCED] Payment successful: ${payment.externalReference}`);
        } 
        else if (['abandoned', 'failed', 'reversed'].includes(paystackData.status)) {
          // Definitely Dead: Update status so user can retry
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.FAILED },
          });
          this.logger.log(`❌ [INVALIDATED] Payment ${paystackData.status}: ${payment.externalReference}`);
        } 
        else {
          // Ongoing: If it's still 'pending' on Paystack after 30 mins, we treat it as abandoned
          this.logger.debug(`Payment ${payment.externalReference} timed out. Marking as FAILED.`);
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.FAILED },
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to reconcile ${payment.externalReference}: ${message}`);
      }
    }

    this.logger.log('Payment reconciliation cycle finished.');
  }
}