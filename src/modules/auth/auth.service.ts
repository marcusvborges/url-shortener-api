import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { HashService } from '../hash/hash.service';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ObservabilityService } from '../../common/observability/observability.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly hashService: HashService,
    private readonly observability: ObservabilityService,
  ) {}

  async login(loginDto: LoginDto) {
    const standardizedEmail = loginDto.email.trim().toLowerCase();

    const user = await this.validateUserCredentials(
      standardizedEmail,
      loginDto.password,
    );

    const { accessToken } = this.generateJwtToken(user);

    this.observability.log(`User ${user.id} logged in successfully.`);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const standardizedEmail = registerDto.email.trim().toLowerCase();

    const existingUser = await this.userService.findByEmail(standardizedEmail);
    if (existingUser) {
      this.observability.warn(`Email is already registered.`);
      throw new ConflictException('Email is already registered.');
    }

    const hashedPassword = await this.hashService.hash(registerDto.password);

    const user = await this.userService.create(
      standardizedEmail,
      hashedPassword,
    );

    const { accessToken } = this.generateJwtToken(user);

    this.observability.log(`User ${user.id} registered successfully.`);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  private async validateUserCredentials(
    email: string,
    password: string,
  ): Promise<User> {
    const user = await this.userService.findByEmailWithPassword(email);
    if (!user || !(await this.hashService.compare(password, user.password))) {
      this.observability.warn(`Invalid credentials.`);
      throw new UnauthorizedException('Email or password are incorrect.');
    }
    return user;
  }

  private generateJwtToken(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
