// src/dismissal-contact/dismissal-contact.service.ts

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDismissalContactDto } from '../dto/create-dismissal-contact.dto';
import { UpdateDismissalContactDto } from '../dto/update-dismissal-contact.dto';
import { DismissalContactRepository } from '../repository/dismissal-contact.repository';


@Injectable()
export class DismissalContactService {
  constructor(
    private readonly repository: DismissalContactRepository,
  ) {}

  async getContacts(parentId: string) {
    return this.repository.findByParent(parentId);
  }

  async createContact(
    parentId: string,
    dto: CreateDismissalContactDto,
  ) {
    return this.repository.create(parentId, dto);
  }

  async updateContact(
    id: string,
    parentId: string,
    dto: UpdateDismissalContactDto,
  ) {
    return this.repository.update(id, parentId, dto);
  }

  async deleteContact(id: string, parentId: string) {
    return this.repository.delete(id, parentId);
  }
}