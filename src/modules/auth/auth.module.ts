import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { HashModule } from '../hash/hash.module';
import { TypedConfigModule } from 'src/config/typed-config.module';
import { TypedConfigService } from 'src/config/typed-config.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import type { SignOptions } from 'jsonwebtoken';
import { ObservabilityModule } from '../../common/observability/observability.module';

@Module({
  imports: [
    PassportModule,
    ObservabilityModule,
    JwtModule.registerAsync({
      imports: [TypedConfigModule],
      inject: [TypedConfigService],
      useFactory: (config: TypedConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN') as SignOptions['expiresIn'],
        },
      }),
    }),
    UserModule,
    HashModule,
    TypedConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
