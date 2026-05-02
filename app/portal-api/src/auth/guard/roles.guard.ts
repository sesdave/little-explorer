import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Get the required roles from the @Roles decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. If no roles are required, let them through
    if (!requiredRoles) {
      return true;
    }

    // 3. Get the user from the request (attached by JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();
    
    // 4. Check if the user's role matches any of the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}