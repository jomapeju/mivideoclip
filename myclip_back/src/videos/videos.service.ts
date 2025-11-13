import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path'; // Para manejar rutas de archivos
import { Video, VideoStatus } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { Vote } from './entities/vote.entity';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class VideosService {
    constructor(
        @InjectRepository(Video)
        private videosRepository: Repository<Video>,
        @InjectRepository(Vote) 
        private votesRepository: Repository<Vote>,
        @InjectRepository(Comment)
        private commentsRepository: Repository<Comment>,
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
        
        // Ejecutar el Job de transcodificación SIN AWAIT.
        // La API devuelve 201 inmediatamente, y el procesamiento ocurre en segundo plano.
        this.simulateFFmpegJob(newVideo.video_id); 
        
        return newVideo;
    }

    /**
     * Busca todos los videos subidos por un usuario específico.
     */
    async findUserVideos(userId: string): Promise<Video[]> {
        return this.videosRepository.find({
            where: { user_id: userId },
            order: { createdAt: 'DESC' }, // Los más recientes primero
        });
    }

    /**
     * Busca un video por su ID.
     */
    async findOne(videoId: string): Promise<Video> {
        const video = await this.videosRepository.findOne({
            where: { video_id: videoId },
        });

        if (!video) {
            // Manejar error si no se encuentra el video
            throw new NotFoundException(`Video con ID ${videoId} no encontrado.`); 
        }

        return video;
    }

    /**
     * TODO: SIMULACIÓN: Ejecuta el proceso de transcodificación asíncrono.
     * En un proyecto real, esto sería un Message Queue (RabbitMQ, SQS) o un Cron Job.
     */
    async simulateFFmpegJob(videoId: string) {
        console.log(`[JOB] Iniciando transcodificación para ${videoId}...`);
        
        // Simular tiempo de procesamiento
        await new Promise(resolve => setTimeout(resolve, 5000)); 

        // Generar URLs simuladas después de "procesar"
        const streamUrl = `http://cdn.myclip.com/stream/${videoId}/master.m3u8`;
        const thumbnailUrl = `http://cdn.myclip.com/thumbs/${videoId}/default.jpg`;

        // 1. Actualizar el estado en la base de datos
        await this.videosRepository.update(
            { video_id: videoId },
            {
                status: VideoStatus.ACTIVE, // Pasa a ACTIVO
                streamUrlHls: streamUrl,
                thumbnailUrl: thumbnailUrl,
                // Opcional: ELIMINAR el archivo crudo original de ./uploads
            }
        );

        console.log(`[JOB] Video ${videoId} ACTIVO. URL: ${streamUrl}`);
    }

    async registerVote(videoId: string, userId: string): Promise<Video> {
        // 1. Verificar si el voto ya existe (unicidad)
        const existingVote = await this.votesRepository.findOne({
        where: { videoId, userId },
        });

        if (existingVote) {
        throw new ConflictException('Ya has votado por este video.');
        }

        // 2. Verificar que el video exista y esté activo
        const video = await this.videosRepository.findOne({ where: { video_id: videoId } });

        if (!video) {
        throw new NotFoundException(`Video con ID ${videoId} no encontrado.`);
        }
        
        // Opcional: Impedir votar videos que no estén ACTIVOS
        if (video.status !== VideoStatus.ACTIVE) {
            throw new ConflictException('Solo se puede votar videos activos.');
        }

        // 3. Crear y guardar el voto
        const newVote = this.votesRepository.create({
        videoId: video.video_id,
        userId: userId,
        });
        await this.votesRepository.save(newVote);

        // 4. Actualizar el contador de votos del video
        video.voteCount += 1;
        await this.videosRepository.save(video);

        return video; // Devolvemos el video actualizado
    }
    // =======================================================

    /**
   * Obtiene todos los comentarios de un video, incluyendo los datos del usuario.
   */
  async findCommentsByVideoId(videoId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { videoId },
      relations: ['user'], // Une la tabla de comentarios con la tabla de usuarios
      order: { createdAt: 'ASC' }, // Comentarios más antiguos primero
    });
  }

  /**
   * Crea un nuevo comentario.
   */
  async createComment(videoId: string, userId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    // Opcional: Verificar que el video exista (para robustez)
    const videoExists = await this.videosRepository.count({ where: { video_id: videoId } });
    if (videoExists === 0) {
      throw new NotFoundException('El video no existe.');
    }

    const newComment = this.commentsRepository.create({
      videoId,
      userId,
      content: createCommentDto.content,
    });

    return this.commentsRepository.save(newComment);
  }


  /**
 * Obtiene una lista de videos ordenados por el conteo de votos.
 */
async findPopularVideos(limit: number = 20): Promise<Video[]> {
    return this.videosRepository.find({
        where: { status: VideoStatus.ACTIVE }, // Solo videos activos
        order: { voteCount: 'DESC', createdAt: 'DESC' }, // Primero por votos, luego por más reciente
        take: limit, // Limita el número de resultados (ej. Top 20)
    });
}
}
