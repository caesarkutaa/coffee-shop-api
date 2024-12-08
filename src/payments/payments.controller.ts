import { Controller, Post, Body, Logger } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto } from '../Dtos/payment.dto';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Initialize a payment session with Paystack
   */
  @Post('initiate')
  async initializePayment(@Body() paymentDto: InitializePaymentDto) {
    this.logger.log(`Initializing payment for order: ${paymentDto.orderId}`);
    return this.paymentsService.initializePayment(paymentDto);
  }

  /**
   * Verify a payment status with Paystack
   */
  @Post('verify')
  async verifyPayment(@Body('reference') reference: string) {
    this.logger.log(`Verifying payment for reference: ${reference}`);
    return this.paymentsService.verifyPayment(reference);
  }
}
