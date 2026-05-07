import { IsNotEmpty } from "class-validator";

export class ReassignDto{
    @IsNotEmpty()
      childId!: string;

      @IsNotEmpty()
      newClassId!: string;
    
}