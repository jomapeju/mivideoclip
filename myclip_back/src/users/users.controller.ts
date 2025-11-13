import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Importar el guardián

import { UsersService } from './users.service';
import { User } from './entities/user.entity/user.entity';

@Controller('users') // Ruta base: /api/v1/users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // Esta ruta requiere un token JWT válido
  @UseGuards(JwtAuthGuard) // <--- ¡El Guardián Protege esta ruta!
  @Get('me')
  getProfile(@Request() req) {
    // req.user contendrá el resultado de validate() del JwtStrategy
    return {
      message: 'Acceso concedido a la ruta protegida.',
      user: req.user,
    };
  }

  @Get('ranking') // GET /api/v1/users/ranking
  // No requiere UseGuards, ya que los rankings suelen ser públicos
  async getUserRanking(@Query('limit') limit: number = 10): Promise<User[]> {
      return this.usersService.findUserRanking(Number(limit));
  }


}