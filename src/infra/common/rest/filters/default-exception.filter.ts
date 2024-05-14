import { HEADER_REQUEST_ID, HttpErrorResponse } from '@/app/common';
import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { of } from 'rxjs';

import { ApiErrorCode } from '..';

/**
 *  Catch all exceptions (Coming soon they will be delegated to a map that can bind the exception to an action)
 */
@Catch()
export class DefaultExceptionFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger(DefaultExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const req = context.getRequest<Request>();
    const res = context.getResponse<Response>();
    const requestId = this.getRequestId(req);

    const message = `[Exception-Name: ${exception.name || 'UNKNOWN'}][HTTP-Route: ${
      req?.route?.path || 'NONE'
    }][Request-Id: ${requestId}]`;
    this.logger.error(message, exception?.stack || exception);

    const { INTERNAL_SERVER_ERROR } = ApiErrorCode;
    const error = (exception?.getResponse?.() as any)?.error || INTERNAL_SERVER_ERROR.value;
    const code = error.toLocaleUpperCase().replace(/\s/gi, '_');
    const status = exception?.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR;
    const response = new HttpErrorResponse(status, code, INTERNAL_SERVER_ERROR.description, requestId);

    res.status(response.status).json(response);
    // For now, we stop the exception
    return of(response);
  }

  private getRequestId(req: Request): string {
    return req.headers[HEADER_REQUEST_ID] as string;
  }
}
