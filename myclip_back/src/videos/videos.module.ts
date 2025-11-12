import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { Video } from './entities/video.entity';
import { AuthModule } from '../auth/auth.module'; // Necesario para el guardián
import { User } from '../users/entities/user.entity/user.entity';
import { Vote } from './entities/vote.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video, User, Vote]), // Registrar la entidad
    AuthModule, // Importar AuthModule para usar JwtAuthGuard
  ],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}