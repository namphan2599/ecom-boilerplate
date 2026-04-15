import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  IsDateString,
  IsBoolean,
  IsInt,
  IsUppercase,
  Length,
  IsISO8601,
  IsDate,
} from 'class-validator';

import { CouponType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateDiscountDto {
  @IsString()
  @IsNotEmpty()
  @IsUppercase()
  @Length(3, 20)
  code!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CouponType)
  @IsNotEmpty()
  type!: CouponType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  value!: number;

  @IsString()
  @IsOptional()
  @Length(3, 3)
  @IsUppercase()
  currencyCode?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  maxDiscountAmount?: number;

  @IsOptional()
  @IsDateString()
  startsAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  usageLimit?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
