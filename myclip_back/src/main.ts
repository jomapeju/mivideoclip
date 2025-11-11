import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Opcional: Prefijo global de API
  // Útil si quieres que todas tus rutas sean /api/v1/...
  app.setGlobalPrefix('api/v1');

  // 2. === CONFIGURACIÓN CORS (LA SOLUCIÓN) ===
  app.enableCors({
    // Origen permitido. Aquí permitimos el puerto por defecto de Next.js.
    // Si tu frontend corre en otro puerto (ej: 3001), cámbialo aquí.
    origin: [
        'http://localhost:3000', 
        'http://localhost:4000' // Por si el puerto de Next.js cambia
    ],
    // Métodos HTTP que permitimos (POST, GET, etc.)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // Si permitimos que se envíen cookies o encabezados de autenticación (JWT)
    credentials: true,
  });
  // ===========================================

  await app.listen(process.env.DB_PORT ?? 3000);
}
bootstrap();
