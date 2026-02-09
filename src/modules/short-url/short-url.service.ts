import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { UpdateShortUrlDto } from './dto/update-short-url.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ShortUrl } from './entities/short-url.entity';
import { TypedConfigService } from '../../config/typed-config.service';
import { randomInt } from 'crypto';
import { ObservabilityService } from '../../common/observability/observability.service';

@Injectable()
export class ShortUrlService {
  private static readonly CODE_REGEX = /^[0-9A-Za-z]{6}$/;
  private static readonly ALPHABET =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  constructor(
    @InjectRepository(ShortUrl)
    private readonly shortUrlRepository: Repository<ShortUrl>,
    private readonly config: TypedConfigService,
    private readonly observability: ObservabilityService,
  ) {}

  async create(createShortUrlDto: CreateShortUrlDto, ownerId?: string) {
    const originalUrl = createShortUrlDto.originalUrl;

    if (ownerId) {
      const existingUrl = await this.shortUrlRepository.findOne({
        where: { ownerId, originalUrl, deletedAt: IsNull() },
      });

      if (existingUrl) {
        this.observability.debug(
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

        this.observability.log(
          `Short URL created successfully with code: ${savedShortUrl.code} ownerId: ${ownerId}`,
        );

        return this.mapToResponse(savedShortUrl);
      } catch (err) {
        if (!this.isUniqueViolation(err)) throw err;

        this.observability.debug(`Short code collision detected: ${code}`);

        if (ownerId) {
          const existingUrl = await this.shortUrlRepository.findOne({
            where: { ownerId, originalUrl, deletedAt: IsNull() },
          });

          if (existingUrl) {
            this.observability.log(
              `Found existing url (request conflict), returning existing code: ${existingUrl.code} ownerId: ${ownerId}`,
            );
            return this.mapToResponse(existingUrl);
          }
        }
      }

      continue;
    }

    this.observability.warn(
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

    this.observability.log(`Found ${urls.length} URLs`);

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
      this.observability.warn(
        `Short URL not found for update. id: ${id} ownerId: ${ownerId}`,
      );
      throw new NotFoundException('Short URL not found');
    }

    if (updateShortUrlDto.originalUrl != undefined) {
      shortUrl.originalUrl = updateShortUrlDto.originalUrl;
    }

    const savedUpdate = await this.shortUrlRepository.save(shortUrl);

    this.observability.log(`Short URL updated: id=${id} ownerId=${ownerId}`);

    return this.mapToResponse(savedUpdate);
  }

  async remove(id: string, ownerId: string) {
    const shortUrl = await this.shortUrlRepository.findOne({
      where: { id, ownerId, deletedAt: IsNull() },
      select: ['id'],
    });

    if (!shortUrl) {
      this.observability.warn(
        `Short URL not found for delete. id: ${id} ownerId: ${ownerId}`,
      );
      throw new NotFoundException('Short URL not found');
    }

    await this.shortUrlRepository.softDelete(shortUrl.id);

    this.observability.log(
      `Short URL soft deleted: id=${id} ownerId: ${ownerId}`,
    );
  }

  async countClick(code: string): Promise<string> {
    if (!ShortUrlService.CODE_REGEX.test(code)) {
      this.observability.warn(`Invalid short code format: ${code}`);
      throw new BadRequestException('Short URL invalid');
    }

    const shortUrl = await this.shortUrlRepository.findOne({
      where: { code, deletedAt: IsNull() },
      select: ['id', 'originalUrl'],
    });

    if (!shortUrl) {
      this.observability.warn(
        `Short URL not found on redirect for code: ${code}`,
      );
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
