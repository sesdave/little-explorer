// src/dismissal-contact/dto/update-dismissal-contact.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateDismissalContactDto } from './create-dismissal-contact.dto';

export class UpdateDismissalContactDto extends PartialType(
  CreateDismissalContactDto,
) {}