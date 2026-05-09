import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Sex } from '@prisma/client';
import { SessionRepository } from '../../session/session.repository';
import { UserRepository } from '../../user/user.repository';
import { EnrollmentRepository } from 'src/enrollment/enrollment.repository';
import { UserWithDismissalSelect } from '../dto/UserWithChildren';
import { FamilyRepository } from '../repository/family.repository';

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
    private readonly familyRepo: FamilyRepository,
  ) {}

  /**
   * Fetches dashboard data using a flat 'select' for better performance
   * than a nested 'include' when dealing with specific fields.
   */
   async getDashboardData(userId: string) {
  const [userData, activeSession, recentPayments] = await Promise.all([
    this.userRepo.findUserWithChildren(userId),
    this.sessionRepo.getActiveSessionWithClasses(),
    this.userRepo.findRecentPayments(userId),
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

  // ✅ CLEAN domain logic
  const enrollmentStats = await this.computeEnrollmentStats(
    userData.children,
    activeSession?.id
  );

  return {
    parentName: userData.name,
    email: userData.email,
    isEmailVerified: userData.isEmailVerified,

    children: userData.children,

    session: activeSession
      ? {
          id: activeSession.id,
          name: activeSession.name,
          pricePerClass: activeSession.pricePerClass,
          isClassVisible: activeSession.isClassVisible,
          theme: activeSession.theme
        }
      : null,

    recentPayments,

    dismissalContacts: userData.dismissalContacts,

    activeRegistrations:
      enrollmentStats.confirmed + enrollmentStats.provisional,

    enrollmentBreakdown: enrollmentStats, // 👈 NEW (very useful UI-wise)

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
    sex: Sex; 
    photoUrl?: string 
  }) {
    return this.prisma.child.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        sex: data.sex,
        dob: new Date(data.dob),
        photoUrl: data.photoUrl,
        // Connect notation is cleaner and more "Prisma-native"
        parent: {
          connect: { id: parentId }
        }
      },
    });
  }

  async getAssignedClasses(
    userId: string,
  ) {
    const activeSession =
      await this.sessionRepo.getActiveSession()

    if (!activeSession) {
      throw new NotFoundException(
        'No active session found',
      );
    }

    const children =
      await this.familyRepo.getAssignedClasses(userId, activeSession.id)

    return {
      session: activeSession,
      children,
    };
  }

  private computeEnrollmentStats(
    children:  UserWithDismissalSelect['children'],
    sessionId?: string
  ) {
    if (!sessionId) {
      return { confirmed: 0, provisional: 0 };
    }

    return children.reduce(
      (acc, child) => {
        for (const reg of child.registrations) {
          if (reg.sessionId !== sessionId) continue;

          if (reg.status === 'CONFIRMED') acc.confirmed++;
          else if (reg.status === 'PROVISIONAL') acc.provisional++;
        }
        return acc;
      },
      { confirmed: 0, provisional: 0 }
    );
  }
}