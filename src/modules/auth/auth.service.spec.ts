import { Test } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { HashService } from '../hash/hash.service';
import { JwtService } from '@nestjs/jwt';
import { ObservabilityService } from '../../common/observability/observability.service';

describe('AuthService', () => {
  let service: AuthService;

  const userServiceMock = {
    findByEmail: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    create: jest.fn(),
  };

  const hashServiceMock = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const jwtServiceMock = {
    sign: jest.fn(),
  };

  const observabilityMock = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userServiceMock },
        { provide: HashService, useValue: hashServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ObservabilityService, useValue: observabilityMock },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register successfully', async () => {
      userServiceMock.findByEmail.mockResolvedValue(null);
      hashServiceMock.hash.mockResolvedValue('hashed');
      userServiceMock.create.mockResolvedValue({
        id: 'uuid',
        email: 'test@example.com',
      });
      jwtServiceMock.sign.mockReturnValue('token');

      const result = await service.register({
        email: 'TEST@example.com ',
        password: 'password123',
      });

      expect(userServiceMock.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(hashServiceMock.hash).toHaveBeenCalledWith('password123');
      expect(userServiceMock.create).toHaveBeenCalledWith(
        'test@example.com',
        'hashed',
      );
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        sub: 'uuid',
        email: 'test@example.com',
      });

      expect(result.accessToken).toBe('token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw ConflictException if email exists', async () => {
      userServiceMock.findByEmail.mockResolvedValue({ id: 'x' });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('should not hash or create if email exists', async () => {
      userServiceMock.findByEmail.mockResolvedValue({ id: 'x' });

      await expect(
        service.register({
          email: 'teste@example.com',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(hashServiceMock.hash).not.toHaveBeenCalled();
      expect(userServiceMock.create).not.toHaveBeenCalled();
      expect(jwtServiceMock.sign).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      userServiceMock.findByEmailWithPassword.mockResolvedValue({
        id: 'uuid',
        email: 'test@example.com',
        password: 'hashed',
      });

      hashServiceMock.compare.mockResolvedValue(true);
      jwtServiceMock.sign.mockReturnValue('token');

      const result = await service.login({
        email: 'TEST@example.com',
        password: 'password123',
      });

      expect(userServiceMock.findByEmailWithPassword).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(hashServiceMock.compare).toHaveBeenCalledWith(
        'password123',
        'hashed',
      );
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        sub: 'uuid',
        email: 'test@example.com',
      });

      expect(result.accessToken).toBe('token');
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      userServiceMock.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(jwtServiceMock.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      userServiceMock.findByEmailWithPassword.mockResolvedValue({
        id: 'uuid',
        email: 'test@example.com',
        password: 'hashed',
      });

      hashServiceMock.compare.mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'password321',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(jwtServiceMock.sign).not.toHaveBeenCalled();
    });
  });
});
