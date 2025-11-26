/* eslint-disable */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Contest } from './contest.entity';
import { Video } from './video.entity';

@Entity('contest_videos') // Une Concurso y Video
export class ContestVideo {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'contest_id' })
    contestId: string;

    @Column({ name: 'video_id' })
    videoId: string;

    /*@Column({ type: 'int', default: 0, name: 'contest_vote_count' })
    contestVoteCount: number; // Contador de votos DENTRO de este concurso*/

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
    
    // Relaciones
    @ManyToOne(() => Contest, contest => contest.submissions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'contest_id' })
    contest: Contest;

    @ManyToOne(() => Video, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'video_id' })
    video: Video;
}