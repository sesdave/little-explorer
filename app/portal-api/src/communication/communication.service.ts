// apps/api/src/communication/communication.service.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import twilio from 'twilio';
import sgMail from '@sendgrid/mail';
import { verificationEmailTemplate } from './templates/verification-email.template';

@Injectable()
export class CommunicationService {
  private twilioClient?: twilio.Twilio;
  private readonly logger = new Logger(CommunicationService.name);
  private sendgridEnabled = false;

  constructor() {
    const twilioSid = process.env.TWILIO_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const sendGridKey = process.env.SENDGRID_API_KEY;

    // 🏛️ Validate that keys exist before initializing
    // if (!twilioSid || !twilioAuthToken || !sendGridKey) {
    //   throw new InternalServerErrorException(
    //     'Missing Communication Provider Credentials (Twilio/SendGrid)',
    //   );
    // }
    if (twilioSid && twilioAuthToken) {
      this.twilioClient = twilio(twilioSid, twilioAuthToken);
    } else {
      this.logger.warn('Twilio not configured (SMS disabled)');
    }

    if (sendGridKey) {
       sgMail.setApiKey(sendGridKey);
       this.sendgridEnabled = true;
    } else {
      this.logger.warn('SendGrid not configured (Email disabled)');
    }

    // Now TypeScript knows these are strings, not undefined
    // this.twilioClient = twilio(twilioSid, twilioAuthToken);
    // sgMail.setApiKey(sendGridKey);
  }
  async sendVerificationEmail(email: string, token: string, name: string) {
    const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    if (!this.sendgridEnabled) {
      this.logger.log(`[MOCK EMAIL] → ${email}: ${url}`);
      return;
    }

    const msg = {
      to: email,
      from: 'sesughdtyohemba@gmail.com',
      subject: 'Verify your Explorer Account',
      html: verificationEmailTemplate(url, name), // 👈 clean separation
    };

    await sgMail.send(msg);
  }

  // apps/api/src/communication/communication.service.ts

async sendBroadcastSMS(to: string, message: string) {
  if (!this.twilioClient) {
    this.logger.log(`[MOCK SMS] → ${to}: ${message}`);
    return;
  }

  const formattedNumber = to.startsWith('0') 
    ? `+234${to.slice(1)}` 
    : to.startsWith('+') ? to : `+234${to}`;

  try {
    await this.twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber,
    });
  } catch (error: unknown) {
    // 🛡️ Type Guard: Check if it's an Error object
    const errorMessage = error instanceof Error ? error.message : 'Unknown SMS Error';
    this.logger.error(`SMS Failed for ${formattedNumber}: ${errorMessage}`);
  }
}

async sendBroadcastEmail(to: string, subject: string, content: string) {
  if (!this.sendgridEnabled) {
    this.logger.log(`[MOCK EMAIL BROADCAST] → ${to}`);
    return;
  }

  const msg = {
    to,
    from: 'sesughdtyohemba@gmail.com',
    subject: subject,
    html: `<div style="font-family: sans-serif;">${content.replace(/\n/g, '<br>')}</div>`,
  };

  try {
    await sgMail.send(msg);
  } catch (error: unknown) {
    // 🛡️ Safe extraction of error message
    let errorMessage = 'Unknown Email Error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      // Handle specific SendGrid response errors if they exist
      const sgError = error as any;
      if (sgError.response?.body) {
        this.logger.error(`SendGrid Detail: ${JSON.stringify(sgError.response.body)}`);
      }
    }
    
    this.logger.error(`Failed broadcast email to ${to}: ${errorMessage}`);
  }
}
 }