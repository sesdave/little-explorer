import { Module } from '@nestjs/common';
import { ClassService } from './class.service';
import { ClassRepository } from './class.repository';
import { ClassController } from './class.controller';
import { SessionModule } from '../session/session.module'; // 👈 Import Session logic
import { UserModule } from '../user/user.module';       // 👈 Import for Instructor checks
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    SessionModule, // Allows ClassService to inject SessionRepository
    UserModule     // Allows ClassService to inject UserRepository
  ],
  controllers: [ClassController],
  providers: [ClassService, ClassRepository],
  exports: [ClassService],
})
export class ClassModule {}