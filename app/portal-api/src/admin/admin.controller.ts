// apps/api/src/admin/admin.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN') // 🛡️ Restrict access to admin users only
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  async getDashboardData() {
    return this.adminService.getOverview();
  }

  @Get('explorers')
  async getExplorers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    // 🏛️ Convert query strings to numbers for the service
    return this.adminService.getAllExplorers(
      parseInt(page, 10), 
      parseInt(limit, 10),
      search
    );
  }
}