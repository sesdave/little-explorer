import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { CacheModule } from '@nestjs/cache-manager';

import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ClassModule } from './class/class.module';
import { CommunicationModule } from './communication/communication.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { FamilyModule } from './family/family.module';
import { PrismaModule } from './prisma/prisma.module';
import { S3Module } from './s3/s3.module';
import { SessionModule } from './session/session.module';
import { UserModule } from './user/user.module';
import { SpaModule } from './spa/spa.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    // Global env config
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Serve React build
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      serveStaticOptions: {
        index: 'index.html',
      },
    }),

    // Cache
    CacheModule.register({
      isGlobal: true,
      ttl: 3600,
      max: 100,
    }),

    // Core modules
    PrismaModule,
    AuthModule,
    FamilyModule,
    ClassModule,
    SessionModule,
    UserModule,
    AdminModule,
    EnrollmentModule,
    CommunicationModule,
    S3Module,
    PaymentModule,

    // SPA fallback (React Router support)
    SpaModule,
  ],
})
export class AppModule {}