import { 
  Controller, Post, Get, Body, Param, 
  UseGuards, ParseUUIDPipe 
} from '@nestjs/common';
import { SessionService } from './session.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { Roles, Public } from '../auth/decorators';
import { UserRole } from 'prisma/prisma-client';
import { CreateSessionDto, CloneConfigDto } from './dto';

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionService.create(createSessionDto);
  }

  @Post(':id/activate')
  @Roles(UserRole.ADMIN)
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionService.promoteToActive(id);
  }

  @Post(':id/clone')
  @Roles(UserRole.ADMIN)
  clone(
    @Param('id', ParseUUIDPipe) sourceId: string, 
    @Body() config: CloneConfigDto
  ) {
    return this.sessionService.cloneFromPrevious(sourceId, config);
  }
  
  @Get('active')
  @Public() // Bypasses JwtAuthGuard for the public-facing landing page
  getActive() {
    return this.sessionService.getCachedActiveSession();
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.sessionService.findAll(); // Used by your useSessions hook
  }

  @Get(':sessionId/classes')
  async getSessionClasses(@Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return this.sessionService.findClassesBySession(sessionId);
  }
}