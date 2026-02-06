import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('short_urls')
@Index('IDX_short_urls_owner_original', ['ownerId', 'originalUrl'], {
  unique: true,
})
export class ShortUrl extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 6 })
  code: string;

  @Column({ type: 'text' })
  originalUrl: string;

  @Column({ type: 'int', default: 0 })
  clicks: number;

  @Column({ type: 'uuid', nullable: true })
  ownerId?: string;

  @ManyToOne(() => User, (user) => user.shortUrls, { nullable: true })
  @JoinColumn({ name: 'ownerId' })
  owner?: User;
}
