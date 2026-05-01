import { 
  IsString, IsNotEmpty, IsUUID, IsInt, 
  Min, Max, IsArray, ValidateNested, IsOptional, IsNumber 
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;

  @IsInt()
  @Min(1)
  capacity!: number; // Changed 'Int' to 'number'

  @IsInt()
  @Min(0)
  ageMin!: number;

  @IsInt()
  @Max(18)
  ageMax!: number;

  @IsArray()
  @IsUUID('4', { each: true }) // Ensures every string in the array is a UUID v4
  @IsOptional()
  instructorIds: string[] = [];

  @IsNumber()
  @Min(0)
  @IsOptional()
  price!: number;
}

// Bulk creation DTO for high-efficiency setup
export class BulkCreateClassDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClassDto)
  classes!: CreateClassDto[];
}