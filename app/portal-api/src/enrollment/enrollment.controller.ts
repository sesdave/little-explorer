// src/modules/enrollment/enrollment.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RegistrationService } from './registration.service';
import { BulkRegisterDto } from './dto/bulk-register.dto';

@Controller('registrations')
@UseGuards(JwtAuthGuard)
export class EnrollmentController {
  constructor(private readonly registrationService: RegistrationService) {}

  /**
   * Endpoint: POST /registrations/bulk
   * Handles multi-child registration, spot securing, and resumable sessions.
   */
  @Post('bulk')
  async registerBatch(
    @CurrentUser('id') userId: string,
    @Body() dto: BulkRegisterDto,
  ) {
    return await this.registrationService.handleBulkRegistration(userId, dto);
  }

  @Get('applications/pending/:sessionId')
  async getPendingApplication(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string
  ) {
    
    const application = await this.registrationService.findPendingApplication(
      sessionId
    );
    console.log("entered application", sessionId, application);
    return {success: true, data: application };
  }
}