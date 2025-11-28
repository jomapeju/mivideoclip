/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import * as nodemailer from 'nodemailer';
import { EmailVerificationToken } from '../auth/entities/email-token.entity';



@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    @InjectRepository(EmailVerificationToken)
    private readonly tokensRepo: Repository<EmailVerificationToken>,
  ) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.MAIL_HOST;
    const port = process.env.MAIL_PORT;
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: Number(port) === 465,
        auth: { user, pass },
      });
    } else {
      this.logger.warn(
        'MAIL_* env vars not fully set. Email verification links will be logged to console only.',
      );
    }
  }

  async generate(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');

    const entity = this.tokensRepo.create({
      userId,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
    });

    await this.tokensRepo.save(entity);
    return token;
  }

  async validate(token: string): Promise<string | null> {
    const item = await this.tokensRepo.findOne({ where: { token } });
    if (!item) return null;
    if (item.expiresAt < new Date()) return null;
    return item.userId;
  }

  async sendVerificationEmail(email: string, token: string) {
    const appBaseUrl =
      process.env.APP_BASE_URL || 'http://localhost:4000';

    const verifyUrl = `${appBaseUrl}/api/v1/auth/verify-email?token=${token}`;

    if (!this.transporter) {
      // Modo desarrollo: mostrar en log
      this.logger.log(
        `[DEV] Verification link for ${email}: ${verifyUrl}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || '"MyClip" <no-reply@myclip.com>',
      to: email,
      subject: 'Verifica tu correo en MyClip',
      html: `
        <p>Hola,</p>
        <p>Gracias por registrarte en MyClip. Haz clic en el siguiente enlace para verificar tu correo:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>Si no has creado esta cuenta, puedes ignorar este mensaje.</p>
      `,
    });
  }
}
