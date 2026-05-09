import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { SessionRepository } from "../session/session.repository";
import { EnrollmentRepository } from "./enrollment.repository";
import { BulkRegisterDto } from "./dto/bulk-register.dto";
import { UserRepository } from "../user/user.repository";
import { calculateAge } from "src/util/calculateAge";
import { PaymentStatus } from "@prisma/client";

@Injectable()
export class RegistrationService {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async handleBulkRegistration(userId: string, dto: BulkRegisterDto) {
    // 1. Fetch Session & User Context in parallel (Performance)
    const [activeSession, userContext] = await Promise.all([
      this.sessionRepo.getActiveSessionWithClasses(),
      this.userRepo.findUserWithChildren(userId),
    ]);

    if (!userContext) {
      throw new NotFoundException(`User profile for ID ${userId} not found.`);
    }
    
    if (!activeSession) {
      throw new UnprocessableEntityException("Registration is currently closed.");
    }

    // 2. Hydrate & Validate Children
    // Ensure the children requested in the DTO actually belong to this parent
    const selectedChildren = userContext.children.filter((c: { id: string; }) => 
      dto.childIds.includes(c.id)
    );

    if (selectedChildren.length !== dto.childIds.length) {
      throw new UnprocessableEntityException("Invalid children selection.");
    }

    // 3. Placement Intelligence
    const placementInstructions = this.calculatePlacements(
      selectedChildren, 
      activeSession.classes
    );

    // 4. Financial Calculation (Staff Move: Backend is the source of truth)
    // Use Decimal.js or handle as cents to avoid floating point issues
    const totalAmount = activeSession.pricePerClass.toNumber() * selectedChildren.length;

    // 5. Atomic Execution
    const application = await this.enrollmentRepo.findOrCreateApplication(
      userId, 
      activeSession.id, 
      dto.paymentPlan,
      totalAmount // 👈 Pass calculated total
    );

    await this.enrollmentRepo.secureBatchRegistration(
      application.id, 
      placementInstructions,
      activeSession.id,
    );

    return {
      applicationId: application.id,
      totalAmount,
      currency: 'NAIRA',
      message: "Spots held successfully.",
      expiresAt: new Date(Date.now() + 30 * 60000), 
    };
  }

 // src/modules/enrollment/registration.service.ts

private calculatePlacements(
  children: any[], // We need the full child objects with DOB now
  classes: any[]
) {
  const placements: { childId: string; classId: string }[] = [];

  for (const child of children) {
    const age = calculateAge(new Date(child.dob));

    // Find all eligible classes based on age
    const eligibleClasses = classes.filter(c => 
      age >= c.ageMin && 
      age <= c.ageMax && 
      (c.capacity - c._count.registrations) > 0
    );

    if (eligibleClasses.length === 0) {
      throw new UnprocessableEntityException(
        `No available classes found for ${child.firstName} (Age: ${age}).`
      );
    }

    // Principal Logic: Placement Strategy
    // Example: Always pick the class with the most remaining spots to balance groups
    const selectedClass = eligibleClasses.sort((a, b) => 
      (b.capacity - b._count.registrations) - (a.capacity - a._count.registrations)
    )[0];

    placements.push({
      childId: child.id,
      classId: selectedClass.id
    });
  }

  return placements;
}

  async findPendingApplication(id: string) {
    return await this.enrollmentRepo.findApplicationById(id);
  }

   async cancelApplication(
    applicationId: string,
    parentId: string,
  ) {
    const application =
      await this.enrollmentRepo.findApplicationForCancellation(
        applicationId,
      );

    if (!application) {
      throw new NotFoundException(
        'Application not found',
      );
    }

    // Ownership validation
    if (application.parentId !== parentId) {
      throw new BadRequestException(
        'You cannot cancel this application',
      );
    }

    // Idempotency
    if (application.status === 'CANCELLED') {
      return {
        success: true,
        message: 'Application already cancelled',
      };
    }

    // Payment protection
    const amountPaid = Number(application.amountPaid);

const hasStartedPayment =
  amountPaid > 0 ||
  application.payments.some(
    (payment) => payment.status === PaymentStatus.SUCCESSFUL,
  );

    if (hasStartedPayment) {
      throw new BadRequestException(
        'Cannot cancel application after payment has started',
      );
    }

    // Repository transaction
    await this.enrollmentRepo.cancelApplicationTransaction(
      applicationId,
      application.registrations,
    );

    return {
      success: true,
      message:
        'Registration cancelled successfully',
    };
  }
}