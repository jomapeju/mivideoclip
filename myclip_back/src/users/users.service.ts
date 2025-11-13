import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs'; // Usaremos bcryptjs para hashear
import { User } from './entities/user.entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt'; // Importar JwtService
import { LoginUserDto } from '../auth/dto/login-user.dto'; // Importar el DTO de Login

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) // Inyecta el repositorio de la entidad User
    private usersRepository: Repository<User>,
    private jwtService: JwtService, // Inyectar el servicio JWT
  ) {}

  // Lógica de registro
  async registerUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;

    // 1. Verificar unicidad (TypeORM ya lo maneja, pero es buena práctica)
    const existingUser = await this.usersRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('El correo electrónico ya está registrado.');
      }
      if (existingUser.username === username) {
        throw new ConflictException('El nombre de usuario ya está en uso.');
      }
    }

    // 2. Hashear la contraseña (CRÍTICO DE SEGURIDAD)
    const salt = await bcrypt.genSalt(); // Genera una "sal" (salt) aleatoria
    const passwordHash = await bcrypt.hash(password, salt); // Hashea la contraseña

    // 3. Crear y guardar la entidad
    const newUser = this.usersRepository.create({
      username,
      email,
      passwordHash, // Almacena el hash, NO la contraseña original
      reputationScore: 0,
    });

    // TypeORM sincronizará y guardará en la tabla 'users'
    await this.usersRepository.save(newUser);

    // 4. Devolver el usuario (sin el hash de la contraseña)
    // Nota: en producción, usarías un DTO de respuesta para limpiar el objeto
    return newUser;
  }

  /**
   * Valida la identidad del usuario (usado en el Login)
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      // Si la contraseña coincide, devolvemos el usuario (sin el hash)
      // Omitimos passwordHash para no exponerlo
      const { passwordHash, ...result } = user;
      return result;
    }
    return null; // Credenciales inválidas
  }

  /**
   * Genera el token JWT para un usuario válido
   */
  async login(user: any) {
    // Payload: Datos que se incrustan en el token. Usamos datos mínimos.
    const payload = {
      username: user.username,
      sub: user.user_id 
    };
    
    return {
      // Genera el token con el payload
      access_token: this.jwtService.sign(payload),
      user_id: user.user_id,
      username: user.username
    };
  }


  /**
   * Obtiene el ranking de usuarios por puntuación de reputación.
   */
  async findUserRanking(limit: number = 10): Promise<User[]> {
      return this.usersRepository.find({
          // Seleccionamos solo los campos públicos para el ranking
          select: ['user_id', 'username', 'reputationScore', 'createdAt'], 
          order: { reputationScore: 'DESC', createdAt: 'ASC' }, // De mayor reputación
          take: limit,
      });
  }
}
