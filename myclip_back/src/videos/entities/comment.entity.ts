/* eslint-disable */
import { 
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, JoinColumn, CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity/user.entity';
import { Video } from './video.entity';

@Entity({ name: 'comments' })
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    comment_id: string;

    @Column({ name: 'user_id' })
    userId: string;
    
    @Column({ name: 'video_id' })
    videoId: string;
    
    @Column({ type: 'text' })
    content: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
    
    @ManyToOne(() => Video, video => video.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'video_id' })
    video: Video;
}