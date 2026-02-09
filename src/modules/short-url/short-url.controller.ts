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
import { ApiTags } from '@nestjs/swagger';
import {
  ApiAuthOptional,
  ApiAuthRequired,
  ApiShortenResponses,
  ApiListMyUrlsResponses,
  ApiUpdateUrlResponses,
  ApiDeleteUrlResponses,
} from '../../common/swagger/swagger.decorator';

@ApiTags('Short URLs')
@Controller('api/short-url')
export class ShortUrlController {
  constructor(private readonly shortUrlService: ShortUrlService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @ApiAuthOptional()
  @ApiShortenResponses()
  @Post()
  create(
    @Body() createShortUrlDto: CreateShortUrlDto,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.shortUrlService.create(createShortUrlDto, user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiAuthRequired()
  @ApiListMyUrlsResponses()
  @Get('me')
  findByOwner(@CurrentUser() user: AuthUser) {
    return this.shortUrlService.findByOwner(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiAuthRequired()
  @ApiUpdateUrlResponses()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateShortUrlDto: UpdateShortUrlDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.shortUrlService.update(id, updateShortUrlDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiAuthRequired()
  @ApiDeleteUrlResponses()
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.shortUrlService.remove(id, user.id);
  }
}
