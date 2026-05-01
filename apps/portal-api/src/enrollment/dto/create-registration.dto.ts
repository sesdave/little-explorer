import { IsUUID } from 'class-validator';

export class CreateRegistrationDto {
  @IsUUID()
  childId!: string;

  @IsUUID()
  classId!: string;
}