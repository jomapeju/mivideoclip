import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity/user.entity';
import { LoginUserDto } from '../dto/login-user.dto';

@Controller('auth') // La ruta base será /api/v1/auth
export class AuthController {
  constructor(private usersService: UsersService) {}

  @Post('register') // Mapea a POST /api/v1/auth/register
  @HttpCode(HttpStatus.CREATED) // Devuelve un código 201
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    // La validación del DTO se hace aquí (usando class-validator en un proyecto real)
    const user = await this.usersService.registerUser(createUserDto);

    // Retorna el objeto usuario (NestJS automáticamente lo convierte a JSON)
    return user;
  }

  @Post('login') // Nueva ruta POST /api/v1/auth/login
  async login(@Body() loginUserDto: LoginUserDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = await this.usersService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );

    if (!user) {
      // Si la validación falla, lanzamos una excepción 401
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Si la validación es exitosa, generamos y devolvemos el token
    return this.usersService.login(user);
  }
}
