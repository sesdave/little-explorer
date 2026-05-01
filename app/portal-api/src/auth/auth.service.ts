import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
// 1. Import the error class specifically
//import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CommunicationService } from '../communication/communication.service';
import * as crypto from 'node:crypto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private comms: CommunicationService,
  ) {}

  async register(dto: RegisterDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          name: dto.name,
          verificationToken,
        },
      });
      this.comms.sendVerificationEmail(user.email, verificationToken);

      return this.signToken(user.id, user.email, user.role, user.isEmailVerified);
    } catch (error) {
      // 2. Change 'Prisma.PrismaClientKnownRequestError' to just 'PrismaClientKnownRequestError'
      // if the namespace check still fails, otherwise ensure npx prisma generate was run.
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Email already exists');
        }
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new ForbiddenException('Access Denied');

    const pwMatches = await bcrypt.compare(dto.password, user.password);
    if (!pwMatches) throw new ForbiddenException('Access Denied');

    return this.signToken(user.id, user.email, user.role, user.isEmailVerified);
  }

 async signToken(userId: string, email: string, role: string, isEmailVerified: boolean) {
  const payload = { sub: userId, email, role };
  const token = await this.jwt.signAsync(payload, {
    expiresIn: '7d', // Changed to 7d to match your AuthModule config
    secret: process.env.JWT_SECRET || 'super-secret',
  });

  return { 
    access_token: token,
    user: { id: userId, email, role, isEmailVerified } // 👈 Add this for your frontend
  };
}

async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { verificationToken: token }
    });

    if (!user) throw new BadRequestException('Invalid or expired token');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        isEmailVerified: true, 
        verificationToken: null // Clear token after use
      }
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerification(email: string) {
    // 1. Find the user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // 🏛️ SECURITY CHECK: 
    // If user doesn't exist OR is already verified, don't tell the caller.
    // This prevents account enumeration attacks.
    if (!user || user.isEmailVerified) {
      return { message: 'If an account exists, a new verification link has been sent.' };
    }

    // 2. Generate a fresh 32-byte hex token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 3. Update the database
    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    // 4. Dispatch the email (SendGrid)
    // We don't necessarily need to 'await' this if we want a faster response,
    // but awaiting ensures the user knows if the email provider failed.
    this.comms.sendVerificationEmail(user.email, verificationToken);


    return { message: 'Verification link resent successfully.' };
  }
}
