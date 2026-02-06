import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ShortUrlService } from './short-url.service';

@Controller()
export class RedirectController {
  constructor(private readonly shortUrlService: ShortUrlService) {}

  @Get(':code')
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const url = await this.shortUrlService.countClick(code);
    return res.redirect(302, url);
  }
}
