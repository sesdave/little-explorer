// src/modules/enrollment/enrollment.module.ts
import { Module } from '@nestjs/common';
import { EnrollmentController } from './enrollment.controller';
import { RegistrationService } from './registration.service';
import { EnrollmentRepository } from './enrollment.repository';
import { SessionModule } from '../session/session.module'; // To access SessionRepository
import { UserModule } from '../user/user.module';       // To access UserRepository
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
  exports: [RegistrationService], // Export if other modules need to trigger registrations
})
export class EnrollmentModule {}