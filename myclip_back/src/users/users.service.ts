/* eslint-disable */
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import zxcvbn from 'zxcvbn';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // ===========================
  // REGISTRO
  // ===========================
  async registerUser(dto: CreateUserDto): Promise<any> {
    const { username, email, password } = dto;

    const existing = await this.usersRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existing) {
      if (existing.email === email) {
        throw new ConflictException('El correo electrónico ya está registrado.');
      }
      if (existing.username === username) {
        throw new ConflictException('El nombre de usuario ya está en uso.');
      }
    }

    // ==========================
    // VALIDACIÓN DE FUERZA (ZXCVBN)
    // ==========================
    const strength = zxcvbn(password);

    // score: 0 = muy débil, 4 = muy fuerte
    if (strength.score < 3) {
      throw new ConflictException(
        'La contraseña es demasiado débil. Usa una más compleja.'
      );
    }

    // ==========================
    // HASH PASSWORD
    // ==========================
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = this.usersRepository.create({
      username,
      email,
      passwordHash,
      reputationScore: 0,
      emailVerified: false,
    });

    await this.usersRepository.save(newUser);

    return {
      user_id: newUser.user_id,
      username: newUser.username,
      email: newUser.email,
      reputationScore: newUser.reputationScore,
      createdAt: newUser.createdAt,
    };
  }


  // ===========================
  // VALIDACIÓN (LOGIN)
  // ===========================
  async validateUser(email: string, pass: string) {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return { ...result, id: result.user_id };
    }

    throw new UnauthorizedException('Credenciales inválidas');
  }


  // ===========================
  // VALIDACIÓN (REGISTRO POR EMAIL)
  // ===========================
  async markEmailVerified(userId: string) {
    await this.usersRepository.update(
      { user_id: userId } as any, // o { id: userId } según tu PK real
      { emailVerified: true },
    );
}

    // ===========================
    // BUSCAR USUARIO POR ID (JWT Strategy)
    // ===========================
    async findById(id: string): Promise<User | null> {
      const user = await this.usersRepository.findOne({
        where: { user_id: id },
        select: [
          'user_id',
          'username',
          'email',
          'reputationScore',
          'createdAt',
          'isAdmin',   // 👈 AÑADIDO
        ],
      });

      if (!user) return null;

      return { ...user, user_id: user.user_id };
    }


  // ===========================
  // RANKING
  // ===========================
  async findUserRanking(limit: number = 10): Promise<User[]> {
    const list = await this.usersRepository.find({
      select: ['user_id', 'username', 'reputationScore', 'createdAt'],
      order: { reputationScore: 'DESC', createdAt: 'ASC' },
      take: limit,
    });

    return list.map((u) => ({ ...u, id: u.user_id }));
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }

}
