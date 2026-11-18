import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import type { Response } from 'express';
import { Status } from './entities/status/Status.js';
import { StatusCode } from './entities/status/StatusCode.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const httpCode = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const status = this.parseStatus(exception);

    response
      .status(httpCode)
      .json({ status });
  }

  private parseStatus(exception: unknown): Status {
    let statusCode = StatusCode.SYSTEM_INTERNAL_ERROR;
    let statusMessage = 'Internal server error';
    if (exception instanceof HttpException) {
      statusMessage = exception.message;
    }

    if (exception instanceof NotFoundException) {
      statusCode = StatusCode.RESOURCE_NOT_FOUND;
    } else if (exception instanceof ThrottlerException) {
      statusCode = StatusCode.SYSTEM_UNAVAILABLE;
    }
    return new Status(statusCode, statusMessage);
  }
}
