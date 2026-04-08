import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';

export class CatalogCategoryDto {
  @ApiProperty({ example: 'Apparel' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'apparel' })
  @IsString()
  slug!: string;
}

export class CatalogTagDto {
  @ApiProperty({ example: 'Featured' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'featured' })
  @IsString()
  slug!: string;
}

export class VariantPriceDto {
  @ApiProperty({ example: 'USD' })
  @IsString()
  currencyCode!: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ example: 39.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  compareAtAmount?: number;
}

export class ProductVariantDto {
  @ApiProperty({ example: 'TEE-BLK-M' })
  @IsString()
  sku!: string;

  @ApiProperty({ example: 'Black / Medium' })
  @IsString()
  title!: string;

  @ApiProperty({ example: { color: 'black', size: 'M' } })
  @IsObject()
  attributes!: Record<string, string>;

  @ApiProperty({ type: [VariantPriceDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VariantPriceDto)
  prices!: VariantPriceDto[];

  @ApiPropertyOptional({ example: 10, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  inventoryOnHand?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  inventoryReserved?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Aura Everyday Tee' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'aura-everyday-tee' })
  @IsString()
  slug!: string;

  @ApiPropertyOptional({ example: 'Soft cotton tee for daily wear.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ example: 'https://example.com/images/tee.jpg' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ type: CatalogCategoryDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CatalogCategoryDto)
  category?: CatalogCategoryDto;

  @ApiPropertyOptional({ type: [CatalogTagDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CatalogTagDto)
  tags?: CatalogTagDto[];

  @ApiProperty({ type: [ProductVariantDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants!: ProductVariantDto[];
}
