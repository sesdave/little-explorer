import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly repository: UserRepository) {}

  // --- Profile Management ---

  /**
   * Updates a user's basic profile information.
   * Prevents non-admins from changing their own roles.
   */
  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.repository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // 🛡️ Security: Strip sensitive fields from the DTO
    // This ensures a Parent cannot promote themselves to ADMIN
    const { role, email, ...safeData } = dto;

    return this.repository.update(userId, safeData);
  }

  // --- Instructor Logic (Used by ClassModule) ---

  async getInstructorList() {
    return this.repository.findAllInstructors();
  }

  async validateInstructors(ids: string[]) {
    const count = await this.repository.countValidInstructors(ids);
    if (count !== ids.length) {
      throw new BadRequestException('One or more selected instructors are invalid.');
    }
    return true;
  }

  // --- Admin Logic ---

  async adminUpdateUser(targetUserId: string, dto: UpdateUserDto) {
    const user = await this.repository.findById(targetUserId);
    if (!user) throw new NotFoundException('User not found');

    // Admins ARE allowed to update roles and emails
    return this.repository.update(targetUserId, dto);
  }

  async findOne(id: string) {
    const user = await this.repository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}