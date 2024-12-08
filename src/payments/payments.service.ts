import { Injectable, HttpException, HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service'; // Import PrismaService
import { InitializePaymentDto } from '../Dtos/payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  private readonly paystackBaseUrl = process.env.PAYSTACK_BASE_URL;
  private readonly paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initialize a payment session with Paystack
   */
  async initializePayment(paymentDto: InitializePaymentDto) {
    const { email, orderId } = paymentDto;

    // Fetch the order to get the total amount
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const amount = order.total; // Total amount from the order

    try {
      const response = await axios.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Convert amount to kobo (Paystack uses kobo as the base unit)
          metadata: {
            orderId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
          },
        },
      );

      const { data } = response;
      this.logger.log(`Payment session initialized for email: ${email}, orderId: ${orderId}`);
      return {
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
        reference: data.data.reference,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unable to initialize payment.';
      this.logger.error(`Error initializing payment: ${errorMessage}`);
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Verify the payment status with Paystack
   */
  async verifyPayment(reference: string) {
    this.logger.log(`Starting payment verification for reference: ${reference}`);

    try {
      // Make the request to Paystack's verify endpoint
      const response = await axios.get(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
          },
        },
      );

      const { data } = response;

      // Check if the response status is valid
      if (!data.status) {
        this.logger.warn(`Paystack verification failed: ${data.message}`);
        throw new HttpException(data.message || 'Verification failed', HttpStatus.BAD_REQUEST);
      }

      const paymentStatus = data.data.status; // e.g., "success", "abandoned", "failed"
      this.logger.log(`Payment status for reference ${reference}: ${paymentStatus}`);

      // Handle specific payment statuses
      if (paymentStatus === 'success') {
        // Update the order status to "completed"
        const orderId = data.data.metadata.orderId;
        await this.prisma.order.update({
          where: { id: orderId },
          data: { status: 'completed' },
        });

        this.logger.log(`Payment verified successfully for reference: ${reference}`);
        return {
          status: 'success',
          amount: data.data.amount / 100, // Convert amount from kobo to Naira
          currency: data.data.currency,
          orderId: data.data.metadata.orderId,
          paymentDate: data.data.paid_at,
        };
      } else if (paymentStatus === 'abandoned') {
        this.logger.warn(`Payment verification failed for reference: ${reference}, status: abandoned`);
        throw new HttpException('Payment was not completed by the user.', HttpStatus.PAYMENT_REQUIRED);
      } else {
        this.logger.error(`Payment verification failed with status: ${paymentStatus}`);
        throw new HttpException(`Payment verification failed with status: ${paymentStatus}`, HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Payment verification failed';
      this.logger.error(`Error verifying payment: ${errorMessage}`);
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
