import { 
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity/user.entity';

// Usamos un enum de TypeScript para mapear el enum de PostgreSQL
export enum VideoStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    ACTIVE = 'ACTIVE',
    BLOCKED = 'BLOCKED',
}

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  video_id: string;

  @Column()
  user_id: string; // Clave foránea simple (para simplificar la relación aquí)

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'song_title', length: 255 })
  songTitle: string;

  @Column({ name: 'raw_storage_path', length: 255 })
  rawStoragePath: string; // Ruta al archivo local temporal o en S3/GCS

  @Column({ name: 'stream_url_hls', nullable: true })
  streamUrlHls: string; // URL de streaming (se llena tras FFMPEG/transcodificación)

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'views_count', default: 0 })
  viewsCount: number;

  @Column({ type: 'int', default: 0, name: 'vote_count' })
  voteCount: number;

  @Column({ type: 'enum', enum: VideoStatus, default: VideoStatus.PENDING })
  status: VideoStatus; // Estado del video

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  // Relación con el usuario (opcional, pero útil)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}