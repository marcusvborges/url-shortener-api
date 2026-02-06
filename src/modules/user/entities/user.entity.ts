import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { ShortUrl } from '../../short-url/entities/short-url.entity';

@Entity('users')
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @OneToMany(() => ShortUrl, (shortUrl) => shortUrl.owner)
  shortUrls?: ShortUrl[];
}
