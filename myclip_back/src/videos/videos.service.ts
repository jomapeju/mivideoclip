/* eslint-disable */
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In} from 'typeorm';
import * as path from 'path'; // Para manejar rutas de archivos
import { Video, VideoStatus } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { Vote } from './entities/vote.entity';
import { Category } from './entities/category.entity';
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
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
    ) {}

    /**
     * Simula la lógica de almacenamiento y registra el video en la DB.
     * @param createVideoDto Metadatos del video.
     * @param file El objeto del archivo subido por Multer.
     * @param userId ID del usuario obtenido del JWT.
     */
    async uploadAndRegister(createVideoDto: CreateVideoDto, file: Express.Multer.File, userId: string, categoryIds?: string[]): Promise<Video> {
        if (categoryIds && categoryIds.length > 4) {
        throw new BadRequestException('Un video solo puede tener hasta 4 categorías.');
        }

        // Si se proporcionan categories -> comprobar existencia
        let categories: Category[] = [];
        if (categoryIds && categoryIds.length > 0) {
        // eliminamos duplicados y vacíos
        const cleanIds = Array.from(new Set(categoryIds.filter(Boolean)));
        if (cleanIds.length > 4) throw new BadRequestException('Un video solo puede tener hasta 4 categorías.');

        categories = await this.categoriesRepository.find({
            where: { category_id: In(cleanIds) },
        });

        if (categories.length !== cleanIds.length) {
            throw new BadRequestException('Alguna categoría seleccionada no existe.');
        }
        }

        const rawStoragePath = path.join('uploads', file.filename);

        const newVideo = this.videosRepository.create({
        ...createVideoDto,
        user_id: userId,
        rawStoragePath,
        status: VideoStatus.PENDING,
        });

        // Asignar categories (si las hay)
        if (categories.length > 0) {
        newVideo.categories = categories;
        }

        await this.videosRepository.save(newVideo);

        // Simular el job de transcodificación
        this.simulateFFmpegJob(newVideo.video_id);

        return newVideo;
    }

    async findUserVideos(userId: string): Promise<Video[]> {
        return this.videosRepository.find({
            where: { user_id: userId },
            order: { createdAt: 'DESC' }, 
        });
    }

    async findAllPublicVideos(): Promise<Video[]> {
        return this.videosRepository.find({
            where: { status: VideoStatus.ACTIVE },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(videoId: string): Promise<Video> {
        const video = await this.videosRepository.findOne({
            where: { video_id: videoId },
        });

        if (!video) {
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
         const existingVote = await this.votesRepository.findOne({
        where: { videoId, userId },
        });

        if (existingVote) {
        throw new ConflictException('Ya has votado por este video.');
        }

        const video = await this.videosRepository.findOne({ where: { video_id: videoId } });

        if (!video) {
            throw new NotFoundException(`Video con ID ${videoId} no encontrado.`);
        }
        
        if (video.status !== VideoStatus.ACTIVE) {
            throw new ConflictException('Solo se puede votar videos activos.');
        }

        const newVote = this.votesRepository.create({
        videoId: video.video_id,
        userId: userId,
        });
        await this.votesRepository.save(newVote);

        video.voteCount += 1;
        await this.videosRepository.save(video);

        return video;
    }
    

    async findCommentsByVideoId(videoId: string): Promise<Comment[]> {
        return this.commentsRepository.find({
            where: { videoId },
            relations: ['user'], 
            order: { createdAt: 'ASC' }, 
        });
    }

  
    async createComment(videoId: string, userId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
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
            where: { status: VideoStatus.ACTIVE }, 
            order: { voteCount: 'DESC', createdAt: 'DESC' }, 
            take: limit, 
        });
    }

    async findAllCategories(limit: number = 20): Promise<Category[]> {
        return this.categoriesRepository.find({ order: { name: 'ASC' }});
    }


    async searchVideos(q: string): Promise<Video[]> {
        if (!q || q.trim().length === 0) return [];

        return this.videosRepository
            .createQueryBuilder('v')
            .leftJoinAndSelect('v.categories', 'c')
            .where('v.status = :status', { status: VideoStatus.ACTIVE })
            .andWhere(`
            LOWER(v.title) LIKE LOWER(:q)
            OR LOWER(v.songTitle) LIKE LOWER(:q)
            OR LOWER(c.name) LIKE LOWER(:q)
            `)
            .setParameter('q', `%${q}%`)
            .orderBy('v.createdAt', 'DESC')
            .limit(50)
            .getMany();
    }


    async findByCategory(categoryId: string): Promise<Video[]> {
        return this.videosRepository
            .createQueryBuilder('v')
            .leftJoin('v.categories', 'c')
            .where('c.category_id = :categoryId', { categoryId })
            .andWhere('v.status = :status', { status: VideoStatus.ACTIVE })
            .orderBy('v.createdAt', 'DESC')
            .getMany();
    }

}
