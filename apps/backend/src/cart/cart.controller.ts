import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import {
  ApiErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/http/api-error-response.dto';
import type { AuthenticatedUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppRole } from '../common/auth/role.enum';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AppRole.CUSTOMER, AppRole.ADMIN)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get the authenticated user cart' })
  @ApiOkResponse({
    description: 'Returns the persistent cart snapshot.',
    schema: {
      example: {
        userId: 'customer-local',
        items: [
          {
            sku: 'HOODIE-BLK-M',
            productName: 'Aura Signature Hoodie',
            quantity: 2,
            currencyCode: 'USD',
            unitPrice: 79.99,
            lineTotal: 159.98,
          },
        ],
        summary: {
          currencyCode: 'USD',
          itemCount: 2,
          distinctItems: 1,
          subtotal: 159.98,
        },
        persistence: 'memory',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'A valid bearer token is required to access the cart.',
    type: ApiErrorResponseDto,
  })
  getCart(@Req() req: Request & { user: AuthenticatedUser }) {
    return this.cartService.getCartForUser(req.user);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add an item to the authenticated user cart' })
  @ApiCreatedResponse({
    description: 'Adds an item and returns the cart snapshot.',
  })
  @ApiBadRequestResponse({
    description: 'The cart item payload failed validation.',
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The requested SKU was not found in the catalog.',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'A valid bearer token is required to modify the cart.',
    type: ApiErrorResponseDto,
  })
  addItem(
    @Req() req: Request & { user: AuthenticatedUser },
    @Body() input: AddCartItemDto,
  ) {
    return this.cartService.addItem(req.user, input);
  }

  @Patch('items/:sku')
  @ApiOperation({ summary: 'Update the quantity for a cart item' })
  updateItem(
    @Req() req: Request & { user: AuthenticatedUser },
    @Param('sku') sku: string,
    @Body() input: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(req.user, sku, input);
  }

  @Delete('items/:sku')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  removeItem(
    @Req() req: Request & { user: AuthenticatedUser },
    @Param('sku') sku: string,
  ) {
    return this.cartService.removeItem(req.user, sku);
  }
}
