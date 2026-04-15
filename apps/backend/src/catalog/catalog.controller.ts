import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/http/api-error-response.dto';
import { Roles } from '../common/auth/roles.decorator';
import { AppRole } from '../common/auth/role.enum';
import { RolesGuard } from '../common/auth/roles.guard';
import { CatalogService } from './catalog.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const PRODUCT_IMAGE_MAX_BYTES = Number(
  process.env.PRODUCT_MEDIA_MAX_BYTES ?? 5_242_880,
);

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  @ApiOperation({ summary: 'List published catalog products' })
  @ApiOkResponse({
    description: 'Returns the current catalog listing.',
    schema: {
      example: {
        items: [
          {
            id: 'prod_hoodie',
            name: 'Aura Signature Hoodie',
            slug: 'aura-signature-hoodie',
            status: 'ACTIVE',
            isFeatured: true,
            category: { id: 'cat_apparel', name: 'Apparel', slug: 'apparel' },
            tags: [{ id: 'tag_featured', name: 'Featured', slug: 'featured' }],
            variants: [
              {
                id: 'var_hoodie',
                sku: 'HOODIE-BLK-M',
                title: 'Black / Medium',
                attributes: { color: 'black', size: 'M' },
                inventoryOnHand: 24,
                inventoryReserved: 0,
                isActive: true,
                prices: [
                  {
                    currencyCode: 'USD',
                    amount: 79.99,
                    compareAtAmount: 89.99,
                  },
                ],
              },
            ],
          },
        ],
        total: 1,
      },
    },
  })
  listProducts() {
    return this.catalogService.listProducts();
  }

  @Get('products/:slug')
  @ApiOperation({ summary: 'Get a product by slug' })
  @ApiOkResponse({ description: 'Returns the matching catalog product.' })
  @ApiNotFoundResponse({
    description: 'No product was found for the requested slug.',
    type: ApiErrorResponseDto,
  })
  getProductBySlug(@Param('slug') slug: string) {
    return this.catalogService.getProductBySlug(slug);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List product categories' })
  listCategories() {
    return this.catalogService.listCategories();
  }

  @Get('tags')
  @ApiOperation({ summary: 'List product tags' })
  listTags() {
    return this.catalogService.listTags();
  }

  @Post('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product as an admin' })
  @ApiCreatedResponse({
    description: 'Creates a catalog product with variants.',
    schema: {
      example: {
        id: 'prod_new',
        name: 'Aura Everyday Tee',
        slug: 'aura-everyday-tee',
        status: 'ACTIVE',
        variants: [{ sku: 'TEE-BLK-M', title: 'Black / Medium' }],
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed for the product payload.',
    type: ValidationErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'A valid admin bearer token is required.',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Only admin users can create catalog products.',
    type: ApiErrorResponseDto,
  })
  createProduct(@Body() input: CreateProductDto) {
    return this.catalogService.createProduct(input);
  }

  @Post('admin/products/:id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: PRODUCT_IMAGE_MAX_BYTES,
      },
    }),
  )
  @Roles(AppRole.ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Upload or replace a product hero image as an admin',
  })
  @ApiCreatedResponse({
    description:
      'Stores a product hero image and returns the updated product payload.',
  })
  @ApiBadRequestResponse({
    description: 'The upload is missing, invalid, or not one of JPEG/PNG/WebP.',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'A valid admin bearer token is required.',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Only admin users can upload product media.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The requested product id does not exist.',
    type: ApiErrorResponseDto,
  })
  uploadProductImage(
    @Param('id') id: string,
    @UploadedFile()
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
  ) {
    if (!file) {
      throw new BadRequestException('A product image file is required.');
    }

    return this.catalogService.uploadProductImage(id, file);
  }

  @Delete('admin/products/:id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product hero image as an admin' })
  @ApiOkResponse({
    description:
      'Clears the product image metadata and removes the stored object reference.',
  })
  @ApiUnauthorizedResponse({
    description: 'A valid admin bearer token is required.',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Only admin users can delete product media.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The requested product id does not exist.',
    type: ApiErrorResponseDto,
  })
  deleteProductImage(@Param('id') id: string) {
    return this.catalogService.deleteProductImage(id);
  }

  @Patch('admin/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product as an admin' })
  @ApiOkResponse({ description: 'Returns the updated catalog product.' })
  @ApiBadRequestResponse({
    description: 'Validation failed for the update payload.',
    type: ValidationErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'A valid admin bearer token is required.',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Only admin users can update catalog products.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The requested product id does not exist.',
    type: ApiErrorResponseDto,
  })
  updateProduct(@Param('id') id: string, @Body() input: UpdateProductDto) {
    return this.catalogService.updateProduct(id, input);
  }
}
