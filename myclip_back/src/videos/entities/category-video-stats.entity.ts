/* eslint-disable */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Video } from './video.entity';
import { Category } from './category.entity';

@Entity({ name: 'category_video_stats' })
@Unique(['videoId', 'categoryId'])
export class CategoryVideoStats {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'video_id' })
    videoId: string;

    @Column({ name: 'category_id' })
    categoryId: string;

    @Column({ type: 'int', default: 0 })
    totalViews: number;

    @Column({ type: 'int', default: 0 })
    totalLikes: number;

    @Column({ type: 'int', default: 0 })
    totalVotes: number; // votos dentro de concursos filtrables

    @Column({ type: 'int', default: 0 })
    totalComments: number;

    @ManyToOne(() => Video, video => video.stats, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'video_id' })
    video: Video;

    @ManyToOne(() => Category, category => category.stats, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'category_id' })
    category: Category;
}
