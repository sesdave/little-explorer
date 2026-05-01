import { Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { SessionRepository } from "../session/session.repository";
import { EnrollmentRepository } from "./enrollment.repository";
import { BulkRegisterDto } from "./dto/bulk-register.dto";
import { UserRepository } from "../user/user.repository";

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
    const selectedChildren = userContext.children.filter(c => 
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
      currency: 'USD',
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
    const age = this.calculateAge(new Date(child.dob));

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

/**
 * Staff-Level Age Calculation
 * Calculates age based on the current year/session context
 */
private calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
}