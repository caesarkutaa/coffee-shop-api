import { Controller, Post, Get, Param, Body, UseGuards, Logger, Patch, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '../Dtos/orders.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard) // Protect all endpoints
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Create an order from the cart
   */
  @Post('create')
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    this.logger.log(`Creating an order for user: ${createOrderDto.userId}`);
    return this.ordersService.createOrder(createOrderDto);
  }

  /**
   * Get a single order by ID
   */
  @Get(':id')
  async getOrderById(@Param('id') orderId: string) {
    this.logger.log(`Fetching order: ${orderId}`);
    return this.ordersService.getOrderById(orderId);
  }

  /**
   * Get all orders for a user
   */
  @Get('user/:userId')
  async getUserOrders(@Param('userId') userId: string) {
    this.logger.log(`Fetching all orders for user: ${userId}`);
    return this.ordersService.getUserOrders(userId);
  }

  /**
   * Admin: Get all orders
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllOrders() {
    this.logger.log('Fetching all orders (admin only)');
    return this.ordersService.getAllOrders();
  }
/**
   * Admin: Update an order's status
   */
@Put(':id') // Use PATCH for partial updates
@Roles('admin') // Restrict access to admins
async updateOrderStatus(
  @Param('id') orderId: string,
  @Body() updateOrderStatusDto: UpdateOrderStatusDto,
) {
  this.logger.log(`Admin updating status for order: ${orderId}`);
  const { status } = updateOrderStatusDto;
  return this.ordersService.updateOrderStatus(orderId, status);
}
}

