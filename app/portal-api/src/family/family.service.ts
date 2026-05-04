import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { SessionRepository } from '../session/session.repository';
import { UserRepository } from '../user/user.repository';
import { EnrollmentRepository } from 'src/enrollment/enrollment.repository';

// 1. Define a specific type for the return data to ensure TS 
// knows exactly what 'children' contains.
export type DashboardData = Prisma.UserGetPayload<{
  select: {
    name: true;
    children: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        photoUrl: true;
        dob: true;
        createdAt: true;
        parentId: true;
      };
    };
  };
}>;

@Injectable()
export class FamilyService {
  constructor(private prisma: PrismaService, 
    private readonly userRepo: UserRepository,    // 👈 Injected
    private readonly sessionRepo: SessionRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}

  /**
   * Fetches dashboard data using a flat 'select' for better performance
   * than a nested 'include' when dealing with specific fields.
   */
  async getDashboardData(userId: string) {
    const [userData, activeSession, recentPayments] = await Promise.all([
      // 🏛️ Update: ensure this includes registration status for the active session check
      this.userRepo.findUserWithChildren(userId), 
      this.sessionRepo.getActiveSessionWithClasses(),
      this.userRepo.findRecentPayments(userId), // 👈 New fetch
    ]);

    if (!userData) {
      throw new NotFoundException(`User profile not found for ID: ${userId}`);
    }

    const pendingApplication = activeSession
    ? await this.enrollmentRepo.findPendingApplication(
        userId,
        activeSession.id
      )
    : null;


    if (!userData) {
      throw new NotFoundException(`User profile not found for ID: ${userId}`);
    }

    // We sum up confirmed spots for the current active session
    // const activeRegistrationsCount = userData.children.reduce((acc, child) => {
    //   // Note: ensure your repository includes registrations in findUserWithChildren
    //   const confirmedCount = (child as any).registrations?.filter(
    //     (r: any) => r.sessionId === activeSession?.id && r.status === 'CONFIRMED'
    //   ).length || 0;
    //   return acc + confirmedCount;
    // }, 0);

    const enrollmentStats = userData.children.reduce((acc, child) => {
    const regs = (child as any).registrations || [];
    
    // Filter by the current active session
    const activeRegs = regs.filter((r: any) => r.sessionId === activeSession?.id);

    acc.confirmed += activeRegs.filter((r: any) => r.status === 'CONFIRMED').length;
    acc.provisional += activeRegs.filter((r: any) => r.status === 'PROVISIONAL').length;
    
    return acc;
  }, { confirmed: 0, provisional: 0 });

    return {
      parentName: userData.name,
      children: userData.children,
      email: userData.email, // 👈 Useful to have for the VerificationGate
      isEmailVerified: userData.isEmailVerified,
      session: activeSession ? { id: activeSession.id, name: activeSession.name, pricePerClass: activeSession.pricePerClass } : null,
      recentPayments, 
      activeRegistrations: enrollmentStats.confirmed + enrollmentStats.provisional,
      availableClasses: this.enrichClasses(activeSession?.classes || []),
      pendingApplication,
    };
  }

  /**
   * Helper to append derived business logic to classes
   */
  private enrichClasses(classes: any[]) {
    return classes.map((c) => ({
      ...c,
      isFull: c._count.registrations >= c.capacity,
      spotsLeft: Math.max(0, c.capacity - c._count.registrations),
    }));
  }

  /**
   * Creates a child record. 
   * Note: We use 'Prisma.ChildCreateInput' to keep types in sync with the schema.
   */
  async createChild(parentId: string, data: { 
    firstName: string; 
    lastName: string; 
    dob: string; 
    photoUrl?: string 
  }) {
    return this.prisma.child.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        dob: new Date(data.dob),
        photoUrl: data.photoUrl,
        // Connect notation is cleaner and more "Prisma-native"
        parent: {
          connect: { id: parentId }
        }
      },
    });
  }
}