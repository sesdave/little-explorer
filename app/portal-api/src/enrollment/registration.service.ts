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
    const selectedChildren = userContext.children.filter((c: { id: string; }) => 
      dto.childIds.includes(c.id)
    );

    if (selectedChildren.length !== dto.childIds.length) {
      throw new UnprocessableEntityException("Invalid children selection.");
    }

    // 3. Placement Intelligence (Returns the class object now)
    const placementInstructions = this.calculatePlacements(
      selectedChildren, 
      activeSession.classes
    );

    // 4. Financial Calculation (Dynamic override fallback check)
    const totalAmount = placementInstructions.reduce((sum, item) => {
      // If class has a specific price override, use it. Otherwise, use session base.
      const pricePerChild = item.classPrice !== null && item.classPrice !== undefined
        ? Number(item.classPrice)
        : activeSession.pricePerClass.toNumber();

      return sum + pricePerChild;
    }, 0);

    // 5. Atomic Execution
    const application = await this.enrollmentRepo.findOrCreateApplication(
      userId, 
      activeSession.id, 
      dto.paymentPlan,
      totalAmount
    );

    // Drop the auxiliary pricing property before passing parameters to batch registration
    const safePlacements = placementInstructions.map(({ childId, classId }) => ({
      childId,
      classId
    }));

    await this.enrollmentRepo.secureBatchRegistration(
      application.id, 
      safePlacements,
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

  private calculatePlacements(
    children: any[],
    classes: any[]
  ) {
    // 🛠️ Modified type payload to pipe class price overrides upstream
    const placements: { childId: string; classId: string; classPrice: any }[] = [];

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
      const selectedClass = eligibleClasses.sort((a, b) => 
        (b.capacity - b._count.registrations) - (a.capacity - a._count.registrations)
      )[0];

      placements.push({
        childId: child.id,
        classId: selectedClass.id,
        classPrice: selectedClass.price // 👈 Track the class override value
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
      message: 'Registration cancelled successfully',
    };
  }
}