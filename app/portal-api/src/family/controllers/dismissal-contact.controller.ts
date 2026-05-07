// src/dismissal-contact/dismissal-contact.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard';
import { DismissalContactService } from '../services/dismissal-contact.service';
import { CreateDismissalContactDto } from '../dto/create-dismissal-contact.dto';
import { UpdateDismissalContactDto } from '../dto/update-dismissal-contact.dto';

@Controller('dismissal-contacts')
@UseGuards(JwtAuthGuard)
export class DismissalContactController {
  constructor(
    private readonly service: DismissalContactService,
  ) {}

  @Get()
  async getContacts(@Req() req: any) {
    return this.service.getContacts(req.user.id);
  }

  @Post()
  async create(
    @Req() req: any,
    @Body() dto: CreateDismissalContactDto,
  ) {
    return this.service.createContact(req.user.id, dto);
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDismissalContactDto,
  ) {
    return this.service.updateContact(id, req.user.id, dto);
  }

  @Delete(':id')
  async remove(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.service.deleteContact(id, req.user.id);
  }
}