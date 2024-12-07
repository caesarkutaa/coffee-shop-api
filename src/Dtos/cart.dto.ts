import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

/**
 * DTO for adding an item to the cart
 */
export class AddToCartDto {
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsString({ message: 'Product ID must be a string' })
  coffeeId: string;

  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @IsNotEmpty({ message: 'user ID is required' })
  @IsString({ message: 'user ID must be a string' })
  userId: string;
}

/**
 * DTO for removing an item from the cart
 */
export class RemoveFromCartDto {
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsString({ message: 'Product ID must be a string' })
  coffeeId: string;

  @IsNotEmpty({ message: 'user ID is required' })
  @IsString({ message: 'user ID must be a string' })
  userId: string;
}
