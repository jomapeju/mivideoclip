/* eslint-disable */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ContestVideo } from './contest-video.entity';

export enum ContestStatus {
    UPCOMING = 'UPCOMING',
    ACTIVE = 'ACTIVE',
    CLOSED = 'CLOSED',
}

@Entity('contests')
export class Contest {
    @PrimaryGeneratedColumn('uuid')
    contest_id: string;

    @Column({ length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'timestamp' })
    start_date: Date;

    @Column({ type: 'timestamp' })
    end_date: Date;
    
    @Column({ type: 'enum', enum: ContestStatus, default: ContestStatus.UPCOMING })
    status: ContestStatus;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    @Column({ type: 'boolean', default: true })
    isPublic: boolean; // Por si hay concursos ocultos o privados

    // Relación con videos inscritos
    @OneToMany(() => ContestVideo, contestVideo => contestVideo.contest)
    submissions: ContestVideo[];
}