/* eslint-disable */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    
    // req.user viene de JwtStrategy.validate
    if (!user || !user.isAdmin) {
      throw new ForbiddenException('Acceso solo para administradores.');
    }

    return true;
  }
}
