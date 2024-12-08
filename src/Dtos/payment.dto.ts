import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

/**
 * DTO for initializing a payment
 */
export class InitializePaymentDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsNotEmpty({ message: 'Order ID is required' })
  @IsString({ message: 'Order ID must be a string' })
  orderId: string;
}

/**
 * DTO for verifying a payment
 */
export class VerifyPaymentDto {
  @IsNotEmpty({ message: 'Payment reference is required' })
  @IsString({ message: 'Payment reference must be a string' })
  reference: string;
}
