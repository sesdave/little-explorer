// apps/api/src/family/family.module.ts
import { Module } from '@nestjs/common';
import { FamilyController } from './controllers/family.controller';
import { FamilyService } from './services/family.service';
import { AuthModule } from '../auth/auth.module';
import { S3Module } from '../s3/s3.module';
import { UserRepository } from '../user/user.repository';
import { SessionRepository } from '../session/session.repository';
import { EnrollmentRepository } from 'src/enrollment/enrollment.repository';
import { DismissalContactController } from './controllers/dismissal-contact.controller';
import { DismissalContactService } from './services/dismissal-contact.service';
import { DismissalContactRepository } from './dismissal-contact.repository';

@Module({
  imports: [AuthModule, S3Module],
  controllers: [FamilyController, DismissalContactController],
  providers: [
    FamilyService, 
    UserRepository,    // 👈 REGISTER HERE
    SessionRepository,  // 👈 Ensure this is here too
    EnrollmentRepository,
    DismissalContactService,
    DismissalContactRepository,
  ],
})
export class FamilyModule {}