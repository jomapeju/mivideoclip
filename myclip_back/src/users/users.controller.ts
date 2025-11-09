import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Importar el guardián

@Controller('users') // Ruta base: /api/v1/users
export class UsersController {

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
}