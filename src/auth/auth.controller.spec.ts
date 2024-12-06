import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should call AuthService.register and return the result', async () => {
      const mockRegisterResult = { message: 'User registered successfully', userId: 'user-id' };
      jest.spyOn(authService, 'register').mockResolvedValue(mockRegisterResult);

      const result = await authController.register('test@example.com', 'password123');

      // Assertions
      expect(authService.register).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(result).toEqual(mockRegisterResult);
    });
  });

  describe('login', () => {
    it('should call AuthService.login and return the result', async () => {
      const mockLoginResult = { message: 'Login successful', token: 'test-token' };
      jest.spyOn(authService, 'login').mockResolvedValue(mockLoginResult);

      const result = await authController.login('test@example.com', 'password123');

      // Assertions
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(result).toEqual(mockLoginResult);
    });
  });
});

