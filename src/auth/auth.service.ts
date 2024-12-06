import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}  

  /**
   * Register a new user in the database.
   * @param email - User's email address.
   * @param password - User's plain-text password.
   * @param name - User's name.
   * @param role - Role of the user (default: "user").
   * @returns Success message and user ID.
   */
  async register(email: string, password: string, name: string, role: string = 'user') {
    this.logger.log(`Attempting to register user with email: ${email} and role: ${role}`);

    // Check if a user with the same email already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      this.logger.warn(`Registration failed: User with email ${email} already exists`);
      throw new BadRequestException('User with this email already exists');
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);
    this.logger.log(`Password hashed successfully for user with email: ${email}`);

    // Create a new user in the database
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, name, role },
    });

    this.logger.log(`User registered successfully with ID: ${user.id}`);
    return { message: `User registered successfully as ${role}`, userId: user.id };
  }

  /**
   * Log in an existing user by validating credentials.
   * @param email - User's email address.
   * @param password - User's plain-text password.
   * @returns A JWT token if authentication is successful.
   */
  async login(email: string, password: string) {
    this.logger.log(`Attempting to log in user with email: ${email}`);

    // Find the user by email
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      this.logger.warn(`Login failed: User with email ${email} not found`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for user with email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Generate a JWT token containing the user's ID and role
    const token = this.jwtService.sign({ userId: user.id, role: user.role });
    this.logger.log(`User logged in successfully with email: ${email}`);
      
    return { message: 'Login successful', token };
  }
}
  