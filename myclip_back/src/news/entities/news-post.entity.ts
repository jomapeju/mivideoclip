/* eslint-disable */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NewsCategory {
  ACTUALIZACIONES = 'ACTUALIZACIONES',
  CONCURSOS = 'CONCURSOS',
  CAMBIOS_NORMAS = 'CAMBIOS_NORMAS',
  GENERAL = 'GENERAL',
}

@Entity('news_posts')
export class NewsPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 200, unique: true })
  slug: string;

  @Column({ type: 'enum', enum: NewsCategory })
  category: NewsCategory;

  @Column({ type: 'text' })
  content: string; // texto largo (puede ser markdown)

  @Column({ type: 'text' })
  excerpt: string; // 
  
  @Column({ default: false })
  pinned: boolean;

  @Column({ default: false })
  featuredOnHome: boolean;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  authorId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
