import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateClassDto, CreateClassDto } from './dto';

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
}