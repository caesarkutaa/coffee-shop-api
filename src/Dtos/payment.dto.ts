import { IsNotEmpty, IsString, IsEmail, IsNumber } from 'class-validator';

/**
 * DTO for initializing a payment
 */
export class InitializePaymentDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber({}, { message: 'Amount must be a number' })
  amount: number;

  @IsNotEmpty({ message: 'Order ID is required' })
  @IsString({ message: 'Order ID must be a string' })
  orderId: string;
}
