/* eslint-disable */
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, ManyToMany, OneToMany } from 'typeorm';
import { Video } from './video.entity';
import { CategoryVideoStats } from './category-video-stats.entity';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    category_id: string;

    @Column({ unique: true, length: 100 })
    name: string; // Ej: Hip Hop, Rock, Indie

    @Column({ nullable: true })
    icon_url: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    // Relación ManyToMany con VideoCategory (definida en Video)
    @ManyToMany(() => Video, video => video.categories)
    videos: Video[];

    @OneToMany(() => CategoryVideoStats, stats => stats.category)
    stats: CategoryVideoStats[];
}