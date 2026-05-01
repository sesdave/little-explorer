import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy'; // 👈 Import this!
import { CommunicationModule } from '../communication/communication.module';

@Module({
  imports: [
    CommunicationModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), 
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  // 👈 MUST export these so other modules (like FamilyModule) can use them
  exports: [AuthService, PassportModule, JwtStrategy], 
})
export class AuthModule {}