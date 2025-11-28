/* eslint-disable */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerificationToken } from '../../auth/entities/email-token.entity';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(EmailVerificationToken)
    private readonly tokenRepo: Repository<EmailVerificationToken>,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Crear token y guardarlo en BBDD
  async generateVerificationToken(userId: string): Promise<string> {
    const token = randomBytes(40).toString('hex');

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const entity = this.tokenRepo.create({
      token,
      userId,
      expiresAt,
    });

    await this.tokenRepo.save(entity);

    return token;
  }

  // Validar token → devuelve userId o null
  async validate(token: string): Promise<string | null> {
    const record = await this.tokenRepo.findOne({ where: { token } });
    if (!record) return null;
    if (record.expiresAt < new Date()) return null;

    return record.userId;
  }

  // Eliminar tokens de un usuario (opcional, por limpieza)
  async deleteTokensForUser(userId: string) {
    await this.tokenRepo.delete({ userId });
  }

  async sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: `"MyClip" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Verifica tu cuenta en MyClip',
      html: `
        <h2>Bienvenido a MyClip</h2>
        <p>Haz clic en el siguiente enlace para activar tu cuenta:</p>
        <p>
          <a href="${verifyUrl}" target="_blank" style="color:#2563eb">
            Verificar correo
          </a>
        </p>
        <p>Este enlace expira en 24 horas.</p>
      `,
    });
  }
}
