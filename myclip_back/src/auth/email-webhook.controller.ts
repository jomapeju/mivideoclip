/* eslint-disable */
import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';

@Controller('webhooks/email')
export class EmailWebhookController {
  /**
   * Webhook para eventos de Resend.
   * De momento, sólo hace log.
   * Cuando tengas Resend, aquí podrás validar la firma y,
   * si quieres, marcar tokens como entregados, etc.
   */
  @Post('resend')
  @HttpCode(200)
  async handleResendWebhook(
    @Body() payload: any,
    @Headers('resend-signature') signature: string,
  ) {
    // TODO: validar la firma 'signature' con la librería oficial de Resend
    console.log('[Resend Webhook] Firma:', signature);
    console.log('[Resend Webhook] Payload:', JSON.stringify(payload, null, 2));

    // Aquí podrías, por ejemplo:
    // - Buscar por message_id o email
    // - Actualizar un campo "deliveredAt" en EmailVerificationToken
    // - Guardar logs de entregabilidad

    return { received: true };
  }
}
