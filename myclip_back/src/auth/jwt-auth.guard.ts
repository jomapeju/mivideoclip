import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Usamos la estrategia 'jwt' que definimos en el JwtStrategy
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}