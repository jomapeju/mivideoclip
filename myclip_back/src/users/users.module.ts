import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity/user.entity';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  // Importa la entidad para que sea reconocida por el TypeOrmModule
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  controllers: [],
  providers: [UsersService], // Declarar el servicio
  exports: [UsersService, TypeOrmModule], // Exportar el servicio para uso externo
})
export class UsersModule {}
