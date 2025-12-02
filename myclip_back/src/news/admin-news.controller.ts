/* eslint-disable */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin/news')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminNewsController {
  constructor(private readonly newsService: NewsService) {}

  // GET /admin/news
  @Get()
  async list(@Query('q') q?: string) {
    if (q && q.trim().length > 0) {
      return this.newsService.searchAdmin(q.trim());
    }
    return this.newsService.findAllAdmin();
  }

  // GET /admin/news/:id
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.newsService.findOneAdmin(id);
  }

  // POST /admin/news
  @Post()
  async create(@Body() dto: CreateNewsDto, @Request() req) {
    const userId = req.user?.id || req.user?.user_id || req.user?.sub;
    return this.newsService.create(dto, userId);
  }

  // PUT /admin/news/:id
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateNewsDto) {
    return this.newsService.update(id, dto);
  }

  // DELETE /admin/news/:id
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.newsService.delete(id);
    return { message: 'Noticia eliminada correctamente' };
  }
}
