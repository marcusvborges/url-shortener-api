import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class CreateShortUrlDto {
  @ApiProperty({
    description: 'The original URL to be shortened.',
    example: 'https://www.example.com/',
  })
  @IsString()
  @IsUrl(
    { require_protocol: true },
    {
      message:
        'originalUrl must be a valid URL including protocol (http/https)',
    },
  )
  originalUrl: string;
}
