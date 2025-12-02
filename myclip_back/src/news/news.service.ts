/* eslint-disable */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { NewsPost, NewsCategory } from './entities/news-post.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsPost)
    private readonly newsRepo: Repository<NewsPost>,
  ) {}

  // -------------------------
  // Utils
  // -------------------------
  private slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  private async ensureUniqueSlug(base: string, existingId?: string): Promise<string> {
    let slug = this.slugify(base) || 'news';
    let attempt = 0;

    // Evitar colisión de slug
    while (true) {
      const candidate = attempt === 0 ? slug : `${slug}-${attempt}`;
      const existing = await this.newsRepo.findOne({
        where: { slug: candidate },
      });

      if (!existing || (existingId && existing.id === existingId)) {
        return candidate;
      }
      attempt++;
    }
  }

  // -------------------------
  // Público
  // -------------------------

  async findPublic(category?: NewsCategory): Promise<NewsPost[]> {
    const where: any = { isPublished: true };
    if (category) {
      where.category = category;
    }

    return this.newsRepo.find({
      where,
      order: { pinned: 'DESC', publishedAt: 'DESC' },
    });
  }

  async findPublicBySlug(slug: string): Promise<NewsPost> {
    const post = await this.newsRepo.findOne({
      where: { slug, isPublished: true },
    });

    if (!post) {
      throw new NotFoundException('Noticia no encontrada o no publicada.');
    }

    return post;
  }

  // -------------------------
  // Admin
  // -------------------------

  async findAllAdmin(): Promise<NewsPost[]> {
    return this.newsRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async searchAdmin(q: string): Promise<NewsPost[]> {
    return this.newsRepo.find({
      where: [
        { title: ILike(`%${q}%`) },
        { content: ILike(`%${q}%`) },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneAdmin(id: string): Promise<NewsPost> {
    const post = await this.newsRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Noticia no encontrada');
    return post;
  }

  async create(dto: CreateNewsDto, authorId?: string): Promise<NewsPost> {
    const slug = await this.ensureUniqueSlug(dto.slug || dto.title);

    const now = new Date();
    const isPublished = dto.isPublished ?? false;

    const post = this.newsRepo.create({
      title: dto.title,
      slug,
      category: dto.category,
      content: dto.content,
      excerpt: dto.excerpt,
      pinned: dto.pinned ?? false,
      featuredOnHome: dto.featuredOnHome ?? false,
      isPublished,
      publishedAt: isPublished ? now : null,
      authorId: authorId ?? null,
    });

    return this.newsRepo.save(post);
  }

  async update(id: string, dto: UpdateNewsDto): Promise<NewsPost> {
    const post = await this.findOneAdmin(id);

    if (dto.slug || dto.title) {
      const base = dto.slug || dto.title || post.title;
      post.slug = await this.ensureUniqueSlug(base, post.id);
    }

    if (dto.category !== undefined) post.category = dto.category;
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.excerpt !== undefined) post.excerpt = dto.excerpt;
    if (dto.pinned !== undefined) post.pinned = dto.pinned;
    if (dto.featuredOnHome !== undefined) post.featuredOnHome = dto.featuredOnHome;

    if (dto.isPublished !== undefined) {
      const prev = post.isPublished;
      post.isPublished = dto.isPublished;

      if (!prev && dto.isPublished) {
        // pasa a publicado
        post.publishedAt = new Date();
      } else if (prev && !dto.isPublished) {
        // se despublica, mantenemos publishedAt o lo ponemos null, tu eliges
        post.publishedAt = post.publishedAt ?? new Date();
      }
    }

    return this.newsRepo.save(post);
  }

  async delete(id: string): Promise<void> {
    const post = await this.findOneAdmin(id);
    await this.newsRepo.remove(post);
  }
}
