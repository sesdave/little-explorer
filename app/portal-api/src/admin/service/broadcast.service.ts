import { Injectable, Logger } from "@nestjs/common";
import { CommunicationService } from "src/communication/communication.service";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AdminBroadcastService {
  private readonly logger = new Logger(AdminBroadcastService.name);

  constructor(
    private prisma: PrismaService,
    private comms: CommunicationService
  ) {}

  async executeBroadcast(dto: any, adminId: string) {
    let users = [];

    // 🎯 Use 'user' model and filter by role and registration status
    if (dto.targetType === 'ALL_PARENTS') {
      users = await this.prisma.user.findMany({
        where: {
          role: 'PARENT',
          children: {
            some: {
              registrations: {
                some: {
                  status: { in: ['CONFIRMED', 'PROVISIONAL'] }
                }
              }
            }
          }
        },
        select: { email: true, phoneNumber: true }
      });
    } else {
      users = await this.prisma.user.findMany({
        where: {
          role: 'PARENT',
          children: {
            some: {
              registrations: {
                some: { 
                  classId: dto.classId,
                  status: { in: ['CONFIRMED', 'PROVISIONAL'] }
                }
              }
            }
          }
        },
        select: { email: true, phoneNumber: true }
      });
    }

    // 2. Create Audit Log (Ensure your Broadcast model exists in schema)
    const log = await this.prisma.broadcast.create({
      data: {
        type: dto.type,
        content: dto.content,
        subject: dto.subject,
        recipients: users.length,
        senderId: adminId,
        status: 'PROCESSING'
      }
    });

    // 3. Fire-and-forget processing
    this.runBackgroundJob(users, dto, log.id);

    return { success: true, recipientCount: users.length };
  }

  private async runBackgroundJob(users: any[], dto: any, logId: string) {
    try {
      for (const user of users) {
        if (dto.type === 'EMAIL' && user.email) {
          await this.comms.sendBroadcastEmail(user.email, dto.subject, dto.content);
        } else if (dto.type === 'SMS' && user.phoneNumber) {
          // Use phoneNumber field from your User model
          await this.comms.sendBroadcastSMS(user.phoneNumber, dto.content);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      await this.prisma.broadcast.update({ 
        where: { id: logId }, 
        data: { status: 'COMPLETED' } 
      });
    } catch (err: unknown) {
      this.logger.error(`Broadcast job failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      await this.prisma.broadcast.update({ 
        where: { id: logId }, 
        data: { status: 'FAILED' } 
      });
    }
  }

  // apps/api/src/admin/broadcast.service.ts (Add this method)

async getRecipientCount(target: string, classId?: string) {
  const whereClause: any = {
    role: 'PARENT',
    children: {
      some: {
        registrations: {
          some: { status: { in: ['CONFIRMED', 'PROVISIONAL'] } }
        }
      }
    }
  };

  if (target === 'SPECIFIC_CLASS' && classId) {
    whereClause.children.some.registrations.some.classId = classId;
  }

  const count = await this.prisma.user.count({
    where: whereClause
  });

  return { count };
}

// ... existing constructor and executeBroadcast logic ...

/**
 * Returns a list of all past broadcasts, sorted by newest first.
 * Includes the name of the admin who sent it.
 */
async getBroadcastHistory() {
  return this.prisma.broadcast.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      sender: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

}