/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private transporter: nodemailer.Transporter | null = null;
  private resend: Resend | null = null;
  private fromAddress: string;

  constructor() {
    this.fromAddress = process.env.EMAIL_FROM || 'no-reply@myclip.com';

    const useResend =
      process.env.NODE_ENV === 'production' &&
      !!process.env.RESEND_API_KEY;

    if (useResend) {
      // 🔹 Producción → Resend
      this.resend = new Resend(process.env.RESEND_API_KEY);
      this.logger.log('EmailService: usando Resend API para envío de emails');
    } else {
      // 🔹 Desarrollo → Nodemailer + Gmail
      const user = process.env.GMAIL_USER;
      const pass = process.env.GMAIL_PASS;

      if (!user || !pass) {
        this.logger.warn(
          'EmailService: GMAIL_USER o GMAIL_PASS no están definidos. Los emails se harán solo log (no se enviarán).',
        );
      } else {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass },
        });
        this.logger.log('EmailService: usando Nodemailer + Gmail');
      }
    }
  }

  /**
   * Enviar email genérico (HTML + texto plano)
   */
  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }) {
    const { to, subject, html, text } = options;

    // 🔹 Producción: Resend si está configurado
    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: this.fromAddress,
          to,
          subject,
          html,
          text,
        });
        this.logger.log(`Email enviado vía Resend a ${to}`);
        return;
      } catch (err) {
        this.logger.error('Error enviando email vía Resend', err as any);
      }
    }

    // 🔹 Desarrollo: Nodemailer + Gmail si existe transporter
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.fromAddress,
          to,
          subject,
          html,
          text,
        });
        this.logger.log(`Email enviado vía Nodemailer/Gmail a ${to}`);
        return;
      } catch (err) {
        this.logger.error('Error enviando email vía Nodemailer', err as any);
      }
    }

    // 🔹 Fallback: solo log
    this.logger.warn(
      `EmailService fallback: se habría enviado un email a ${to} - asunto: ${subject}`,
    );
  }

  /**
   * Construye el email de verificación en HTML + texto plano
   */
  buildVerificationEmail(params: {
    username?: string;
    verifyUrl: string;
  }): { subject: string; html: string; text: string } {
    const { username, verifyUrl } = params;

    const subject = 'Activa tu cuenta en MyClip 🎬';

    const text = `Hola${username ? ` ${username}` : ''},

Gracias por registrarte en MyClip.

Por favor, verifica tu correo haciendo clic en el siguiente enlace:

${verifyUrl}

Si tú no has solicitado esta cuenta, puedes ignorar este mensaje.

MyClip`;

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Activa tu cuenta</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #0f172a;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #e5e7eb;
    }
    .wrapper {
      width: 100%;
      padding: 24px 0;
    }
    .container {
      max-width: 480px;
      margin: 0 auto;
      background: #020617;
      border-radius: 16px;
      border: 1px solid #1e293b;
      padding: 24px;
    }
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    .logo-badge {
      width: 32px;
      height: 32px;
      border-radius: 9999px;
      background: linear-gradient(135deg, #ef4444, #f97316);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: 14px;
    }
    .logo-text {
      font-weight: 700;
      font-size: 18px;
      color: #f9fafb;
    }
    .logo-sub {
      font-size: 11px;
      color: #9ca3af;
    }
    h1 {
      color: #f9fafb;
      font-size: 20px;
      margin: 12px 0;
    }
    p {
      font-size: 14px;
      line-height: 1.5;
      color: #e5e7eb;
    }
    .btn {
      display: inline-block;
      margin-top: 16px;
      padding: 10px 20px;
      border-radius: 9999px;
      background: linear-gradient(135deg, #ef4444, #f97316);
      color: #fff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
    }
    .link-fallback {
      margin-top: 16px;
      font-size: 12px;
      color: #9ca3af;
      word-break: break-all;
    }
    .footer {
      margin-top: 16px;
      font-size: 11px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo">
        <div class="logo-badge">MC</div>
        <div>
          <div class="logo-text">MyClip</div>
          <div class="logo-sub">Videoclips, concursos y rankings</div>
        </div>
      </div>

      <h1>Activa tu cuenta</h1>
      <p>Hola${username ? ` <strong>${username}</strong>` : ''},</p>
      <p>
        Gracias por registrarte en <strong>MyClip</strong>. Antes de poder usar
        tu cuenta necesitamos que verifiques tu correo electrónico.
      </p>
      <p>
        Haz clic en el siguiente botón para activar tu cuenta:
      </p>

      <p>
        <a class="btn" href="${verifyUrl}" target="_blank" rel="noopener noreferrer">
          Activar mi cuenta
        </a>
      </p>

      <p class="link-fallback">
        Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
        ${verifyUrl}
      </p>

      <p class="footer">
        Si tú no has solicitado esta cuenta, ignora este mensaje.<br />
        © ${new Date().getFullYear()} MyClip
      </p>
    </div>
  </div>
</body>
</html>`;

    return { subject, html, text };
  }
}
