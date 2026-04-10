import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    example: 1,
    minimum: 0,
    description: 'Use 0 to remove the item.',
  })
  @IsInt()
  @Min(0)
  quantity!: number;
}
