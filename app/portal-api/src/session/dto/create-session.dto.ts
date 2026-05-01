
import { SessionStatus } from '@prisma/client';
import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber, Min, IsInt, IsEnum } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  name!: string; // e.g., "Winter Term 2026"

  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  pricePerClass!: number; // 👈 Missing in your current attempt

  @IsInt()
  @Min(1)
  maxCapacity!: number;

  @IsEnum(SessionStatus)
  status!: SessionStatus;
}