import { CanActivateFn } from '@angular/router';

/**
 * Placeholder guard so the route structure is ready for real authentication.
 * When the Spring Boot backend exposes login, inject an AuthService here, return true for staff,
 * and return router.createUrlTree(['/']) for everyone else. The backend must enforce the same rule.
 */
export const adminGuard: CanActivateFn = () => true;
