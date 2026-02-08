import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

type HttpExceptionResponse =
  | string
  | {
      message?: string | string[];
      error?: string;
      statusCode?: number;
    };

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: HttpExceptionResponse =
      exception instanceof HttpException
        ? (exception.getResponse() as HttpExceptionResponse)
        : 'Internal server error';

    const message = this.normalizeMessage(exceptionResponse);

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.originalUrl ?? request.url,
    });
  }

  private normalizeMessage(res: HttpExceptionResponse): string | string[] {
    if (typeof res === 'string') return res;

    const msg = res.message;

    if (Array.isArray(msg)) return msg;
    if (typeof msg === 'string') return msg;

    return 'Unexpected error';
  }
}
