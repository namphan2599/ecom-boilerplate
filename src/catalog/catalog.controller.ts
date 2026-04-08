import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { AppRole } from '../common/auth/role.enum';
import { CatalogService } from './catalog.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  @ApiOperation({ summary: 'List published catalog products' })
  @ApiOkResponse({ description: 'Returns the current catalog listing.' })
  listProducts() {
    return this.catalogService.listProducts();
  }

  @Get('products/:slug')
  @ApiOperation({ summary: 'Get a product by slug' })
  @ApiOkResponse({ description: 'Returns the matching catalog product.' })
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

  @Post('admin/products')
  @UseGuards(JwtAuthGuard)
  @Roles(AppRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product as an admin' })
  @ApiCreatedResponse({
    description: 'Creates a catalog product with variants.',
  })
  createProduct(@Body() input: CreateProductDto) {
    return this.catalogService.createProduct(input);
  }

  @Patch('admin/products/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(AppRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product as an admin' })
  updateProduct(@Param('id') id: string, @Body() input: UpdateProductDto) {
    return this.catalogService.updateProduct(id, input);
  }
}
