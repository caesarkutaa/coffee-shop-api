import { SetMetadata } from '@nestjs/common';

/**
 * Define roles allowed for a specific route.
 * @param roles - Array of roles allowed to access the route.
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
