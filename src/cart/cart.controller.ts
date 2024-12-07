import { Controller, Get, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, RemoveFromCartDto } from '../Dtos/cart.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard) // Require authentication for all cart operations
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) {}

  /**
   * Retrieve the current user's shopping cart
   */
  @Get()
  async getCart(@Body('userId') userId: string) {
    this.logger.log(`Retrieving cart for user: ${userId}`);
    return this.cartService.getCart(userId);
  }   
   
  /**
   * Add a product to the cart
   */
  @Post('add')
  async addToCart(@Body('userId') userId: string, @Body() addToCartDto: AddToCartDto) {
    this.logger.log(`Adding product to cart for user: ${userId}`);
    return this.cartService.addToCart(userId, addToCartDto);
  }

  /**
   * Remove a product from the cart
   */
  @Post('remove')
  async removeFromCart(@Body('userId') userId: string, @Body() removeFromCartDto: RemoveFromCartDto) {
    this.logger.log(`Removing product from cart for user: ${userId}`);
    return this.cartService.removeFromCart(userId, removeFromCartDto);
  }

  /**
   * Checkout the cart
   */
  @Post('checkout')
  async checkout(@Body('userId') userId: string) {
    this.logger.log(`Checking out cart for user: ${userId}`);
    return this.cartService.checkout(userId);
  }
}
