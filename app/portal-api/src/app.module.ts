import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static'; // 👈 Add this
import { join } from 'path'; // 👈 Add this
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { AdminModule } from './admin/admin.module';
import { ClassModule } from './class/class.module';
import { CommunicationModule } from './communication/communication.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { FamilyModule } from './family/family.module';
import { PrismaModule } from './prisma/prisma.module';
import { S3Module } from './s3/s3.module';
import { SessionModule } from './session/session.module';
import { UserModule } from './user/user.module';
// ... your other imports

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', }),
    // 🏛️ Add this to serve your React Frontend
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'), 
      exclude: ['/api/(.*)'], // 👈 Prevents frontend from intercepting API calls
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 3600,
      max: 100,
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
    S3Module,
  ],
})
export class AppModule {}