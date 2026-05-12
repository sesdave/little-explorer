// src/modules/admin/revenue/revenue.repository.ts

import { Injectable } from '@nestjs/common';
import {
  PaymentStatus,
  PaymentMethod,
  Prisma,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

interface TransactionFilters {
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
export class RevenueRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueSummary() {
    const successfulPayments = await this.prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      _count: true,
      where: {
        status: PaymentStatus.SUCCESSFUL,
      },
    });

    const failedPayments = await this.prisma.payment.count({
      where: {
        status: PaymentStatus.FAILED,
      },
    });

    const pendingPayments = await this.prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: PaymentStatus.PENDING,
      },
    });

    const totalFees =
      Number(successfulPayments._sum.amount || 0) * 0.015;

    const netRevenue =
      Number(successfulPayments._sum.amount || 0) - totalFees;

    const successRate =
      successfulPayments._count > 0
        ? Math.round(
            (successfulPayments._count /
              (successfulPayments._count + failedPayments)) *
              100,
          )
        : 0;

    return {
      grossRevenue: Number(successfulPayments._sum.amount || 0),
      netRevenue,
      totalFees,
      pendingSettlement: Number(
        pendingPayments._sum.amount || 0,
      ),
      successfulTransactions: successfulPayments._count,
      failedTransactions: failedPayments,
      successRate,
    };
  }

  async getRevenueChart() {
    const groupedPayments = await this.prisma.$queryRaw<
      Array<{
        month: string;
        revenue: number;
      }>
    >(Prisma.sql`
      SELECT
        TO_CHAR("paidAt", 'Mon') as month,
        SUM(amount)::numeric as revenue
      FROM "Payment"
      WHERE status = 'SUCCESSFUL'
      GROUP BY month
      ORDER BY MIN("paidAt")
    `);

    return groupedPayments.map((item) => ({
      month: item.month,
      revenue: Number(item.revenue),
    }));
  }

  async getTransactionAnalytics() {
    const grouped = await this.prisma.payment.groupBy({
      by: ['status'],
      _count: true,
    });

    return grouped;
  }

  async getTransactions(filters: TransactionFilters) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      method,
      sessionId,
      startDate,
      endDate,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      ...(status && { status }),
      ...(method && { method }),

      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && {
                gte: new Date(startDate),
              }),

              ...(endDate && {
                lte: new Date(endDate),
              }),
            },
          }
        : {}),

      ...(sessionId && {
        application: {
          sessionId,
        },
      }),

      ...(search
        ? {
            OR: [
              {
                externalReference: {
                  contains: search,
                  mode: 'insensitive',
                },
              },

              {
                application: {
                  parent: {
                    name: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              },

              {
                application: {
                  parent: {
                    email: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              },

              {
                application: {
                  registrations: {
                    some: {
                      child: {
                        OR: [
                          {
                            firstName: {
                              contains: search,
                              mode: 'insensitive',
                            },
                          },

                          {
                            lastName: {
                              contains: search,
                              mode: 'insensitive',
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [transactions, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,

        include: {
          donation: true,
          application: {
            include: {
              parent: true,

              session: true,

              registrations: {
                include: {
                  child: true,
                  class: true,
                },
              },
            },
          },
        },

        orderBy: {
          createdAt: 'desc',
        },

        skip,
        take: limit,
      }),

      this.prisma.payment.count({
        where,
      }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSettlementOverview() {
    const successfulPayments = await this.prisma.payment.aggregate({
      _sum: {
        amount: true,
      },

      where: {
        status: PaymentStatus.SUCCESSFUL,
      },
    });

    const pendingPayments = await this.prisma.payment.aggregate({
      _sum: {
        amount: true,
      },

      where: {
        status: PaymentStatus.PENDING,
      },
    });

    return {
      availableBalance:
        Number(successfulPayments._sum.amount || 0) * 0.85,

      pendingSettlement: Number(
        pendingPayments._sum.amount || 0,
      ),

      estimatedNextPayoutDate: new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 2,
      ),
    };
  }
}