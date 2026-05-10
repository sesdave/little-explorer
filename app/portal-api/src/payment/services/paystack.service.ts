import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly secretKey = process.env.PAYSTACK_SECRET_KEY;
  private readonly baseUrl = 'https://api.paystack.co';

  /**
   * Verifies a transaction status with Paystack
   * @param reference The unique payment reference string
   * @returns The transaction data object or null if verification fails
   */
  async verifyTransaction(reference: string) {
    if (!this.secretKey) {
      this.logger.error('PAYSTACK_SECRET_KEY is not defined in environment variables');
      throw new InternalServerErrorException('Payment provider configuration missing');
    }

    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok || !result.status) {
        this.logger.warn(
          `Paystack verification failed for ref: ${reference}. Message: ${result.message}`
        );
        return null;
      }

      // result.data contains: status, amount, metadata, customer, etc.
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        const errorStack = error instanceof Error ? error.stack : undefined;

        this.logger.error(
            `Network error during Paystack verification for ref: ${reference}: ${errorMessage}`,
            errorStack
        );
        throw new InternalServerErrorException('Failed to communicate with Paystack');
    }
  }
}