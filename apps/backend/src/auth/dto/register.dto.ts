import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Minimum 8 characters, at least 1 uppercase, 1 lowercase, and 1 number',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least 1 uppercase, 1 lowercase, and 1 number',
  })
  password: string;

  @ApiProperty({ example: 'John', required: false })
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsString()
  lastName?: string;
}