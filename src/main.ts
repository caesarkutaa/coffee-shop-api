import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './exception/global-exceptions.filters';

import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});

  // Validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        return new UnprocessableEntityException({
          statusCode: 422,
          message: 'Validation failed',
          errors: errors.map((error) => ({
            field: error.property,
            errors: Object.values(error.constraints || {}),
          })),
        });
      },
    }),    
  );

// Apply the global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Set global API prefix
  app.setGlobalPrefix('/v1/api');    

  // Enable CORS
  app.enableCors();

  
  // Get port from environment variables or default to 3000
  const port = process.env.PORT || 3000; // Define the port variable

  try {
    await app.listen(port);
    console.log(`Application is running on port: ${port}`);
  } catch (err) {
    console.error(`Error during startup: ${err.message}`);
    process.exit(1); // Ensures the process exits with status 1 if there's an error
  }
}

bootstrap();
