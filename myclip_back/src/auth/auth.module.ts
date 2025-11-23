/* eslint-disable */
import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { UsersModule } from '../users/users.module'; // Importar UsersModule
import { PassportModule } from '@nestjs/passport'; // Nuevo
import { JwtModule } from '@nestjs/jwt'; // Nuevo
import * as dotenv from 'dotenv'; // Importar dotenv para leer el secreto antes de la configuración
import { JwtStrategy } from './strategy/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth/auth.service';

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
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy,
    AuthService,
    UsersService,
    {
      provide: ConfigService, // Asegúrate de proveer el ConfigService
      useClass: ConfigService,
    }
  ],
  // TODO: Nota: El servicio de autenticación (AuthService) se implementará aquí en un proyecto real.
  // Por simplicidad, pondremos la lógica en el servicio de usuarios por ahora.
  exports: [JwtModuleConfig, PassportModule, JwtStrategy],
})
export class AuthModule {}
