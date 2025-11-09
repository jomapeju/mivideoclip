import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { UsersModule } from '../users/users.module'; // Importar UsersModule
import { PassportModule } from '@nestjs/passport'; // Nuevo
import { JwtModule } from '@nestjs/jwt'; // Nuevo
import * as dotenv from 'dotenv'; // Importar dotenv para leer el secreto antes de la configuración
import { JwtStrategy } from './strategy/jwt.strategy';

dotenv.config(); // Cargar variables de entorno

const JwtModuleConfig = JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '7d' },
});

@Module({
  imports: [
    forwardRef(() => UsersModule), // Importar UsersModule con forwardRef para evitar dependencias circulares
    PassportModule, // Módulo base de Passport
    // Configuración para usar Passport con JWT
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModuleConfig,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy],
  // TODO: Nota: El servicio de autenticación (AuthService) se implementará aquí en un proyecto real.
  // Por simplicidad, pondremos la lógica en el servicio de usuarios por ahora.
  exports: [JwtModuleConfig, PassportModule, JwtStrategy],
})
export class AuthModule {}
