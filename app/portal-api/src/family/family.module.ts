// apps/api/src/family/family.module.ts
import { Module } from '@nestjs/common';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';
import { AuthModule } from '../auth/auth.module';
import { S3Module } from '../s3/s3.module';
import { UserRepository } from '../user/user.repository';
import { SessionRepository } from '../session/session.repository';
import { EnrollmentRepository } from 'src/enrollment/enrollment.repository';

@Module({
  imports: [AuthModule, S3Module],
  controllers: [FamilyController],
  providers: [
    FamilyService, 
    UserRepository,    // 👈 REGISTER HERE
    SessionRepository,  // 👈 Ensure this is here too
    EnrollmentRepository
  ],
})
export class FamilyModule {}