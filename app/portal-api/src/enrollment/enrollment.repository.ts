// src/modules/enrollment/enrollment.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentPlan, RegistrationStatus } from '@prisma/client';

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
        status: {
          in: ['PENDING', 'PARTIALLY_PAID'],
        }
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

async secureBatchRegistration(
  applicationId: string,
  placements: { childId: string; classId: string }[],
  sessionId: string,
) {
  
  return this.prisma.$transaction(async (tx) => {

  const existingRegistrations =
    await tx.registration.findMany({
      where: { applicationId },
    });

    for (const reg of existingRegistrations) {
      await tx.class.update({
        where: {
          id: reg.classId,
        },
        data: {
          registrationsCount: {
            decrement: 1,
          },
        },
      });
    }

    await tx.registration.deleteMany({
      where: { applicationId },
    });

    for (const placement of placements) {

      // 🔒 STEP 1: Lock row for safe read-modify-write
      const cls: any[] = await tx.$queryRaw`
        SELECT id, name, capacity, "registrationsCount"
        FROM "Class"
        WHERE id = ${placement.classId}
        FOR UPDATE
      `;

      const classData = cls[0];

      if (!classData) {
        throw new Error('Class not found');
      }

      const available =
        classData.capacity - classData.registrationsCount;

      if (available <= 0) {
        throw new Error(
          `Class "${classData.name}" is full. Please try another option.`,
        );
      }

      // 🔒 STEP 2: Safe increment (inside locked row)
      await tx.class.update({
        where: { id: placement.classId },
        data: {
          registrationsCount: {
            increment: 1,
          },
        },
      });

      // 🔒 STEP 3: Create registration
      await tx.registration.create({
        data: {
          applicationId,
          sessionId,
          childId: placement.childId,
          classId: placement.classId,
          status: 'PROVISIONAL',
        },
      });
    }
  });
}

async markApplicationCompleted(
  applicationId: string,
  tx?: any,
) {
  const client = tx || this.prisma;

  return client.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status: 'COMPLETED',
    },
  });
}

async markApplicationPartiallyPaid(
  applicationId: string,
  tx?: any,
) {
  const client = tx || this.prisma;

  return client.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status: 'PARTIALLY_PAID',
    },
  });
}

async markApplicationPending(
  applicationId: string,
  tx?: any,
) {
  const client = tx || this.prisma;

  return client.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status: 'PENDING',
    },
  });
}

async confirmRegistrations(
  applicationId: string,
  tx?: any,
) {
  const client = tx || this.prisma;

  return client.registration.updateMany({
    where: {
      applicationId,
    },
    data: {
      status: 'CONFIRMED',
    },
  });
}

async revertRegistrationsToProvisional(
  applicationId: string,
  tx?: any,
) {
  const client = tx || this.prisma;

  return client.registration.updateMany({
    where: {
      applicationId,
    },
    data: {
      status: 'PROVISIONAL',
    },
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

  async findPendingApplication(userId: string, sessionId: string) {
    return await this.prisma.application.findFirst({
      where: {
        parentId: userId,
        sessionId,
        status: {
          in: ['PENDING', 'PARTIALLY_PAID'],
        },
      },
      include: {
        payments: true,
        registrations: true,
      },
    });
  }

  async findApplicationById(id: string) {
    const application = await this.prisma.application.findFirst({
      where: { id },
      include: {
        payments: true,
        registrations: true,
        parent: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!application) return null;

    // 🎯 Shape response for frontend (important)
    return {
      ...application,
      userEmail: application.parent.email,
    };
}

  async findRegisteredChild(session: any, childId: string){
    const child = await this.prisma.child.findUnique({
        where: { id: childId },
        include: {
          registrations: {
            where: {
              sessionId: session.id,
              status: { in: ["PROVISIONAL", "CONFIRMED"] },
            },
            include: {
              class: true,
            },
          },
        },
      });

      return child;
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

  async findApplicationForCancellation(applicationId: string) {
    return this.prisma.application.findUnique({
      where: { id: applicationId },

      include: {
        payments: true,

        registrations: {
          include: {
            class: true,
          },
        },
      },
    });
  }

   async cancelApplicationTransaction(
  applicationId: string,
  registrations: any[],
) {
  return this.prisma.$transaction(async (tx) => {

    const classIds = registrations.map(
      (r) => r.classId,
    );

    // Lock affected rows
    await tx.$queryRaw`
      SELECT id
      FROM "Class"
      WHERE id = ANY(${classIds})
      FOR UPDATE
    `;

    // Cancel registrations
    await tx.registration.updateMany({
      where: {
        applicationId,
      },

      data: {
        status: RegistrationStatus.CANCELLED,
      },
    });

    // Release occupied seats
    for (const registration of registrations) {
      await tx.class.update({
        where: {
          id: registration.classId,
        },

        data: {
          registrationsCount: {
            decrement: 1,
          },
        },
      });
    }

    // Cancel application
    await tx.application.update({
      where: {
        id: applicationId,
      },

      data: {
        status: 'CANCELLED',
      },
    });
  });
}
}