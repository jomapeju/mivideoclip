// backend/src/videos/entities/vote.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity/user.entity';
import { Video } from './video.entity';

// CRÍTICO: Creamos un índice único para asegurar que un usuario solo vote una vez por video.
@Index(['userId', 'videoId'], { unique: true }) 
@Entity({ name: 'votes' })
export class Vote {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Relación con el usuario que votó
    @Column({ name: 'user_id' })
    userId: string;
    @ManyToOne(() => User)
    user: User;

    // Relación con el video votado
    @Column({ name: 'video_id' })
    videoId: string;
    @ManyToOne(() => Video, (video) => video.video_id)
    video: Video;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}