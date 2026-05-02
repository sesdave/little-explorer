// src/modules/enrollment/enrollment.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentPlan } from '@prisma/client';

@Injectable()
export class EnrollmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resumes or Creates a pending application.
   * This ensures the parent doesn't lose progress.
   */
  async findOrCreateApplication(userId: string, sessionId: string, paymentPlan: PaymentPlan, totalAmount: number) {
    // Look for an existing pending application first
    const existing = await this.prisma.application.findFirst({
      where: { 
        parentId: userId, 
        sessionId, 
        status: 'PENDING' 
      }
    });

    if (existing) return existing;

    // Create a new one if not found
    return this.prisma.application.create({
      data: {
        parentId: userId,
        sessionId,
        paymentPlan,
        totalAmount,
        status: 'PENDING',
      },
    });
  }

  // src/modules/enrollment/enrollment.repository.ts

async secureBatchRegistration(applicationId: string, placements: { childId: string; classId: string; }[], sessionId: string) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Cleanup old provisional attempts for this specific application
    await tx.registration.deleteMany({ where: { applicationId } });

    for (const placement of placements) {
      // 2. Atomic check and increment
      // We use a specific update filter to prevent over-subscription
      const updatedClass = await tx.class.update({
        where: { id: placement.classId },
        data: { 
          // We increment the count we track (currentCapacity or similar)
          registrationsCount: { increment: 1 } 
        }
      });

      // 3. Post-increment safety check
      if (updatedClass.registrationsCount > updatedClass.capacity) {
        throw new Error(`The class ${updatedClass.name} just filled up. Please try again.`);
      }

      // 4. Link the child
      await tx.registration.create({
        data: {
          applicationId,
          sessionId,
          childId: placement.childId,
          classId: placement.classId,
          status: 'PROVISIONAL'
        }
      });
    }
  });
}

/**
   * Transitions an application and its registrations to confirmed status.
   * Accept an optional transaction client to maintain atomicity.
   */
  async confirmEnrollment(applicationId: string, tx?: any) {
    const client = tx || this.prisma;

    // 1. Update Application
    const application = await client.application.update({
      where: { id: applicationId },
      data: { status: 'COMPLETED' },
    });

    // 2. Confirm all Registrations
    await client.registration.updateMany({
      where: { applicationId },
      data: { status: 'CONFIRMED' },
    });

    return application;
  }

  /**
   * Atomic Transaction to secure spots for multiple children
   */
  /*async secureBatchRegistration(applicationId: string, registrations: any[]) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Clear previous attempts for this application to allow "Resuming" updates
      await tx.registration.deleteMany({ where: { applicationId } });

      // 2. Create new registrations and "hold" spots
      const results = [];
      for (const reg of registrations) {
        // We use an atomic update to decrement capacity safely
        const updatedClass = await tx.class.update({
          where: { id: reg.classId },
          data: { currentCapacity: { increment: 1 } },
        });

        if (updatedClass.currentCapacity > updatedClass.capacity) {
          throw new Error(`Class ${updatedClass.name} is now full.`);
        }

        const newReg = await tx.registration.create({
          data: {
            applicationId,
            childId: reg.childId,
            classId: reg.classId,
            status: 'PROVISIONAL', // Provisional until payment confirms
          },
        });
        results.push(newReg);
      }
      return results;
    });
  }*/
}