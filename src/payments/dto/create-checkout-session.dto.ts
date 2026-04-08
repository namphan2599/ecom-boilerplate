import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiPropertyOptional({
    example: 'AURA20',
    description: 'Optional coupon code to apply before session creation.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  couponCode?: string;

  @ApiPropertyOptional({
    example: 'https://storefront.aura.local/checkout/success',
    description: 'Optional storefront success URL.',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  successUrl?: string;

  @ApiPropertyOptional({
    example: 'https://storefront.aura.local/checkout/cancel',
    description: 'Optional storefront cancel URL.',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  cancelUrl?: string;
}
