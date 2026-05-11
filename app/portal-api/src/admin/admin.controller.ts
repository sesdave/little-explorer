// apps/api/src/admin/admin.controller.ts
import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { AdminService } from './service/admin.service';
import { AdminBroadcastService } from './service/broadcast.service';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) 
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly broadcastService: AdminBroadcastService
  ) {}

  @Get('overview')
  async getDashboardData() {
    return this.adminService.getOverview();
  }

  @Get('explorers')
  async getExplorers(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
    @Query('paymentStatus') paymentStatus?: string,
  ) {
    return this.adminService.getAllExplorers(
      parseInt(page, 10), 
      parseInt(limit, 10),
      search,
      paymentStatus
    );
  }

  // --- BROADCAST SECTION ---

  @Post('broadcast/send') // 👈 Added prefix for clarity
  async sendBroadcast(@Body() dto: any, @Req() req: any) {
    // Principal Guard: req.user is populated by JwtStrategy
    return this.broadcastService.executeBroadcast(dto, req.user.id);
  }

  @Get('broadcast/preview') // 👈 Added prefix
  async getPreview(
    @Query('target') target: string,
    @Query('classId') classId?: string,
  ) {
    return this.broadcastService.getRecipientCount(target, classId);
  }

  @Get('broadcast/history') // 👈 Added prefix
  async getHistory() {
    return this.broadcastService.getBroadcastHistory();
  }
}