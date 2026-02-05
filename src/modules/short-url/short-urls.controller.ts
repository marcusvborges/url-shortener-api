import { Controller, Post, Body } from '@nestjs/common';
import { ShortUrlService } from './short-url.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';

@Controller('api/short-url')
export class ShortUrlController {
  constructor(private readonly shortUrlService: ShortUrlService) {}

  @Post()
  create(@Body() createShortUrlDto: CreateShortUrlDto) {
    return this.shortUrlService.create(createShortUrlDto);
  }
}
