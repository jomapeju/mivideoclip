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

  @Column({ type: 'timestamp', name: 'start_date' })
  start_date: Date;

  @Column({ type: 'timestamp', name: 'end_date' })
  end_date: Date;

  @Column({
    type: 'enum',
    enum: ContestStatus,
    default: ContestStatus.UPCOMING,
  })
  status: ContestStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => ContestVideo, (cv) => cv.contest)
  submissions: ContestVideo[];
}
