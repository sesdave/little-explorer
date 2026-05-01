import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // 👈 Load environment variables
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module'; 
import { FamilyModule } from './family/family.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ClassModule } from './class/class.module';
import { SessionModule } from './session/session.module';
import { S3Module } from './s3/s3.module'; // 👈 Import your new S3 module
import { UserModule } from './user/user.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { AdminModule } from './admin/admin.module';
import { CommunicationModule } from './communication/communication.module';

@Module({
  imports: [
    // isGlobal: true makes ConfigService available everywhere without re-importing
    ConfigModule.forRoot({ isGlobal: true }), 
    // 🚀 Register the Cache Module
    CacheModule.register({
      isGlobal: true,    // Makes CACHE_MANAGER available everywhere
      ttl: 3600,         // Default time-to-live in seconds (1 hour)
      max: 100,          // Maximum number of items in cache
    }),
    AuthModule, 
    PrismaModule, 
    FamilyModule,
    ClassModule,
    SessionModule,
    UserModule,
    AdminModule,
    EnrollmentModule,
    CommunicationModule,
    S3Module, // 👈 Add this so the S3 logic is registered
  ],
})
export class AppModule {}