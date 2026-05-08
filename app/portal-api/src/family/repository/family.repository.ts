// src/parent/parent.service.ts

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { SessionRepository } from 'src/session/session.repository';

@Injectable()
export class FamilyRepository {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async getAssignedClasses(
    userId: string,
    sessionId: string
  ) {
    
    const children =
      await this.prisma.child.findMany({
        where: {
          parentId: userId,
        },

        select: {
          id: true,
          firstName: true,
          lastName: true,
          photoUrl: true,

          registrations: {
            where: {
              sessionId,
            },

            select: {
              id: true,
              status: true,
              createdAt: true,

              class: {
                select: {
                  id: true,
                  name: true,
                  capacity: true,
                  registrationsCount: true,
                  ageMin: true,
                  ageMax: true,
                  isVisible: true,
                },
              },
            },
          },
        },

        orderBy: {
          firstName: 'asc',
        },
      });

    return children;
  }
}