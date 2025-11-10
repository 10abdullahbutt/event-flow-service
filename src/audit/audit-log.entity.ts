import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('audit_logs')
@Unique(['eventId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @Column()
  userId: string;

  @Column()
  type: string;

  @Column('jsonb')
  payload: Record<string, any>;

  @Column()
  createdAt: string;

  @CreateDateColumn()
  ingestedAt: Date;
}
