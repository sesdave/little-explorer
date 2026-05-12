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

  // src/modules/admin/revenue/revenue.service.ts

async getTransactions(filters: RevenueFilters) {
  const transactions = await this.revenueRepository.getTransactions(filters);

  return {
    ...transactions,
    data: transactions.data.map((payment) => {
      // Determine if this is a donation or registration
      const isDonation = payment.type === 'DONATION';

      return {
        id: payment.id,
        amount: Number(payment.amount),
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        type: payment.type,
        externalReference: payment.externalReference,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,

        // Handle Parent/Donor Info
        parent: isDonation 
          ? { 
              name: payment.donation?.donorName || 'Anonymous Donor', 
              email: 'N/A', // Or pull from payment record if you stored it there
              isDonation: true 
            }
          : { 
              id: payment.application?.parent.id,
              name: payment.application?.parent.name,
              email: payment.application?.parent.email,
              isDonation: false
            },

        // Handle Registration Specifics safely
        session: payment.application ? {
          id: payment.application.session.id,
          name: payment.application.session.name,
        } : null,

        children: payment.application?.registrations.map((reg) => ({
          id: reg.child.id,
          fullName: `${reg.child.firstName} ${reg.child.lastName}`,
          className: reg.class.name,
        })) || [],

        donationDetails: isDonation ? {
          message: payment.donation?.message
        } : null,

        totals: {
          childrenCount: payment.application?.registrations.length || 0,
        },
      };
    }),
  };
}

  /*async getTransactions(filters: RevenueFilters) {
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
  }*/

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