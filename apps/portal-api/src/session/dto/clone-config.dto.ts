import { IsString, IsNotEmpty, IsDateString, IsBoolean, IsOptional, IsNumber, Min, IsInt } from 'class-validator';

export class CloneConfigDto {
  @IsString()
  @IsNotEmpty()
  newName!: string; // The name for the new session copy

  @IsDateString()
  @IsNotEmpty()
  startDate!: string; 

  @IsDateString()
  @IsNotEmpty()
  endDate!: string; 

  @IsBoolean()
  @IsOptional()
  cloneClasses: boolean = true; // Whether to copy all associated class templates

  @IsBoolean()
  @IsOptional()
  adjustPricing: boolean = false; // Placeholder if you want to apply a % increase

  @IsNumber()
  @Min(0)
  pricePerClass!: number; // 👈 Missing in your current attempt
  
  @IsInt()
  @Min(1)
  maxCapacity!: number;
}