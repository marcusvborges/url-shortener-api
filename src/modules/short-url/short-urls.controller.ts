import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ShortUrlService } from './short-url.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth-guard';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/short-url')
export class ShortUrlController {
  constructor(private readonly shortUrlService: ShortUrlService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Post('shorten')
  create(
    @Body() createShortUrlDto: CreateShortUrlDto,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.shortUrlService.create(createShortUrlDto, user?.id);
  }
}
