// src/modules/admin/revenue/revenue.controller.ts

import {
  Controller,
  Get,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';

import { RevenueService } from './revenue.service';

import {
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';
import { JwtAuthGuard, RolesGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorators';


@Controller('admin/revenue')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class RevenueController {
  constructor(
    private readonly revenueService: RevenueService,
  ) {}

  /**
   * --------------------------------------------------------
   * OVERVIEW DASHBOARD
   * --------------------------------------------------------
   *
   * Used by:
   * - Revenue dashboard
   * - KPI cards
   * - Charts
   * - Settlement widgets
   *
   */
  @Get('overview')
  async getOverview() {
    const data =
      await this.revenueService.getDashboardOverview();

    return {
      success: true,
      data,
    };
  }

  /**
   * --------------------------------------------------------
   * SUMMARY KPI
   * --------------------------------------------------------
   *
   * Lightweight endpoint for stat cards
   *
   */
  @Get('summary')
  async getSummary() {
    const data =
      await this.revenueService.getRevenueSummary();

    return {
      success: true,
      data,
    };
  }

  /**
   * --------------------------------------------------------
   * REVENUE CHART
   * --------------------------------------------------------
   *
   * Used for:
   * - Monthly charts
   * - Trend graphs
   * - Forecasts
   *
   */
  @Get('chart')
  async getChart() {
    const data =
      await this.revenueService.getRevenueChart();

    return {
      success: true,
      data,
    };
  }

  /**
   * --------------------------------------------------------
   * SETTLEMENTS
   * --------------------------------------------------------
   *
   * Used for:
   * - Paystack settlement visibility
   * - Pending payout tracking
   *
   */
  @Get('settlements')
  async getSettlements() {
    const data =
      await this.revenueService.getSettlementOverview();

    return {
      success: true,
      data,
    };
  }

  /**
   * --------------------------------------------------------
   * TRANSACTION LEDGER
   * --------------------------------------------------------
   *
   * Features:
   * - Pagination
   * - Search
   * - Status filter
   * - Payment method filter
   * - Session filter
   * - Date range filter
   *
   */
  @Get('transactions')
  async getTransactions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number,

    @Query('limit', new DefaultValuePipe(20), ParseIntPipe)
    limit: number,

    @Query('search')
    search?: string,

    @Query('status')
    status?: PaymentStatus,

    @Query('method')
    method?: PaymentMethod,

    @Query('sessionId')
    sessionId?: string,

    @Query('startDate')
    startDate?: string,

    @Query('endDate')
    endDate?: string,
  ) {
    const data =
      await this.revenueService.getTransactions({
        page,
        limit,
        search,
        status,
        method,
        sessionId,
        startDate,
        endDate,
      });

    return {
      success: true,
      data,
    };
  }
}