import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'customer@aura.local' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Customer123!' })
  @IsString()
  @MinLength(8)
  password: string;
}
