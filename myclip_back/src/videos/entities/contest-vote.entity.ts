/* eslint-disable */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Contest } from './contest.entity';
import { Video } from './video.entity';
import { User } from '../../users/entities/user.entity/user.entity';

@Index(['contestId', 'userId'], { unique: true })// Un usuario solo puede votar una vez por concurso y video
@Entity('contest_votes')
export class ContestVote {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'contest_id' })
    contestId: string;

    @Column({ name: 'user_id' })
    userId: string;
    
    @Column({ name: 'video_id', nullable: true }) // Se registra qué video votó
    videoId: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
    
    // Relaciones
    @ManyToOne(() => Contest)
    @JoinColumn({ name: 'contest_id' })
    contest: Contest;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
    
    @ManyToOne(() => Video)
    @JoinColumn({ name: 'video_id' })
    video: Video; 
}