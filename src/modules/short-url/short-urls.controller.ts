import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  Delete,
  Param,
  Get,
  HttpCode,
} from '@nestjs/common';
import { ShortUrlService } from './short-url.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { UpdateShortUrlDto } from './dto/update-short-url.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth-guard';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';

@Controller('api/short-url')
export class ShortUrlController {
  constructor(private readonly shortUrlService: ShortUrlService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  create(
    @Body() createShortUrlDto: CreateShortUrlDto,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.shortUrlService.create(createShortUrlDto, user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findByOwner(@CurrentUser() user: AuthUser) {
    return this.shortUrlService.findByOwner(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateShortUrlDto: UpdateShortUrlDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.shortUrlService.update(id, updateShortUrlDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.shortUrlService.remove(id, user.id);
  }
}
