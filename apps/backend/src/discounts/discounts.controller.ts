import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/auth/roles.decorator';
import { AppRole } from 'src/common/auth/role.enum';
import { RolesGuard } from 'src/common/auth/roles.guard';

@ApiTags('Discounts')
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}
  @Get()
  @ApiOperation({
    summary: 'List discounts',
    description: 'Returns a list of all available discount coupons.',
  })
  @ApiOkResponse({ description: 'List of discount coupons.' })
  async getDiscounts() {
    return this.discountsService.getDiscounts();
  }

  @Get(':id')
  async getDiscountById(@Param('id') id: string) {
    return this.discountsService.getDiscountById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN)
  async createDiscount(@Body() input: CreateDiscountDto) {
    return this.discountsService.createDiscount(input);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN)
  @ApiBearerAuth()
  async updateDiscount(
    @Param('id') id: string,
    @Body() input: UpdateDiscountDto,
  ) {
    return this.discountsService.updateDiscountById(id, input);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN)
  async deleteDiscount(@Param('id') id: string) {
    return this.discountsService.deleteDiscountById(id);
  }
}
