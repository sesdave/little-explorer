import { Sex } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateChildDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsOptional()
  lastName!: string;

  @IsDateString()
  dob!: string;

  @IsEnum(Sex)
  sex!: Sex;

  @IsOptional()
  @IsString()
  allergies?: string;
}