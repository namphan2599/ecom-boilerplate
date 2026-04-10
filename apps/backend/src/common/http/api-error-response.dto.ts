import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({ example: 401 })
  statusCode!: number;

  @ApiProperty({ example: '2026-04-08T14:20:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: '/auth/login' })
  path!: string;

  @ApiProperty({ example: 'POST' })
  method!: string;

  @ApiProperty({
    example: 'Invalid email or password.',
    description: 'Human-readable error message or messages.',
    oneOf: [
      { type: 'string' },
      {
        type: 'array',
        items: { type: 'string' },
      },
    ],
  })
  message!: string | string[];
}

export class ValidationErrorResponseDto extends ApiErrorResponseDto {
  @ApiProperty({
    example: ['email must be an email', 'password should not be empty'],
    type: [String],
  })
  declare message: string[];
}
