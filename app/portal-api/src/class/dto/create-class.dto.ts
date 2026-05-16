import { Type } from 'class-transformer';
import { 
  IsString, IsNotEmpty, IsUUID, IsInt, 
  Min, Max, IsArray, ValidateNested, IsOptional, IsNumber, ValidateIf 
} from 'class-validator';

export class CreateClassDto {
  //@IsUUID()
  @IsOptional() // Optional because existing classes have IDs, new ones might not yet
  id?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID()
  @IsOptional()
  sessionId!: string;

  @IsInt()
  @Min(1)
  @Type(() => Number) // Ensures string inputs from forms are converted to numbers
  capacity!: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  ageMin!: number;

  @IsInt()
  @Max(18)
  @Type(() => Number)
  ageMax!: number;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  instructorIds: string[] = [];

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ValidateIf((object, value) => value !== null) // Allows the field to be null
  @Type(() => Number) 
  price!: number | null;
}

// Bulk creation DTO for high-efficiency setup
export class BulkCreateClassDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClassDto)
  classes!: CreateClassDto[];
}