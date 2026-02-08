import { IsString, IsUrl } from 'class-validator';

export class CreateShortUrlDto {
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
