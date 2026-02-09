import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository, UpdateResult } from 'typeorm';
import { ShortUrlService } from './short-url.service';
import { ShortUrl } from './entities/short-url.entity';
import { TypedConfigService } from '../../config/typed-config.service';

type RepoMock = jest.Mocked<
  Pick<
    Repository<ShortUrl>,
    'findOne' | 'save' | 'find' | 'increment' | 'softDelete' | 'create'
  >
>;

type ConfigMock = jest.Mocked<Pick<TypedConfigService, 'get'>>;

describe('ShortUrlService', () => {
  let service: ShortUrlService;
  let repo: RepoMock;
  let config: ConfigMock;

  const updateResult: UpdateResult = {
    affected: 1,
    raw: [],
    generatedMaps: [],
  };

  const makeEntity = (overrides: Partial<ShortUrl> = {}): ShortUrl =>
    ({
      id: 'uuid',
      code: 'aZbKq7',
      originalUrl: 'https://example.com',
      clicks: 0,
      ownerId: undefined,
      createdAt: new Date('2026-02-08T00:00:00.000Z'),
      updatedAt: new Date('2026-02-08T00:00:00.000Z'),
      deletedAt: null,
      ...overrides,
    }) as ShortUrl;

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      increment: jest.fn(),
      softDelete: jest.fn(),
      create: jest.fn(),
    };

    config = {
      get: jest.fn(),
    };

    config.get.mockReturnValue('http://localhost:3000');

    repo.create.mockImplementation((input: unknown) => input as ShortUrl);

    const moduleRef = await Test.createTestingModule({
      providers: [
        ShortUrlService,
        { provide: getRepositoryToken(ShortUrl), useValue: repo },
        { provide: TypedConfigService, useValue: config },
      ],
    }).compile();

    service = moduleRef.get(ShortUrlService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create anonymous short url when ownerId is undefined', async () => {
      repo.save.mockResolvedValue(
        makeEntity({ code: 'ABC123', ownerId: undefined }),
      );

      const result = await service.create({
        originalUrl: 'https://example.com',
      });

      expect(repo.findOne).not.toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalledTimes(1);

      expect(result).toMatchObject({
        code: 'ABC123',
        shortUrl: 'http://localhost:3000/ABC123',
        originalUrl: 'https://example.com',
        clicks: 0,
      });
    });

    it('should return existing short url when user shortens same url', async () => {
      repo.findOne.mockResolvedValue(
        makeEntity({ ownerId: 'owner-1', code: 'IDEM01' }),
      );

      const result = await service.create(
        { originalUrl: 'https://example.com' },
        'owner-1',
      );

      expect(repo.findOne).toHaveBeenCalledWith({
        where: {
          ownerId: 'owner-1',
          originalUrl: 'https://example.com',
          deletedAt: IsNull(),
        },
      });
      expect(repo.save).not.toHaveBeenCalled();
      expect(result.shortUrl).toBe('http://localhost:3000/IDEM01');
    });

    it('should retry after code collision and succeed on next attempt', async () => {
      repo.findOne.mockResolvedValue(null);

      const uniqueErr: { code: string } = { code: '23505' };
      repo.save
        .mockRejectedValueOnce(uniqueErr)
        .mockResolvedValueOnce(
          makeEntity({ code: 'OKOKOK', ownerId: 'owner-1' }),
        );

      const result = await service.create(
        { originalUrl: 'https://example.com' },
        'owner-1',
      );

      expect(repo.save).toHaveBeenCalledTimes(2);
      expect(result.code).toBe('OKOKOK');
    });

    it('should return existing short url when concurrent request already created', async () => {
      repo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(
          makeEntity({ ownerId: 'owner-1', code: 'EXIST1' }),
        );

      repo.save.mockRejectedValueOnce({ code: '23505' });

      const result = await service.create(
        { originalUrl: 'https://example.com' },
        'owner-1',
      );

      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(result.code).toBe('EXIST1');
    });

    it('should throw ConflictException after exhausting attempts', async () => {
      repo.save.mockRejectedValue({ code: '23505' });

      await expect(
        service.create({ originalUrl: 'https://example.com' }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(repo.save).toHaveBeenCalledTimes(5);
    });
  });

  describe('findByOwner', () => {
    it('should list urls owned by user and map response', async () => {
      repo.find.mockResolvedValue([
        makeEntity({ ownerId: 'owner-1', code: 'ONE111' }),
        makeEntity({ ownerId: 'owner-1', code: 'TWO222' }),
      ]);

      const result = await service.findByOwner('owner-1');

      expect(repo.find).toHaveBeenCalledWith({
        where: { ownerId: 'owner-1', deletedAt: IsNull() },
        order: { createdAt: 'DESC' },
      });

      expect(result).toHaveLength(2);
      expect(result[0].shortUrl).toBe('http://localhost:3000/ONE111');
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if not found (or not owned)', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.update('id-1', { originalUrl: 'https://new.com' }, 'owner-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should update originalUrl and return mapped response', async () => {
      repo.findOne.mockResolvedValue(
        makeEntity({ id: 'id-1', ownerId: 'owner-1', code: 'UPD123' }),
      );

      repo.save.mockResolvedValue(
        makeEntity({
          id: 'id-1',
          ownerId: 'owner-1',
          code: 'UPD123',
          originalUrl: 'https://new.com',
        }),
      );

      const result = await service.update(
        'id-1',
        { originalUrl: 'https://new.com' },
        'owner-1',
      );

      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(result.originalUrl).toBe('https://new.com');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if not found (or not owned)', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove('id-1', 'owner-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(repo.softDelete).not.toHaveBeenCalled();
    });

    it('should soft delete when found', async () => {
      repo.findOne.mockResolvedValue(
        makeEntity({ id: 'id-1', ownerId: 'owner-1' }),
      );
      repo.softDelete.mockResolvedValue(updateResult);

      await service.remove('id-1', 'owner-1');

      expect(repo.softDelete).toHaveBeenCalledWith('id-1');
    });
  });

  describe('countClick', () => {
    it('should throw BadRequestException for invalid code format', async () => {
      await expect(service.countClick('invalid-code')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when code does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.countClick('aZbKq7')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should increment clicks and returns originalUrl', async () => {
      repo.findOne.mockResolvedValue(
        makeEntity({
          id: 'id-1',
          code: 'aZbKq7',
          originalUrl: 'https://example.com',
        }),
      );
      repo.increment.mockResolvedValue(updateResult);

      const url = await service.countClick('aZbKq7');

      expect(repo.increment).toHaveBeenCalledWith({ id: 'id-1' }, 'clicks', 1);
      expect(url).toBe('https://example.com');
    });
  });
});
