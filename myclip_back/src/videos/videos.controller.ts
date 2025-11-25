/* eslint-disable */

import { 
    Controller, 
    Post, 
    Get,
    Param,
    Body, 
    UseGuards, 
    Request, 
    UseInterceptors, 
    UploadedFile, 
    BadRequestException,
    Query, 
    ValidationPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import * as path from 'path'; // Para manejar rutas de archivos
import { Video } from './entities/video.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';

// TODO: Configuración de Multer para guardar el archivo en la carpeta 'uploads'
const multerOptions = {
    storage: diskStorage({
        destination: './uploads', // La carpeta donde Multer guarda los archivos temporales
        filename: (req, file, cb) => {
            // Renombrar el archivo para evitar colisiones
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path.extname(file.originalname);
            cb(null, `${uniqueSuffix}${extension}`);
        },
    }),
    // Opcional: Limitar el tamaño y tipo de archivo
    limits: {
        fileSize: 1024 * 1024 * 100 // 100 MB máximo (ajustar según tu Free Tier)
    },
};

@Controller('videos') // Ruta base: /api/v1/videos
export class VideosController {
    constructor(private readonly videosService: VideosService) {}

    @UseGuards(JwtAuthGuard)
    @Get('mine')
    async getMyVideos(@Request() req) {
      // fallback robusto
      const userId = req.user?.user_id || req.user?.id || req.user?.sub;
      console.log('>>> USER from JWT (videos/mine):', req.user);
      return this.videosService.findUserVideos(userId);
    }
    
    @Get() 
    async getAllVideos(): Promise<Video[]> {
      return this.videosService.findAllPublicVideos();
    }

    // =======================================================
  // === 1. RUTA ESPECÍFICA (DEBE IR PRIMERO) ===
  // =======================================================
    @Get('popular') // GET /api/v1/videos/popular
    async getPopularVideos(@Query('limit') limit: number = 20): Promise<Video[]> {
        // Si la plataforma crece, esta ruta debería ser pública (no requiere token)
        return this.videosService.findPopularVideos(Number(limit));
    }
    
    // =======================================================
  // === 2. RUTA DINÁMICA (DEBE IR DESPUÉS) ===
  // =======================================================
    @Get(':id') // GET /api/v1/videos/:id
    async getOneVideo(@Param('id') id: string): Promise<Video> {
        // Lógica para obtener un video por su ID
        return this.videosService.findOne(id);
    }
    
    @UseGuards(JwtAuthGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', multerOptions))
    async uploadVideo(
        @UploadedFile() file: Express.Multer.File,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false })) createVideoDto: CreateVideoDto,
        @Request() req
    ): Promise<Video> {
        if (!file) {
            throw new BadRequestException('Debe adjuntar un archivo de video.');
        }
        const userId = req.user?.user_id || req.user?.id || req.user?.sub;
        return this.videosService.uploadAndRegister(createVideoDto, file, userId);
    }


    // =======================================================
  // === ENDPOINT NUEVO: Votar por Video ===
  // =======================================================
  @UseGuards(JwtAuthGuard)
  @Post(':id/vote') // POST /api/v1/videos/:id/vote
  async voteForVideo(
    @Param('id') videoId: string,
    @Request() req,
  ): Promise<{ message: string; video: Video }> {
    //const userId = req.user.user_id;
    const userId = req.user?.user_id || req.user?.id || req.user?.sub;
    
    // Llamar al servicio para registrar el voto y actualizar el contador
    const updatedVideo = await this.videosService.registerVote(videoId, userId);

    return {
      message: 'Voto registrado exitosamente.',
      video: updatedVideo,
    };
  }

  // =======================================================
  // === ENDPOINT NUEVO: Obtener Comentarios ===
  // =======================================================
  @Get(':id/comments') // GET /api/v1/videos/:id/comments
  async getComments(@Param('id') videoId: string): Promise<Comment[]> {
    return this.videosService.findCommentsByVideoId(videoId);
  }

  // =======================================================
  // === ENDPOINT NUEVO: Crear Comentario (Protegido) ===
  // =======================================================
  @UseGuards(JwtAuthGuard)
  @Post(':id/comments') // POST /api/v1/videos/:id/comments
  async postComment(
    @Param('id') videoId: string,
    @Request() req,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    //const userId = req.user.user_id;
    const userId = req.user?.user_id || req.user?.id || req.user?.sub;
    return this.videosService.createComment(videoId, userId, createCommentDto);
  }

}