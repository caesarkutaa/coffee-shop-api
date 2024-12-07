import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from '../Dtos/orders.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create an order from the user's cart
   */
  async createOrder(createOrderDto: CreateOrderDto) {
    const { userId } = createOrderDto;

    // Fetch the user's cart and include related items
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { Coffee: true } } }, // Include related cart items and coffee details
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new NotFoundException('Cart is empty or does not exist');
    }

    // Calculate the total
    const items = cart.items.map((item) => ({
      productId: item.coffeeId,
      name: item.Coffee?.name || 'Unknown Coffee',
      price: item.Coffee?.price || 0,
      quantity: item.quantity,
    }));

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create the order
    const order = await this.prisma.order.create({
      data: {
        userId,
        items, // Save the items as JSON in the order
        total,
        status: 'pending',
      },
    });

    // Clear the user's cart after order creation
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    this.logger.log(`Order created successfully for user: ${userId}`);
    return order;
  }

  /**
   * Get an order by ID
   */
  async getOrderById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Get all orders for a user
   */
  async getUserOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
    });

    if (orders.length === 0) {
      throw new NotFoundException('No orders found for this user');
    }

    return orders;
  }

  /**
   * Admin: Get all orders
   */
  async getAllOrders() {
    return this.prisma.order.findMany();
  }

  /**
 * Update an order's status
 */
async updateOrderStatus(orderId: string, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
  
    if (!order) {
      throw new NotFoundException('Order not found');
    }
  
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  
    this.logger.log(`Order status updated to "${status}" for order: ${orderId}`);
    return updatedOrder;
  }
  
     
}
