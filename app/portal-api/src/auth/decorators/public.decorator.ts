import { SetMetadata } from '@nestjs/common';

/**
 * Key used to identify public routes in the JwtAuthGuard.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to bypass the Global JWT Auth Guard.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);