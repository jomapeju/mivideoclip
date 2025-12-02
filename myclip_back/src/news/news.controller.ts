/* eslint-disable */
import { Controller, Get, Param, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsCategory } from './entities/news-post.entity';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // GET /news?category=CONCURSOS
  @Get()
  async listPublic(@Query('category') category?: NewsCategory) {
    return this.newsService.findPublic(category);
  }

  // GET /news/:slug
  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.newsService.findPublicBySlug(slug);
  }
}
