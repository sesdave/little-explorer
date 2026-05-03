import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path as needed
import { Class, SessionStatus } from '@prisma/client';
import { CloneConfigDto, CreateSessionDto } from './dto';

@Injectable()
export class SessionRepository {
  constructor(private prisma: PrismaService) {}

  // Inside session.repository.ts
async create(data: CreateSessionDto & { status: SessionStatus; isActive: boolean }) {
  return this.prisma.session.create({
    data: {
      ...data,
      // Map strings to Dates if the DTO doesn't do it automatically
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  });
}

async findById(id: string) {
  return this.prisma.session.findUnique({ where: { id } });
}

  /**
   * Used by cloning logic to get class "blueprints" from a previous term.
   */
  async findClassesBySession(sessionId: string) {
    return this.prisma.class.findMany({
      where: { sessionId },
      select: {
        name: true,
        capacity: true,
        price: true,
        instructorId: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        // 💡 We explicitly SELECT fields to avoid copying IDs or old Timestamps
      }
    });
  }

  /**
   * The "O(1)" Bulk Clone.
   * Creates the session and all its classes in one database trip.
   */
  async createSessionWithClasses(config: CloneConfigDto, templates: any[]) {
  return this.prisma.session.create({
    data: {
      name: config.newName,
      startDate: new Date(config.startDate),
      endDate: new Date(config.endDate),
      status: SessionStatus.DRAFT,
      isActive: false,

      // 🚀 ADD THESE TWO FIELDS:
      // Assuming they are passed in your 'config' or 'templates'
      pricePerClass: config.pricePerClass || 0, 
      maxCapacity: config.maxCapacity || 0,

      classes: {
        createMany: {
          data: templates.map(t => ({
            name: t.name,
            capacity: t.capacity,
            ageMin: t.ageMin,
            ageMax: t.ageMax,
            instructorIds: t.instructorIds,
            price: t.price,
            clonedFromId: t.id,
          }))
        }
      }
    },
    include: {
      _count: { select: { classes: true } }
    }
  });
}
  /**
   * Promotes a session and ensures system-wide atomicity.
   */
  async setGlobalActive(id: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');

    const [_, updatedSession] = await this.prisma.$transaction([
      this.prisma.session.updateMany({ 
        where: { isActive: true }, 
        data: { isActive: false } 
      }),
      this.prisma.session.update({ 
        where: { id }, 
        data: { 
          isActive: true, 
          status: SessionStatus.ACTIVE
        } 
      })
    ]);

    return updatedSession;
  }

  async findActive() {
    return this.prisma.session.findFirst({
      where: { isActive: true },
      include: {
        classes: {
          where: { isVisible: true }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.session.findMany({
      orderBy: { startDate: 'desc' },
      include: { _count: { select: { classes: true } } }
    });
  }

  async findActiveRegistration() {
    return this.prisma.session.findFirst({
      where: { isActive: true, status: SessionStatus.ACTIVE },
      select: { id: true }
    });
  }

  // async findClassesBySessionId(sessionId: string): Promise<Class[]> {
  //   return this.prisma.class.findMany({
  //     where: { sessionId },
  //     orderBy: { createdAt: 'asc' },
  //   });
  // }

  /**
   * Retrieves the current operational session with age-graded classes.
   * Logic: Returns the first session marked as ACTIVE or REGISTRATION_OPEN.
   */
  async getActiveSessionWithClasses() {
    return this.prisma.session.findFirst({
      where: {
        status: { in: ['ACTIVE', 'REGISTRATION_OPEN'] },
      },
      select: {
        id: true,
        name: true,
        status: true,
        pricePerClass: true,
        classes: {
          select: {
            id: true,
            name: true,
            ageMin: true,
            ageMax: true,
            capacity: true,
            _count: {
              select: { registrations: true },
            },
          },
        },
      },
    });
  }

  async findClassesBySessionId(sessionId: string) {
  return this.prisma.class.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true, // 👈 keep backend consistent
      capacity: true,
      _count: {
        select: { registrations: true },
      },
    },
  });
}
}