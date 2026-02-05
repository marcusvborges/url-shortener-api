import { IsUrl } from 'class-validator';

export class CreateShortUrlDto {
  @IsUrl(
    { require_protocol: true },
    { message: 'originalUrl must be a valid URL with protocol' },
  )
  originalUrl: string;
}
