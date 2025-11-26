import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  //OneToOne,
  //JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users') // Mapea a la tabla 'Users' de PostgreSQL
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  // El hash de la contraseña es crucial para la seguridad
  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'reputation_score', default: 0 })
  reputationScore: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
