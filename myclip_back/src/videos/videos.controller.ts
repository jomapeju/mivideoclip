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
import { Category } from './entities/category.entity';

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
      const userId = req.user?.user_id || req.user?.id || req.user?.sub;
      console.log('>>> USER from JWT (videos/mine):', req.user);
      return this.videosService.findUserVideos(userId);
    }
    
    @Get() 
    async getAllVideos(): Promise<Video[]> {
      return this.videosService.findAllPublicVideos();
    }

    @Get('popular')
    async getPopularVideos(@Query('limit') limit: number = 20): Promise<Video[]> {
        return this.videosService.findPopularVideos(Number(limit));
    }

    @Get('categories') 
    async findAllCategories(@Query('limit') limit: number = 20): Promise<Category[]> {
      return this.videosService.findAllCategories(Number(limit));
    }

    @Get('category/:categoryId')
    async getByCategory(
      @Param('categoryId') categoryId: string
    ): Promise<Video[]> {
      return this.videosService.findByCategory(categoryId);
    }

    @Get('search')
    async searchVideos(
      @Query('q') q: string,
    ): Promise<Video[]> {
      return this.videosService.searchVideos(q);
    }

    @Get(':id') 
    async getOneVideo(@Param('id') id: string): Promise<Video> {
        return this.videosService.findOne(id);
    }
    
    @UseGuards(JwtAuthGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', multerOptions))
    async uploadVideo(
      @UploadedFile() file: Express.Multer.File,
      @Body() body: any, // no usar DTO directo porque multipart convierte todo a string
      @Request() req
    ): Promise<Video> {
      if (!file) {
        throw new BadRequestException('Debe adjuntar un archivo de video.');
      }

      // Extract categoryIds - puede venir como JSON string o como comma-separated
      let categoryIds: string[] = [];
      try {
        if (body.categoryIds) {
          if (typeof body.categoryIds === 'string') {
            // Puede ser JSON '["id1","id2"]' o 'id1,id2'
            try {
              categoryIds = JSON.parse(body.categoryIds);
              if (!Array.isArray(categoryIds)) categoryIds = [];
            } catch (e) {
              categoryIds = body.categoryIds.split(',').map((s: string) => s.trim()).filter(Boolean);
            }
          } else if (Array.isArray(body.categoryIds)) {
            categoryIds = body.categoryIds;
          }
        }
      } catch (e) {
        categoryIds = [];
      }

      if (categoryIds.length > 4) {
        throw new BadRequestException('Puedes seleccionar un máximo de 4 categorías.');
      }

      const userId = req.user?.user_id || req.user?.id || req.user?.sub;

      const createVideoDto = {
        title: body.title,
        songTitle: body.songTitle,
        description: body.description,
        categoryIds: categoryIds,
      };

      return this.videosService.uploadAndRegister(createVideoDto, file, userId, categoryIds);
    }


  @UseGuards(JwtAuthGuard)
  @Post(':id/vote') 
  async voteForVideo(
    @Param('id') videoId: string,
    @Request() req,
  ): Promise<{ message: string; video: Video }> {
    const userId = req.user?.user_id || req.user?.id || req.user?.sub;
    
    const updatedVideo = await this.videosService.registerVote(videoId, userId);

    return {
      message: 'Voto registrado exitosamente.',
      video: updatedVideo,
    };
  }

 
  @Get(':id/comments') 
  async getComments(@Param('id') videoId: string): Promise<Comment[]> {
    return this.videosService.findCommentsByVideoId(videoId);
  }

  
  @UseGuards(JwtAuthGuard)
  @Post(':id/comments') 
  async postComment(
    @Param('id') videoId: string,
    @Request() req,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const userId = req.user?.user_id || req.user?.id || req.user?.sub;
    return this.videosService.createComment(videoId, userId, createCommentDto);
  }

}