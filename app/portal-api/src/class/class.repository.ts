import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateClassDto, CreateClassDto } from './dto';
import { calculateAge } from 'src/util/calculateAge';
import { ReassignDto } from './dto/reassign-class-dto';

@Injectable()
export class ClassRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateClassDto) {
    return this.prisma.class.create({ data });
  }

  async createMany(classes: CreateClassDto[]) {
    return this.prisma.class.createMany({
      data: classes,
      skipDuplicates: true,
    });
  }

  async findByIdWithCount(id: string) {
    return this.prisma.class.findUnique({
      where: { id },
      include: { _count: { select: { registrations: true } } },
    });
  }

  async findBySessionId(sessionId: string) {
    return this.prisma.class.findMany({
      where: { sessionId },
      include: { _count: { select: { registrations: true } } },
    });
  }

  async delete(id: string) {
    return this.prisma.class.delete({ where: { id } });
  }

  // apps/api/src/modules/class/class.repository.ts

async update(id: string, data: UpdateClassDto) {
  return this.prisma.class.update({
    where: { id },
    data,
  });
}

async findById(id: string) {
  return this.prisma.class.findUnique({ where: { id } });
}

async getClassAssignments(sessionId: string) {

  const classes = await this.prisma.class.findMany({
    where: {
      sessionId,   // ✅ FIX
      isVisible: true,
    },
    include: {
      registrations: {
        include: {
          child: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return classes.map((c) => ({
      id: c.id,
      name: c.name,
      capacity: c.capacity,
      registered: c.registrations.length,
      children: c.registrations.map((r) => ({
        childId: r.childId,
        name: `${r.child.firstName} ${r.child.lastName}`,
        status: r.status,
      })),
    }));
}

/*async reassignChild(dto: {
  childId: string;
  fromClassId: string;
  toClassId: string;
  sessionId: string;
}) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Check target class capacity
    const targetClass = await tx.class.findUnique({
      where: { id: dto.toClassId },
    });

    if (!targetClass) {
      throw new Error('Target class not found');
    }

    const current = await tx.registration.count({
      where: { classId: dto.toClassId, sessionId: dto.sessionId },
    });

    if (current >= targetClass.capacity) {
      throw new Error('Target class is full');
    }

    // 2. Update registration
    const updated = await tx.registration.updateMany({
      where: {
        childId: dto.childId,
        classId: dto.fromClassId,
        sessionId: dto.sessionId,
      },
      data: {
        classId: dto.toClassId,
      },
    });

    if (updated.count === 0) {
      throw new Error('Registration not found');
    }

    return { success: true };
  });
}*/

  async getReassignmentOptions(
  childId: string,
  sessionId: string,
  excludeClassId?: string
  ) {
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
    });

    const age = calculateAge(new Date(child!.dob));

    const classes = await this.prisma.class.findMany({
      where: {
        sessionId,
        isVisible: true,
        id: excludeClassId ? { not: excludeClassId } : undefined, // 👈 key fix
        ageMin: { lte: age },
        ageMax: { gte: age },
      },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    return classes.map((c) => ({
      id: c.id,
      name: c.name,
      capacity: c.capacity,
      registered: c._count.registrations,
      availableSpots: c.capacity - c._count.registrations,
      isFull: c._count.registrations >= c.capacity,
    }));
  }

  // admin.service.ts
async reassignChild({childId, newClassId}: ReassignDto) {
  return this.prisma.$transaction(async (tx) => {

    // 1. Find current registration
    const existing = await tx.registration.findFirst({
      where: { childId },
    });

    if (!existing) {
      throw new Error("Child not assigned");
    }

    if (existing.classId === newClassId) {
      return existing; // no-op
    }

    // 2. Check capacity
    const targetClass = await tx.class.findUnique({
      where: { id: newClassId },
    });

    if (!targetClass) throw new Error("Class not found");

    if (targetClass.registrationsCount >= targetClass.capacity) {
      throw new Error("Target class is full");
    }

    // 3. Update counts
    await tx.class.update({
      where: { id: existing.classId },
      data: { registrationsCount: { decrement: 1 } },
    });

    await tx.class.update({
      where: { id: newClassId },
      data: { registrationsCount: { increment: 1 } },
    });

    // 4. Move registration
    return tx.registration.update({
      where: { id: existing.id },
      data: { classId: newClassId },
    });
  });
}
}