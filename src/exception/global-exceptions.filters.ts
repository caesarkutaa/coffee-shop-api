import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  
  @Catch()
  export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.NOT_FOUND;
  
      response.status(status).json({
        statusCode: status,
        message:
          exception instanceof HttpException
            ? exception.getResponse()
            : 'Not Found',
      });
    }
  }
  
  