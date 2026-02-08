import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: "The user's email.",
    example: 'user@example.com',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "The user's password.",
    example: 'Password@123',
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}
