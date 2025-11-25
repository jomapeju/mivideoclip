/* eslint-disable */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Opcional: Prefijo global de API
  // Útil si quieres que todas tus rutas sean /api/v1/...
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Ignora propiedades no definidas en el DTO
    forbidNonWhitelisted: false, // Lanza error si hay propiedades extra
    transform: true, // Transforma los tipos de datos automáticamente
  }));

  
  app.use(cookieParser()); // <= necesario para leer cookies en req.cookies
  
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

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
