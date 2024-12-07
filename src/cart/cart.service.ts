import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, RemoveFromCartDto } from '../Dtos/cart.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieve the current user's shopping cart
   */
  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      this.logger.warn(`Cart not found for user: ${userId}`);
      throw new NotFoundException('Cart not found');
    }

    return cart;
  }

  /**   
   * Add a product to the cart
   */
  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { coffeeId, quantity } = addToCartDto;

    // Ensure the cart exists
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
      this.logger.log(`Created a new cart for user: ${userId}`);
    }

    // Check if the product is already in the cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, coffeeId },
    });

    if (existingItem) {
      // Update the quantity
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Add a new item to the cart
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, coffeeId, quantity },
      });
    }    

    this.logger.log(`Added product ${coffeeId} to cart for user: ${userId}`);
    return this.getCart(userId);
  }
   
  /**   
   * Remove a product from the cart
   */
  async removeFromCart(userId: string, removeFromCartDto: RemoveFromCartDto) {
    const { coffeeId } = removeFromCartDto;

    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, coffeeId },
    });

    if (!item) {
      throw new NotFoundException('Product not found in cart');
    }

    await this.prisma.cartItem.delete({ where: { id: item.id } });
    this.logger.log(`Removed product ${coffeeId} from cart for user: ${userId}`);
    return this.getCart(userId);
  }

  /**
   * Checkout the cart
   */
  async checkout(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      throw new NotFoundException('Cart is empty or does not exist');
    }

    // Logic for handling order creation or payment processing can be added here
    this.logger.log(`User ${userId} checked out their cart`);

    // Clear the cart after checkout
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return { message: 'Checkout successful', cart };
  }
}
