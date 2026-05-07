import { 
  Controller, Post, Patch, Delete, Body, Param, 
  UseGuards, ParseUUIDPipe, 
  Get
} from '@nestjs/common';
import { ClassService } from './class.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { Roles } from '../auth/decorators';
import { UserRole } from '@prisma/client';// Using Prisma Enum for consistency
import { CreateClassDto, BulkCreateClassDto, UpdateClassDto } from './dto';
import { ReassignDto } from './dto/reassign-class-dto';

@Controller('admin/classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  create(@Body() dto: CreateClassDto) {
    return this.classService.create(dto);
  }

  @Patch('bulk')
  createBulk(@Body() dto: BulkCreateClassDto) {
    // We pass the array of classes extracted from the bulk DTO
    return this.classService.createBulk(dto.classes);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() dto: UpdateClassDto
  ) {
    return this.classService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.classService.delete(id);
  }

  @Get('assignments')
  getAssignments() {
    return this.classService.getClassAssignments();
  }

  @Get('reassign/options/:childId')
  async getOptions(@Param('childId') childId: string) {
     return this.classService.getReassignmentOptions(childId);
  }

  @Post('reassign')
  reassign(@Body() dto: ReassignDto) {
    return this.classService.reassignChild(dto);
  }

}