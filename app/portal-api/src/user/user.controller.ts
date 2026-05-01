import { 
  Controller, Get, Patch, Body, Param, UseGuards, Req
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guard'; // 🔐 Custom Guard
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'prisma/prisma-client';

@Controller('users')
@UseGuards(JwtAuthGuard) // Every route in this controller requires a login
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /users/me
   * Allows a logged-in user to fetch their own profile.
   */
  @Get('me')
  async getProfile(@Req() req: any) {
    return this.userService.findOne(req.user.id);
  }

  /**
   * PATCH /users/me
   * Allows a user to update their own name or email.
   */
  @Patch('me')
  async updateMe(@Req() req: any, @Body() dto: UpdateUserDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  /**
   * GET /users/instructors
   * Public/Parent view of all instructors.
   */
  @Get('instructors')
  async listInstructors() {
    return this.userService.getInstructorList();
  }

  /**
   * PATCH /users/:id/admin
   * 🔒 ADMIN ONLY: Update any user, including their role.
   */
  @Patch(':id/admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminUpdate(
    @Param('id') id: string, 
    @Body() dto: UpdateUserDto
  ) {
    return this.userService.adminUpdateUser(id, dto);
  }
}