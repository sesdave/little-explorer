// src/dismissal-contact/dto/create-dismissal-contact.dto.ts

import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDismissalContactDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsString()
  @MaxLength(120)
  relationship!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}