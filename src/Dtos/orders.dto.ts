import { IsIn, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for creating an order from the cart
 */
export class CreateOrderDto {
  @IsNotEmpty({ message: 'User ID is required' })
  @IsString({ message: 'User ID must be a string' })
  userId: string;
}

/**
 * DTO for fetching a specific order
 */
export class GetOrderDto {
  @IsNotEmpty({ message: 'Order ID is required' })
  @IsString({ message: 'Order ID must be a string' })
  orderId: string;
}

/**
 * DTO for updating an order's status
 */
export class UpdateOrderStatusDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsString({ message: 'Status must be a string' })
  @IsIn(['pending', 'completed', 'cancelled'], {
    message: 'Status must be one of: pending, completed, or cancelled',
  })
  status: string;
}
