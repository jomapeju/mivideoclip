import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { Video } from './entities/video.entity';
import { AuthModule } from '../auth/auth.module'; // Necesario para el guardián

@Module({
  imports: [
    TypeOrmModule.forFeature([Video]), // Registrar la entidad
    AuthModule, // Importar AuthModule para usar JwtAuthGuard
  ],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}