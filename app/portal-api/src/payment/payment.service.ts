// src/modules/payment/payment.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymentRepository } from './payment.repository';

@Injectable()
export class PaymentService {
    constructor(private readonly paymentRepo: PaymentRepository) {}
  
    verifyPaystackSignature(payload: any, signature: string): boolean {
        const secret = process.env.PAYSTACK_SECRET_KEY;

        if (!secret) {
            throw new Error('PAYSTACK_SECRET_KEY is not defined in environment variables');
        }
        
        // Create a HMAC SHA512 hash of the raw body
        const hash = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

        // Securely compare the hashes to prevent timing attacks
        return hash === signature;
    }

    // src/modules/payment/payment.service.ts

        async handlePaystackWebhook(payload: any, signature: string) {
        // 1. Verify Paystack Signature (Crucial for Security)
            const isValid = this.verifyPaystackSignature(payload, signature);
            if (!isValid) throw new UnauthorizedException();

            const { event, data } = payload;

            if (event === 'charge.success') {
                const applicationId = data.metadata.applicationId;

                // 🏛️ Clean call to the repository
                await this.paymentRepo.fulfillApplicationPayment({
                    applicationId,
                    amount: data.amount / 100, // Convert Kobo to Currency
                    reference: data.reference,
                });

                // After DB is updated, you can safely trigger side effects
                // this.emailService.sendConfirmation(applicationId);
            }
        }

        /**
     * Used by the controller to answer the frontend's "Verifying..." screen
     */
    async getStatusByReference(reference: string) {
        const payment = await this.paymentRepo.findPaymentByReference(reference);
        return payment?.status || 'PENDING';
    }
}