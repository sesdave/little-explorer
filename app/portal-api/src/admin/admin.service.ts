// apps/api/src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    // We use Promise.all to fetch all metrics in a single database "round-trip"
    const [
      totalExplorers,
      pendingAppsCount,
      activeRegsCount,
      revenueData,
      recentApplications,
    ] = await Promise.all([
      // 1. Count all children (Explorers)
      this.prisma.child.count(),

      // 2. Count Applications that are still PENDING (Actionable)
      this.prisma.application.count({ where: { status: 'PENDING' } }),

      // 3. Count individual child registrations that are CONFIRMED
      this.prisma.registration.count({ where: { status: 'CONFIRMED' } }),

      // 4. Sum up all SUCCESSFUL payments
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESSFUL' },
      }),

      // 5. Get the 5 most recent applications + parent details
      this.prisma.application.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          parent: { select: { name: true } }, // 👈 Use 'parent' and 'name' per your schema
          registrations: true,
        },
      }),
    ]);

    return {
      stats: {
        totalExplorers,
        pendingCount: pendingAppsCount,
        activeRegistrations: activeRegsCount,
        totalRevenue: Number(revenueData._sum.amount || 0), // Convert Decimal to Number
        revenueTrend: "+5.4%", // Mocked
        explorerTrend: "+12%", // Mocked
      },
      recentApps: recentApplications.map((app: { id: any; parent: { name: any; }; registrations: string | any[]; status: any; totalAmount: any; paymentPlan: any; createdAt: any; }) => ({
        id: app.id,
        // 🏛️ Schema fix: app.parent.name instead of user.lastName
        parentName: app.parent?.name || 'Anonymous Parent',
        childCount: app.registrations.length,
        status: app.status,
        totalAmount: Number(app.totalAmount),
        paymentPlan: app.paymentPlan,
        createdAt: app.createdAt,
      })),
    };
  }

  // apps/api/src/admin/admin.service.ts
// apps/api/src/admin/admin.service.ts
async getAllExplorers(page: number, limit: number, search?: string) {
  const skip = (page - 1) * limit;

  // 🏛️ Define the search filter
  // It checks Child name OR Parent name
  const where = search ? {
    OR: [
      { firstName: { contains: search, mode: 'insensitive' as const } },
      { lastName: { contains: search, mode: 'insensitive' as const } },
      { parent: { name: { contains: search, mode: 'insensitive' as const } } }
    ]
  } : {};

  const [total, data] = await Promise.all([
    this.prisma.child.count({ where }), // 👈 Count must respect the search
    this.prisma.child.findMany({
      where, // 👈 Data must respect the search
      skip,
      take: limit,
      include: {
        parent: { select: { name: true, email: true } },
        registrations: {
          where: { status: 'CONFIRMED' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return {
    data,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
    }
  };
}
}