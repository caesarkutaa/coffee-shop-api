import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto,LoginDto } from '../Dtos/auth.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@Controller('auth') // Base route for authentication
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user.
   * @param body - RegisterDto containing name, email, and password.
   */
  @Post('register')
  async register(@Body() body: RegisterDto) {
    const { name, email, password } = body;
    this.logger.log(`Incoming registration request for email: ${email}`);
    const response = await this.authService.register(email, password, name);
    this.logger.log(`Registration successful for email: ${email}`);
    return response;
  }

  /**
   * Create a new admin (restricted to superadmins).
   * @param body - RegisterDto containing name, email, and password.
   */
  @Post('create-admin')
  async createAdmin(@Body() body: RegisterDto) {
    const { name, email, password } = body;
    this.logger.log(`Incoming admin creation request for email: ${email}`);
    const response = await this.authService.register(email, password, name, 'admin');
    this.logger.log(`Admin created successfully for email: ${email}`);
    return response;
  }

  /**
   * Log in an existing user.
   * @param body - LoginDto containing email and password.
   */
  @Post('login')
  async login(@Body() body: LoginDto) {
    const { email, password } = body;
    this.logger.log(`Incoming login request for email: ${email}`);
    const response = await this.authService.login(email, password);
    this.logger.log(`Login successful for email: ${email}`);
    return response;
  }
}
