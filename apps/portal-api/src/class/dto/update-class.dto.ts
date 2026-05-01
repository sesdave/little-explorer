import { PartialType } from '@nestjs/mapped-types';
import { CreateClassDto } from './create-class.dto';

/**
 * UpdateClassDto inherits all properties and validation decorators 
 * from CreateClassDto but marks them as optional (@IsOptional).
 */
export class UpdateClassDto extends PartialType(CreateClassDto) {}