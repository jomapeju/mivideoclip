/* eslint-disable */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, OneToMany, JoinTable, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity/user.entity';
import { Category } from './category.entity'; 
import { ContestVideo } from './contest-video.entity';
import { VideoMetrics } from './video-metrics.entity';
import { CategoryVideoStats } from './category-video-stats.entity';
import { Comment } from './comment.entity';

export enum VideoStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
}

@Entity({ name: 'videos' })
export class Video {
    @PrimaryGeneratedColumn('uuid', { name: 'video_id' })
    video_id: string;

    @Column({ name: 'user_id' })
    user_id: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'song_title', length: 255 })
    songTitle: string;

    @Column({ name: 'raw_storage_path', length: 255 })
    rawStoragePath: string;

    @Column({ name: 'stream_url_hls', nullable: true })
    streamUrlHls: string;

    @Column({ name: 'thumbnail_url', nullable: true })
    thumbnailUrl: string;

    @Column({ type: 'int', default: 0, name: 'views_count' })
    viewsCount: number;
    
    @Column({ type: 'int', default: 0, name: 'vote_count' })
    voteCount: number; // Votos generales

    @Column({ type: 'enum', enum: VideoStatus, default: VideoStatus.PENDING })
    status: VideoStatus;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    @Column({ type: 'int', default: 0 })
    likesCount: number; // si haces sistema de likes global (opcional)

    @Column({ type: 'int', default: 0 })
    commentsCount: number; // para filtrar rápido en home

    @OneToMany(() => Comment, comment => comment.video)
    comments: Comment[];

    @Column({ type: 'int', default: 0 })
    sharesCount: number; // si en algún momento compartes

    // Relación ManyToOne con el usuario
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
    
    // =======================================================
    // === RELACIÓN NUEVA: ManyToMany con Category ===
    // =======================================================
    @ManyToMany(() => Category, category => category.videos)
    @JoinTable({
        name: 'video_categories', // Tabla pivote
        joinColumn: { name: 'video_id', referencedColumnName: 'video_id' },
        inverseJoinColumn: { name: 'category_id', referencedColumnName: 'category_id' },
    })
    categories: Category[];

    @OneToMany(() => ContestVideo, cv => cv.video)
    contestEntries: ContestVideo[];

    @OneToOne(() => VideoMetrics, metrics => metrics.video)
    metrics: VideoMetrics;

    @OneToMany(() => CategoryVideoStats, stats => stats.video)
    stats: CategoryVideoStats[];
}