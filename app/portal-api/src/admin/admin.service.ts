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

// apps/api/src/admin/admin.service.ts
async getAllExplorers(page: number, limit: number, search?: string, paymentStatus?: string) {
  const skip = (page - 1) * limit;

  // 1. Start with the search filter
  const searchFilter = search ? {
    OR: [
      { firstName: { contains: search, mode: 'insensitive' as const } },
      { lastName: { contains: search, mode: 'insensitive' as const } },
      { parent: { name: { contains: search, mode: 'insensitive' as const } } }
    ]
  } : {};

  // 2. Build the Payment Filter
  let statusFilter: any = {};
  
  if (paymentStatus && paymentStatus !== 'all') {
    if (paymentStatus === 'unpaid') {
      statusFilter = {
        OR: [
          { registrations: { none: {} } }, 
          { registrations: { some: { application: { status: 'PENDING' } } } },
          { registrations: { some: { application: { payments: { none: { status: 'SUCCESSFUL' } } } } } }
        ]
      };
    } else {
      const statusMap: Record<string, string> = { 
        paid: 'COMPLETED', 
        partial: 'PARTIALLY_PAID' 
      };
      statusFilter = {
        registrations: { 
          some: { application: { status: statusMap[paymentStatus] } } 
        }
      };
    }
  }

  // 3. COMBINE Search AND Status (The "AND" ensures search works with filters)
  const where = {
    AND: [searchFilter, statusFilter]
  };

  const [total, children] = await Promise.all([
    this.prisma.child.count({ where }),
    this.prisma.child.findMany({
      where, 
      skip, 
      take: limit,
      include: {
        parent: { select: { name: true, email: true } },
        registrations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            application: {
              include: { 
                payments: { 
                  where: { status: 'SUCCESSFUL' }, 
                  select: { amount: true } 
                } 
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const data = children.map((child: any) => {
    const latestReg = child.registrations?.[0];
    const app = latestReg?.application;
    
    // Financial Math
    const amountPaid = app?.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
    const totalAmount = Number(app?.totalAmount || 0);

    // Precise Status Logic
    let status = 'unpaid';
    if (app?.status === 'COMPLETED') status = 'paid';
    else if (app?.status === 'PARTIALLY_PAID') status = 'partial';
    
    // Return formatted for Naira UI
    return { 
      ...child, 
      paymentStatus: status, 
      amountPaid, 
      totalAmount,
      balance: totalAmount - amountPaid
    };
  });

  return { data, meta: { total, page, lastPage: Math.ceil(total / limit) } };
}
/*async getAllExplorers(page: number, limit: number, search?: string, paymentStatus?: string) {
  const skip = (page - 1) * limit;

  // 1. SEARCH LOGIC
  let where: any = search ? {
    OR: [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { parent: { name: { contains: search, mode: 'insensitive' } } }
    ]
  } : {};

  // 2. ROBUST UNPAID/PAID/PARTIAL FILTER
  if (paymentStatus && paymentStatus !== 'all') {
    if (paymentStatus === 'unpaid') {
      where = {
        ...where,
        OR: [
          // Case A: Child has no registrations at all
          { registrations: { none: {} } }, 
          // Case B: Application is explicitly PENDING
          { registrations: { some: { application: { status: 'PENDING' } } } },
          // Case C: Application exists but has NO successful payments
          { registrations: { some: { application: { payments: { none: { status: 'SUCCESSFUL' } } } } } }
        ]
      };
    } else {
      const statusMap: Record<string, any> = {
        paid: 'COMPLETED',
        partial: 'PARTIALLY_PAID',
      };
      where = {
        ...where,
        registrations: {
          some: { application: { status: statusMap[paymentStatus] } }
        }
      };
    }
  }

  // 3. DATABASE QUERY
  const [total, children] = await Promise.all([
    this.prisma.child.count({ where }),
    this.prisma.child.findMany({
      where,
      skip,
      take: limit,
      include: {
        parent: { select: { name: true, email: true } },
        registrations: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Only get the most recent class data
          include: {
            application: {
              include: {
                payments: {
                  where: { status: 'SUCCESSFUL' },
                  select: { amount: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  // 4. DATA TRANSFORMATION & MATH
  const data = children.map((child: any) => {
    const latestReg = child.registrations?.[0];
    const app = latestReg?.application;
    
    // Sum of successful payments
    const amountPaid = app?.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
    const totalAmount = Number(app?.totalAmount || 0);

    // Logic to determine UI label
    let uiStatus = 'unpaid';
    if (app?.status === 'COMPLETED') uiStatus = 'paid';
    else if (app?.status === 'PARTIALLY_PAID') uiStatus = 'partial';
    // If it's partial but amount paid equals total, treat as paid
    else if (app?.status === 'PARTIALLY_PAID' && amountPaid >= totalAmount && totalAmount > 0) uiStatus = 'paid';

    return {
      ...child,
      paymentStatus: uiStatus,
      amountPaid,
      totalAmount,
      balance: totalAmount - amountPaid,
      enrolledAt: latestReg?.createdAt || null,
      currentClass: latestReg?.classId || 'Not Enrolled'
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
}*/
}