/* eslint-disable */
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Unique } from 'typeorm';
import { Video } from './video.entity';

@Entity({ name: 'video_metrics' })
@Unique(['videoId'])
export class VideoMetrics {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'video_id' })
    videoId: string;

    @Column({ type: 'int', default: 0 })
    totalViews: number;

    @Column({ type: 'int', default: 0 })
    totalLikes: number;

    @Column({ type: 'int', default: 0 })
    totalComments: number;

    @Column({ type: 'int', default: 0 })
    totalContestVotes: number; // suma global de votos en todos los concursos

    @Column({ type: 'float', default: 0 })
    trendingScore: number; 
    /*
      trendingScore podría recalcularse así:
      (views * 0.4) + (likes * 0.3) + (comments * 0.2) + (contestVotes * 0.6)
      ajustado por antigüedad (decay))
    */

    @OneToOne(() => Video, video => video.metrics, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'video_id' })
    video: Video;
}
