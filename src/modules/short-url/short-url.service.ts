import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ShortUrl } from './entities/short-url.entity';
import { TypedConfigService } from '../../config/typed-config.service';
import { randomInt } from 'crypto';

@Injectable()
export class ShortUrlService {
  private static readonly CODE_REGEX = /^[0-9A-Za-z]{6}$/;
  private static readonly ALPHABET =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  constructor(
    @InjectRepository(ShortUrl)
    private readonly shortUrlRepository: Repository<ShortUrl>,
    private readonly config: TypedConfigService,
  ) {}

  async create(createShortUrlDto: CreateShortUrlDto, ownerId?: string) {
    const originalUrl = createShortUrlDto.originalUrl;

    if (ownerId) {
      const existingtUrl = await this.shortUrlRepository.findOne({
        where: { ownerId, originalUrl, deletedAt: IsNull() },
      });

      if (existingtUrl) return this.mapToResponse(existingtUrl);
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = this.generateRandomCode(6);

      const shortUrl = this.shortUrlRepository.create({
        code,
        originalUrl: createShortUrlDto.originalUrl,
        clicks: 0,
        ownerId,
      });
      try {
        const savedShortUrl = await this.shortUrlRepository.save(shortUrl);

        return this.mapToResponse(savedShortUrl);
      } catch (err) {
        if (!this.isUniqueViolation(err)) throw err;

        if (ownerId) {
          const existingtUrl = await this.shortUrlRepository.findOne({
            where: { ownerId, originalUrl, deletedAt: IsNull() },
          });

          if (existingtUrl) return this.mapToResponse(existingtUrl);

          continue;
        }
      }

      throw new ConflictException(
        'Could not generate a unique short URL code. Please try again.',
      );
    }
  }

  async countClick(code: string): Promise<string> {
    if (!ShortUrlService.CODE_REGEX.test(code)) {
      throw new BadRequestException('Short URL invalid');
    }

    const shortUrl = await this.shortUrlRepository.findOne({
      where: { code, deletedAt: IsNull() },
      select: ['id', 'originalUrl'],
    });

    if (!shortUrl) {
      throw new NotFoundException('Short URL not found');
    }

    await this.shortUrlRepository.increment({ id: shortUrl.id }, 'clicks', 1);

    return shortUrl.originalUrl;
  }

  private generateRandomCode(length = 6): string {
    const characters = ShortUrlService.ALPHABET;
    let result = '';

    for (let i = 0; i < length; i++) {
      result += characters[randomInt(0, characters.length)];
    }

    return result;
  }

  private buildShortUrl(code: string): string {
    const baseUrl = this.config.get('BASE_URL').replace(/\/+$/, '');
    return `${baseUrl}/${code}`;
  }

  private isUniqueViolation(err: unknown): boolean {
    const e = err as { code?: string };
    return e?.code === '23505';
  }

  private mapToResponse(shortUrl: ShortUrl) {
    return {
      code: shortUrl.code,
      shortUrl: this.buildShortUrl(shortUrl.code),
      originalUrl: shortUrl.originalUrl,
      clicks: shortUrl.clicks,
    };
  }
}
