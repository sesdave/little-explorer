// apps/api/src/communication/communication.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import twilio from 'twilio';
import sgMail from '@sendgrid/mail';

@Injectable()
export class CommunicationService {
  private twilioClient: twilio.Twilio;

  constructor() {
    const twilioSid = process.env.TWILIO_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const sendGridKey = process.env.SENDGRID_API_KEY;

    // 🏛️ Validate that keys exist before initializing
    if (!twilioSid || !twilioAuthToken || !sendGridKey) {
      throw new InternalServerErrorException(
        'Missing Communication Provider Credentials (Twilio/SendGrid)',
      );
    }

    // Now TypeScript knows these are strings, not undefined
    this.twilioClient = twilio(twilioSid, twilioAuthToken);
    sgMail.setApiKey(sendGridKey);
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const msg = {
      to: email,
      //from: 'noreply@littleexplorer.com', // Must be a verified sender in SendGrid
      from: 'sesughdtyohemba@gmail.com',
      subject: 'Verify your Explorer Account',
      html: `<strong>Welcome!</strong><br>Click <a href="${url}">here</a> to verify your email.`,
    };

    try {
      await sgMail.send(msg);
    } catch (error: unknown) {
      if (error instanceof Error && (error as any).response) {
        const sgError = error as any;
        console.error("SendGrid Error Details:", JSON.stringify(sgError.response.body, null, 2));
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  }
}