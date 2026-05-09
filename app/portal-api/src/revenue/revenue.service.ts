// src/modules/admin/revenue/revenue.service.ts

import { Injectable } from '@nestjs/common';
import { RevenueRepository } from './revenue.repository';
import {
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';

interface RevenueFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  sessionId?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class RevenueService {
  constructor(
    private readonly revenueRepository: RevenueRepository,
  ) {}

  async getDashboardOverview() {
    const [
      summary,
      chart,
      analytics,
      settlements,
    ] = await Promise.all([
      this.revenueRepository.getRevenueSummary(),

      this.revenueRepository.getRevenueChart(),

      this.revenueRepository.getTransactionAnalytics(),

      this.revenueRepository.getSettlementOverview(),
    ]);

    return {
      summary,
      chart,
      analytics,
      settlements,
    };
  }

  async getTransactions(filters: RevenueFilters) {
    const transactions =
      await this.revenueRepository.getTransactions(
        filters,
      );

    return {
      ...transactions,

      data: transactions.data.map((payment) => ({
        id: payment.id,

        amount: Number(payment.amount),

        currency: payment.currency,

        status: payment.status,

        method: payment.method,

        externalReference: payment.externalReference,

        paidAt: payment.paidAt,

        createdAt: payment.createdAt,

        parent: {
          id: payment.application.parent.id,

          name: payment.application.parent.name,

          email: payment.application.parent.email,
        },

        session: {
          id: payment.application.session.id,

          name: payment.application.session.name,
        },

        children:
          payment.application.registrations.map(
            (registration) => ({
              id: registration.child.id,

              fullName: `${registration.child.firstName} ${registration.child.lastName}`,

              className: registration.class.name,
            }),
          ),

        totals: {
          childrenCount:
            payment.application.registrations.length,
        },
      })),
    };
  }

  async getRevenueSummary() {
    return this.revenueRepository.getRevenueSummary();
  }

  async getRevenueChart() {
    return this.revenueRepository.getRevenueChart();
  }

  async getSettlementOverview() {
    return this.revenueRepository.getSettlementOverview();
  }
}