/* eslint-disable */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { EmailVerificationToken } from './entities/email-token.entity';
import { UsersService } from '../users/users.service';
import { EmailService } from './auth/email.service';
import { v4 as uuid } from 'uuid';
import { randomBytes } from 'crypto';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(EmailVerificationToken)
    private readonly tokenRepo: Repository<EmailVerificationToken>,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  private getFrontendBase(): string {
    return (
      process.env.FRONTEND_URL ||
      'http://localhost:4000'
    );
  }

  /**
   * Genera y envía un email de verificación a un usuario.
   * Se usa tanto en register como en /resend-verification.
   */
  async sendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Para no filtrar usuarios existentes
      throw new BadRequestException('Si el correo existe, se enviará un email de verificación.');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Este correo ya está verificado.');
    }

    // Opcional: limpiar tokens antiguos
    await this.tokenRepo.delete({
      userId: user.user_id,
      expiresAt: LessThan(new Date()),
    });

    // Crear nuevo token
    const token = uuid();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    const entity = this.tokenRepo.create({
      userId: user.user_id,
      token,
      expiresAt,
    });
    await this.tokenRepo.save(entity);

    const verifyUrl = `${this.getFrontendBase()}/auth/verify-email?token=${token}`;

    const { subject, html, text } = this.emailService.buildVerificationEmail({
      username: user.username,
      verifyUrl,
    });

    await this.emailService.sendMail({
      to: email,
      subject,
      html,
      text,
    });

    return { message: 'Email de verificación enviado (si el correo existe).' };
  }

   // 🔹 Generar token y guardarlo en BD
  async generate(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24h

    const entity = this.tokenRepo.create({
      userId,
      token,
      expiresAt,
      usedAt: null,
    });

    await this.tokenRepo.save(entity);
    return token;
  }

  /**
   * Valida un token y devuelve userId si es válido.
   * NO marca todavía el email como verificado.
   */
  async validate(token: string): Promise<string | null> {
    const entity = await this.tokenRepo.findOne({
      where: { token },
    });

    if (!entity) return null;
    if (entity.usedAt) return null;
    if (entity.expiresAt < new Date()) return null;

    // marcar como usado
    entity.usedAt = new Date();
    await this.tokenRepo.save(entity);

    return entity.userId;
  }
}
