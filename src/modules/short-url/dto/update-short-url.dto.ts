import { PartialType } from '@nestjs/mapped-types';
import { CreateShortUrlDto } from './create-short-url.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateShortUrlDto extends PartialType(CreateShortUrlDto) {
  @ApiPropertyOptional({
    description: 'The updated original URL.',
    example: 'https://updated-example.com/',
  })
  originalUrl?: string;
}
