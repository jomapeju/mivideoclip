import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path'; // Para manejar rutas de archivos
import { Video, VideoStatus } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';

@Injectable()
export class VideosService {
    constructor(
        @InjectRepository(Video)
        private videosRepository: Repository<Video>,
    ) {}

    /**
     * Simula la lógica de almacenamiento y registra el video en la DB.
     * @param createVideoDto Metadatos del video.
     * @param file El objeto del archivo subido por Multer.
     * @param userId ID del usuario obtenido del JWT.
     */
    async uploadAndRegister(createVideoDto: CreateVideoDto, file: Express.Multer.File, userId: string): Promise<Video> {
        // TODO: En la fase MVP (Costo Cero):
        // 1. El archivo ya ha sido guardado temporalmente por Multer en la carpeta 'uploads'.
        // 2. Aquí SIMULARÍAMOS la subida a S3 o GCS. Como estamos en Costo Cero,
        //    simplemente usamos la ruta local del archivo.

        // Simulación: Asignar la ruta temporal como la ruta RAW de almacenamiento
        const rawStoragePath = path.join('uploads', file.filename); 

        const newVideo = this.videosRepository.create({
            ...createVideoDto,
            user_id: userId,
            rawStoragePath: rawStoragePath,
            status: VideoStatus.PENDING, // Inicialmente PENDING (esperando transcodificación)
        });

        // Guardar metadata en la base de datos
        await this.videosRepository.save(newVideo);

        // NOTA: Aquí iría la llamada al JOB de FFmpeg (en el próximo paso)
        console.log(`[FFmpeg JOB]: Iniciando procesamiento para archivo: ${rawStoragePath}`);

        return newVideo;
    }
}