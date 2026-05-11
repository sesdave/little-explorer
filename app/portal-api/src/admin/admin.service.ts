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

// apps/api/src/admin/admin.service.ts

async getAllExplorers(page: number, limit: number, search?: string, paymentStatus?: string) {
  const skip = (page - 1) * limit;

  // 1. Construct the 'where' clause
  let where: any = search ? {
    OR: [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { parent: { name: { contains: search, mode: 'insensitive' } } }
    ]
  } : {};

  // 2. Add the Payment Status Filter
  if (paymentStatus && paymentStatus !== 'all') {
    const statusMap: Record<string, any> = {
      'paid': 'COMPLETED',
      'partial': 'PARTIALLY_PAID',
      'unpaid': 'PENDING'
    };

    const targetStatus = statusMap[paymentStatus];

    // This ensures we only get children whose specific registration 
    // is tied to an application with the selected status.
    where = {
      ...where,
      registrations: {
        some: {
          application: {
            status: targetStatus
          }
        }
      }
    };
  }

  // 3. Execute Query
  const [total, children] = await Promise.all([
    this.prisma.child.count({ where }),
    this.prisma.child.findMany({
      where,
      skip,
      take: limit,
      include: {
        parent: {
          select: { name: true, email: true }
        },
        registrations: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get the most recent registration
          include: {
            application: {
              select: { status: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  // 4. Map the results for a clean Frontend response
  const data = children.map((child: any) => {
    // Access the status of the specific registration for this child
    const latestReg = child.registrations?.[0];
    const appStatus = latestReg?.application?.status;

    let uiStatus = 'unpaid';
    if (appStatus === 'COMPLETED') uiStatus = 'paid';
    else if (appStatus === 'PARTIALLY_PAID') uiStatus = 'partial';
    
    // If there is no registration at all, you might want to call it "inactive"
    if (!latestReg) uiStatus = 'unpaid'; 

    return {
      ...child,
      paymentStatus: uiStatus,
      enrolledAt: latestReg?.createdAt || null
    };
  });

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