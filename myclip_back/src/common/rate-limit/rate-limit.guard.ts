/* eslint-disable */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { RateLimitService } from "./rate-limit.service";

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private rateLimitService: RateLimitService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const ip = req.ip || req.connection.remoteAddress;

    const result = this.rateLimitService.check(ip);
    if (!result.allowed) {
      throw new ForbiddenException(
        `Too many attempts. Retry in ${Math.round((result.retryAfter || 0) / 1000)}s`,
      );
    }

    return true;
  }
}
