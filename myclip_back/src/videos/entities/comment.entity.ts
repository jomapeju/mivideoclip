// backend/src/videos/entities/comment.entity.ts

import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne, 
    JoinColumn, 
    CreateDateColumn 
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

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relaciones (Opcional, pero útil para joins)
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
    
    @ManyToOne(() => Video, video => video.video_id)
    @JoinColumn({ name: 'video_id' })
    video: Video;
}