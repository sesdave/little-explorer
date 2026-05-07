// src/dismissal-contact/dismissal-contact.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDismissalContactDto,
} from './dto/create-dismissal-contact.dto';

@Injectable()
export class DismissalContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByParent(parentId: string) {
    return this.prisma.dismissalContact.findMany({
      where: { userId: parentId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(parentId: string, data: CreateDismissalContactDto) {
    return this.prisma.dismissalContact.create({
      data: {
        userId: parentId,
        ...data,
      },
    });
  }

  async update(
    id: string,
    parentId: string,
    data: Partial<CreateDismissalContactDto>,
  ) {
    return this.prisma.dismissalContact.update({
      where: {
        id,
        parentId,
      },
      data,
    });
  }

  async delete(id: string, parentId: string) {
    return this.prisma.dismissalContact.delete({
      where: {
        id,
        parentId,
      },
    });
  }
}