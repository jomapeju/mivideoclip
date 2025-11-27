/* eslint-disable */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
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

  @Column({ type: 'timestamptz' })
  start_date: Date;

  @Column({ type: 'timestamptz' })
  end_date: Date;

  @Column({
    type: 'enum',
    enum: ContestStatus,
    default: ContestStatus.UPCOMING,
  })
  status: ContestStatus;

  @Column({ name: 'max_videos_per_user', type: 'int', nullable: true })
  maxVideosPerUser: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => ContestVideo, (cv) => cv.contest)
  submissions: ContestVideo[];
}
