import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
//import { Cache } from 'cache-manager';
import * as cacheManager from 'cache-manager'; // ✅ Use namespace import
import { SessionRepository } from './session.repository';
import { CloneConfigDto, CreateSessionDto } from './dto';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  
  // Define constant keys to prevent typos
  private readonly CACHE_KEY = 'global_active_session';

  constructor(
    private repository: SessionRepository,
   // @Inject(CACHE_MANAGER) private cacheManager: Cache
    @Inject(CACHE_MANAGER) private cacheManager: cacheManager.Cache
  ) {}

  /**
   * 1. Create a new Session
   * Standard entry point for brand new terms.
   */
  async create(dto: CreateSessionDto) {
    this.logger.log(`Creating new session: ${dto.name}`);
    
    return this.repository.create({
        ...dto,
        // Ensure status is correctly typed from your shared types
        status: SessionStatus.DRAFT, 
        isActive: false,
    });
}
  /**
   * 2. Find All Sessions
   * Optimized with class counts for the Admin Dashboard.
   */
  async findAll() {
    return this.repository.findAll();
  }

  async promoteToActive(sessionId: string) {
    this.logger.log(`Promoting session ${sessionId} to Global Active`);

    // 1. Database Transaction
    const session = await this.repository.setGlobalActive(sessionId);
    
    // 2. Immediate Cache Eviction
    // This forces the next 'getActive' call to hit the DB and refresh the cache
    await this.cacheManager.del(this.CACHE_KEY);
    
    return session;
  }

  async cloneFromPrevious(sourceId: string, config: CloneConfigDto) {
    this.logger.log(`Cloning logic initiated for source: ${sourceId}`);

    // 1. Fetch class blueprints
    const templates = await this.repository.findClassesBySession(sourceId);
    
    if (!templates || templates.length === 0) {
      this.logger.warn(`No classes found in session ${sourceId} to clone.`);
    }

    // 2. Create the new session + cloned classes in one transaction
    return this.repository.createSessionWithClasses(config, templates);
  }

  async getCachedActiveSession() {
    // 1. Cache hit?
    const cached = await this.cacheManager.get(this.CACHE_KEY);
    if (cached) return cached;

    // 2. Cache miss -> DB hit
    const active = await this.repository.findActive();
    
    if (!active) throw new NotFoundException('No active term currently set.');

    // 3. Set cache (TTL: 1 hour)
    await this.cacheManager.set(this.CACHE_KEY, active, 3600);

    return active;
  }

  async findClassesBySession(sessionId: string) {
    // 1. Logic: Verify existence via Repository
    const session = await this.repository.findById(sessionId);

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    // 2. Data: Fetch children via Repository
    const classes = await this.repository.findClassesBySessionId(sessionId);

    return {
      sessionName: session?.name,
      classes,
    };
  }


}