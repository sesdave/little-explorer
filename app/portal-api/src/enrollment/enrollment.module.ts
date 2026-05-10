// src/modules/enrollment/enrollment.module.ts
import { Module } from '@nestjs/common';
import { EnrollmentController } from './enrollment.controller';
import { RegistrationService } from './registration.service';
import { EnrollmentRepository } from './enrollment.repository';
import { SessionModule } from '../session/session.module';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    SessionModule,
    UserModule,
  ],
  controllers: [EnrollmentController],
  providers: [
    RegistrationService,
    EnrollmentRepository,
  ],
  exports: [
    RegistrationService, 
    EnrollmentRepository // 👈 ADD THIS: Allows PaymentModule to use it
  ],
})
export class EnrollmentModule {}