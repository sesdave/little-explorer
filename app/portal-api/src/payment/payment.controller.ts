// src/modules/payment/payment.controller.ts
import { Controller, Post, Get, Body, Headers, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Public Webhook for Paystack
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    console.log("got a paystack response")//http://18.145.52.208/api/v1/payments/webhook
    // We pass both to the service. The service handles verification + processing.
    await this.paymentService.handlePaystackWebhook(payload, signature);
    return { received: true };
  }

  /**
   * Endpoint for Frontend Polling
   * GET /v1/payments/verify/T12345
   */
  @Get('verify/:reference')
  async verifyStatus(@Param('reference') reference: string) {
    const status = await this.paymentService.getStatusByReference(reference);
    return { status };
  }
}