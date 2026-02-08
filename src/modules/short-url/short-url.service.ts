import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { UpdateShortUrlDto } from './dto/update-short-url.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ShortUrl } from './entities/short-url.entity';
import { TypedConfigService } from '../../config/typed-config.service';
import { randomInt } from 'crypto';

@Injectable()
export class ShortUrlService {
  private readonly logger = new Logger(ShortUrlService.name);

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
      const existingUrl = await this.shortUrlRepository.findOne({
        where: { ownerId, originalUrl, deletedAt: IsNull() },
      });

      if (existingUrl) {
        this.logger.log(
          `Found existing url, returning existing code: ${existingUrl.code} ownerId: ${ownerId}`,
        );
        return this.mapToResponse(existingUrl);
      }
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = this.generateRandomCode(6);

      const shortUrl = this.shortUrlRepository.create({
        code,
        originalUrl,
        clicks: 0,
        ownerId,
      });
      try {
        const savedShortUrl = await this.shortUrlRepository.save(shortUrl);

        this.logger.log(
          `Short URL created successfully with code: ${savedShortUrl.code} ownerId: ${ownerId}`,
        );

        return this.mapToResponse(savedShortUrl);
      } catch (err) {
        if (!this.isUniqueViolation(err)) throw err;

        this.logger.debug(`Short code collision detected: ${code}`);

        if (ownerId) {
          const existingUrl = await this.shortUrlRepository.findOne({
            where: { ownerId, originalUrl, deletedAt: IsNull() },
          });

          if (existingUrl) {
            this.logger.log(
              `Found existing url (request conflict), returning existing code: ${existingUrl.code} ownerId: ${ownerId}`,
            );
            return this.mapToResponse(existingUrl);
          }
        }
      }

      continue;
    }

    this.logger.warn(
      `Failed to generate unique short code after 5 attempts. ownerId: ${ownerId}`,
    );

    throw new ConflictException(
      'Could not generate a unique short URL code. Please try again',
    );
  }

  async findByOwner(ownerId: string) {
    const urls = await this.shortUrlRepository.find({
      where: { ownerId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    this.logger.log(`Found ${urls.length} URLs for ownerId: ${ownerId}`);

    return urls.map((url) => this.mapToResponse(url));
  }

  async update(
    id: string,
    updateShortUrlDto: UpdateShortUrlDto,
    ownerId: string,
  ) {
    const shortUrl = await this.shortUrlRepository.findOne({
      where: { id, ownerId, deletedAt: IsNull() },
    });

    if (!shortUrl) {
      this.logger.warn(
        `Short URL not found for update. id: ${id} ownerId: ${ownerId}`,
      );
      throw new NotFoundException('Short URL not found');
    }

    if (updateShortUrlDto.originalUrl != undefined) {
      shortUrl.originalUrl = updateShortUrlDto.originalUrl;
    }

    const savedUpdate = await this.shortUrlRepository.save(shortUrl);

    this.logger.log(`Short URL updated: id=${id} ownerId=${ownerId}`);

    return this.mapToResponse(savedUpdate);
  }

  async remove(id: string, ownerId: string) {
    const shortUrl = await this.shortUrlRepository.findOne({
      where: { id, ownerId, deletedAt: IsNull() },
      select: ['id'],
    });

    if (!shortUrl) {
      this.logger.warn(
        `Short URL not found for delete. id: ${id} ownerId: ${ownerId}`,
      );
      throw new NotFoundException('Short URL not found');
    }

    await this.shortUrlRepository.softDelete(shortUrl.id);

    this.logger.log(`Short URL soft deleted: id=${id} ownerId: ${ownerId}`);
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
      id: shortUrl.id,
      code: shortUrl.code,
      shortUrl: this.buildShortUrl(shortUrl.code),
      originalUrl: shortUrl.originalUrl,
      createdAt: shortUrl.createdAt,
      updatedAt: shortUrl.updatedAt,
      clicks: shortUrl.clicks,
    };
  }
}
