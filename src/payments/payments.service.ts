import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';
import { InitializePaymentDto } from '../Dtos/payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  private readonly paystackBaseUrl = process.env.PAYSTACK_BASE_URL;
  private readonly paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  /**
   * Initialize a payment session with Paystack
   */
  async initializePayment(paymentDto: InitializePaymentDto) {
    const { email, amount, orderId } = paymentDto;

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
      this.logger.error(`Error initializing payment: ${error.message}`);
      throw new HttpException(
        'Unable to initialize payment. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify the payment status with Paystack
   */
  async verifyPayment(reference: string) {
    try {
      const response = await axios.get(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
          },
        },
      );

      const { data } = response;
      if (data.data.status !== 'success') {
        throw new HttpException('Payment verification failed', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Payment verified successfully: ${reference}`);
      return {
        status: data.data.status,
        amount: data.data.amount / 100, // Convert amount back from kobo to naira
        currency: data.data.currency,
        orderId: data.data.metadata.orderId,
        paymentDate: data.data.paid_at,
      };
    } catch (error) {
      this.logger.error(`Error verifying payment: ${error.message}`);
      throw new HttpException('Unable to verify payment. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

