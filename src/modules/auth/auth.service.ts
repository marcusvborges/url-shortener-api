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
import { TypedConfigService } from '../../config/typed-config.service';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly hashService: HashService,
    private readonly config: TypedConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const standardizedEmail = loginDto.email.trim().toLowerCase();

    const user = await this.validateUserCredentials(
      standardizedEmail,
      loginDto.password,
    );

    const { accessToken } = this.generateJwtToken(user);

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
    if (existingUser) throw new ConflictException('Email already in use');

    const hashedPassword = await this.hashService.hash(registerDto.password);

    const user = await this.userService.create(
      standardizedEmail,
      hashedPassword,
    );

    const { accessToken } = this.generateJwtToken(user);

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
      throw new UnauthorizedException('Invalid credentials');
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
