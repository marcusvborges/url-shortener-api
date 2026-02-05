import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';

@Entity('short_urls')
export class ShortUrl extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 6 })
  code: string;

  @Column({ type: 'text' })
  originalUrl: string;

  @Column({ type: 'int', default: 0 })
  clicks: number;
}
