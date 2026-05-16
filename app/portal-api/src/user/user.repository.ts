import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, User } from '@prisma/client';
import { userWithDismissalSelect } from 'src/family/dto/UserWithChildren';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- Read Methods (Your Original Code) ---

  async countValidInstructors(ids: string[]): Promise<number> {
    return this.prisma.user.count({
      where: {
        id: { in: ids },
        role: UserRole.INSTRUCTOR,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findInstructorsByIds(ids: string[]) {
    return this.prisma.user.findMany({
      where: {
        id: { in: ids },
        role: UserRole.INSTRUCTOR,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async findAllInstructors() {
    return this.prisma.user.findMany({
      where: { role: UserRole.INSTRUCTOR },
      orderBy: { name: 'asc' },
    });
  }

  // --- Write Methods (The New Additions) ---

  async update(id: string, data: Partial<User>) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        // 🔐 Password excluded by not being in this select list
      },
    });
  }

  /**
   * Retrieves a parent user along with their children.
   * staff-level note: We use a specific projection to keep the payload lean.
   */
  // async findUserWithChildren(userId: string) {
  //   return this.prisma.user.findUnique({
  //     where: { id: userId },
  //     select: {
  //       name: true,
  //       children: {
  //         select: { 
  //           id: true, 
  //           firstName: true, 
  //           lastName: true, 
  //           photoUrl: true, 
  //           dob: true 
  //         },
  //         orderBy: { firstName: 'asc' },
  //       },
  //     },
  //   });
  // }

  // apps/api/src/user/user.repository.ts

  // apps/api/src/user/user.repository.ts

async findRecentPayments(userId: string, limit: number = 20) {
  const payments = await this.prisma.payment.findMany({
    where: {
      OR: [
        { application: { parentId: userId } },
        { donation: { userId: userId } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      amount: true,
      extra_amount: true, 
      status: true,
      method: true,
      type: true, 
      externalReference: true,        
      createdAt: true,
      donation: {
        select: { donorName: true, message: true },
      },
      application: {
        select: {
          session: { select: { name: true } }
        }
      }
    },
  });

  // 🛠️ Combine them here before returning to the service layer
  return payments.map(payment => {
    const base = Number(payment.amount || 0);
    const extra = Number(payment.extra_amount || 0);

    return {
      ...payment,
      amount: base + extra, // Overwrites the 'amount' field with the sum total
    };
  });
}

/*async findRecentPayments(userId: string, limit: number = 5) {
  return this.prisma.payment.findMany({
    where: {
      application: {
        parentId: userId, // 👈 This is how you "reach" the user from a payment
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      amount: true,
      status: true,
      method: true,
      createdAt: true,
      // Optional: Get the session name associated with this payment
      application: {
        select: {
          session: { select: { name: true } }
        }
      }
    },
  });
}*/

// apps/api/src/user/user.repository.ts

async findUserWithChildren(userId: string) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    select:  userWithDismissalSelect,
  });
}
}