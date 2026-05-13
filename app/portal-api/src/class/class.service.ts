import { 
  Injectable, ForbiddenException, BadRequestException, 
  ConflictException, Inject, NotFoundException, Logger 
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';
import { ClassRepository } from './class.repository';
import { SessionRepository } from '../session/session.repository'; // 👈 Inject Session Repo
import { UserRepository } from '../user/user.repository';       // 👈 Inject User Repo
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { SessionStatus } from '@prisma/client';
import { EnrollmentRepository } from 'src/enrollment/enrollment.repository';
import { ReassignDto } from './dto/reassign-class-dto';

@Injectable()
export class ClassService {
  private readonly logger = new Logger(ClassService.name);

  constructor(
    private readonly repository: ClassRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository,
    private readonly enrollRepository: EnrollmentRepository,
    @Inject(CACHE_MANAGER) private readonly cache: cacheManager.Cache
  ) {}

  async create(dto: CreateClassDto) {
    this.logger.log(`Attempting to create class: ${dto.name}`);

    // 1. Session Status Check via SessionRepository
    const session = await this.sessionRepository.findById(dto.sessionId);
    if (!session) throw new NotFoundException('Target session does not exist.');

    if (session.status === SessionStatus.ACTIVE ||session.status === SessionStatus.COMPLETED) {
      throw new ForbiddenException('Cannot add classes to a finalized or ongoing session.');
    }

    // 2. Age Integrity
    if (dto.ageMin > dto.ageMax) {
      throw new BadRequestException('Minimum age cannot be greater than maximum age.');
    }

    // 3. Instructor Integrity via UserRepository
    if (dto.instructorIds?.length) {
      const validCount = await this.userRepository.countValidInstructors(dto.instructorIds);
      if (validCount !== dto.instructorIds.length) {
        throw new BadRequestException('One or more selected instructors are invalid.');
      }
    }

    return this.repository.create(dto);
  }

  async delete(id: string) {
    const classData = await this.repository.findByIdWithCount(id);
    if (!classData) throw new NotFoundException('Class not found.');

    if (classData._count.registrations > 0) {
      throw new ConflictException(`Cannot delete class with active students.`);
    }

    return this.repository.delete(id);
  }

  async findClassesByActiveSession() {
    const CACHE_KEY = 'ACTIVE_SESSION_CLASSES';
    const cached = await this.cache.get(CACHE_KEY);
    if (cached) return cached;

    // Use SessionRepository to find the ID, then ClassRepository to find the classes
    const activeSession = await this.sessionRepository.findActiveRegistration();
    if (!activeSession) return [];

    const classes = await this.repository.findBySessionId(activeSession.id);
    await this.cache.set(CACHE_KEY, classes, 3600);
    return classes;
  }

  /**
   * Added to fix: Property 'createBulk' does not exist on type 'ClassService'
   */
  async createBulk(classes: CreateClassDto[]) {
    this.logger.log(`Bulk creating ${classes.length} classes.`);
    
    // O(1) insert via Repository
    return this.repository.bulkSync(classes);
  }

  /**
   * Added to fix: Property 'update' does not exist on type 'ClassService'
   */
  async update(id: string, dto: UpdateClassDto) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Class not found');

    // Re-validate business rules if sensitive fields are changing
    await this.validateClassBusinessRules({ ...existing, ...dto } as CreateClassDto);

    return this.repository.update(id, dto);
  }

  async getClassAssignments() {
    const session = await this.sessionRepository.getActiveSession().catch(() => null);
    console.log("sessioj", session)

    if (!session) {
      throw new NotFoundException(
        "No active session found. Reassignment is unavailable."
      );
    }
    const classes = await this.repository.getClassAssignments(session.id);
    return{
      session,
      classes
    }
  }

  async reassignChild(dto: ReassignDto) {
    return this.repository.reassignChild(dto);
  }


  async getReassignmentOptions(childId: string) {
    const session = await this.sessionRepository.getActiveSession().catch(() => null);

    if (!session) {
      throw new NotFoundException(
        "No active session found. Reassignment is unavailable."
      );
    }

    const child: any = await this.enrollRepository.findRegisteredChild(session, childId);

    if (!child) {
      throw new NotFoundException("Child not found");
     }

  const currentClassId = child.registrations?.[0]?.classId;

  return this.repository.getReassignmentOptions(
      childId,
      session.id,
      currentClassId
    );
  }


  /**
   * Internal helper to dry up validation logic for create and update
   */
  private async validateClassBusinessRules(dto: CreateClassDto) {
    // 1. Session Status
    const session = await this.sessionRepository.findById(dto.sessionId);
    if (!session) throw new NotFoundException('Session not found.');
    if (session.status === SessionStatus.ACTIVE || session.status === SessionStatus.COMPLETED) {
      throw new ForbiddenException('Cannot modify classes in a finalized session.');
    }

    // 2. Age Ranges
    if (dto.ageMin > dto.ageMax) {
      throw new BadRequestException('Min age cannot exceed Max age.');
    }

    // 3. Instructor IDs (Text Array Check)
    if (dto.instructorIds?.length) {
      const validCount = await this.userRepository.countValidInstructors(dto.instructorIds);
      if (validCount !== dto.instructorIds.length) {
        throw new BadRequestException('One or more selected instructors are invalid.');
      }
    }
  }
}