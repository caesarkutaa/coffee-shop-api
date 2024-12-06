import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'nestjs-prisma';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should hash the password and save the user in the database', async () => {
      // Mock bcrypt hash function
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password');

      // Mock Prisma create user function
      jest.spyOn(prismaService.user, 'create').mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
      });

      const result = await authService.register('test@example.com', 'password123');

      // Assertions
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: { email: 'test@example.com', password: 'hashed-password' },
      });
      expect(result).toEqual({ message: 'User registered successfully', userId: 'user-id' });
    });
  });

  describe('login', () => {
    it('should validate user credentials and return a JWT token', async () => {
      // Mock Prisma findUnique function to return a user
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
      });

      // Mock bcrypt compare function to return true
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.login('test@example.com', 'password123');

      // Assertions
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(jwtService.sign).toHaveBeenCalledWith({ userId: 'user-id', role: 'user' });
      expect(result).toEqual({ message: 'Login successful', token: 'test-token' });
    });

    it('should throw an UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(authService.login('test@example.com', 'password123')).rejects.toThrowError(
        'Invalid credentials',
      );
    });
  });
});

