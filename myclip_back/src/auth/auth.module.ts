import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { UsersModule } from '../users/users.module'; // Importar UsersModule
import { PassportModule } from '@nestjs/passport'; // Nuevo
import { JwtModule } from '@nestjs/jwt'; // Nuevo
import * as dotenv from 'dotenv'; // Importar dotenv para leer el secreto antes de la configuración

dotenv.config(); // Cargar variables de entorno

const JwtModuleConfig = JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '7d' },
});

@Module({
  imports: [
    forwardRef(() => UsersModule), // Importar UsersModule con forwardRef para evitar dependencias circulares
    PassportModule, // Módulo base de Passport
    JwtModuleConfig,
  ],
  controllers: [AuthController],
  // TODO: Nota: El servicio de autenticación (AuthService) se implementará aquí en un proyecto real.
  // Por simplicidad, pondremos la lógica en el servicio de usuarios por ahora.
  exports: [JwtModuleConfig],
})
export class AuthModule {
  constructor() {
    // Asegúrate de que las variables de entorno se están cargando
    console.log('JWT Configuration:');
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
  }
}
