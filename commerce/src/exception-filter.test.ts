
import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { HttpExceptionFilter } from './exception-filter.js';
import { Status } from './entities/status/Status.js';
import { StatusCode } from './entities/status/StatusCode.js';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  const createArgumentsHost = () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    const host = {
      switchToHttp: vi.fn().mockReturnValue({
        getResponse: vi.fn().mockReturnValue(response),
      }),
    } as unknown as ArgumentsHost;

    return { host, response };
  };

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  describe('when catching an HttpException', () => {
    it('returns the exception HTTP status and system internal error', () => {
      const exception = new HttpException(
        'Something went wrong',
        HttpStatus.BAD_REQUEST,
      );
      const { host, response } = createArgumentsHost();

      filter.catch(exception, host);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.BAD_REQUEST,
      );
      expect(response.json).toHaveBeenCalledWith({
        status: new Status(
          StatusCode.SYSTEM_INTERNAL_ERROR,
          'Something went wrong',
        ),
      });
    });

    it('returns resource not found status when catching NotFoundException', () => {
      const exception = new NotFoundException('Resource not found');
      const { host, response } = createArgumentsHost();

      filter.catch(exception, host);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.NOT_FOUND,
      );
      expect(response.json).toHaveBeenCalledWith({
        status: new Status(
          StatusCode.RESOURCE_NOT_FOUND,
          'Resource not found',
        ),
      });
    });

    it('returns the exception message for NotFoundException', () => {
      const exception = new NotFoundException();
      const { host, response } = createArgumentsHost();

      filter.catch(exception, host);

      expect(response.json).toHaveBeenCalledWith({
        status: new Status(
          StatusCode.RESOURCE_NOT_FOUND,
          'Not Found',
        ),
      });
    });

    it('chains status and json response methods', () => {
      const exception = new HttpException(
        'Forbidden',
        HttpStatus.FORBIDDEN,
      );
      const { host, response } = createArgumentsHost();

      filter.catch(exception, host);

      expect(response.status).toHaveBeenCalledOnce();
      expect(response.json).toHaveBeenCalledOnce();
    });
  });
});
