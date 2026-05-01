// src/modules/enrollment/dto/bulk-register.dto.ts
import { 
  IsArray, 
  IsEnum, 
  IsNotEmpty, 
  IsString, 
  ArrayMinSize, 
  IsUUID, 
  IsOptional
} from 'class-validator';
import { PaymentPlan } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Staff-Level DTO: Bulk Registration Contract
 * This handles the initial "lock-in" of children for a session.
 */
export class BulkRegisterDto {
  
  @ApiProperty({ example: 'cl-session-123', description: 'The active camp session ID' })
  @IsNotEmpty()
  @IsString()
  // Note: Using CUID or UUID depends on your Prisma config
  sessionId!: string;

  @ApiProperty({ 
    example: ['child-88', 'child-99'], 
    description: 'Array of children IDs to be enrolled' 
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'You must select at least one explorer for registration.' })
  childIds!: string[];

  @ApiProperty({ 
    enum: PaymentPlan, 
    example: PaymentPlan.PARTIAL,
    description: 'Determines if the parent is paying the deposit or total amount'
  })
  @IsEnum(PaymentPlan, { 
    message: 'Payment plan must be either FULL or PARTIAL' 
  })
  paymentPlan!: PaymentPlan;

  /**
   * Optional: If you want to allow parents to apply a family discount code 
   * at the start of the application process.
   */
  @IsString()
  @IsOptional()
  promoCode?: string;
}