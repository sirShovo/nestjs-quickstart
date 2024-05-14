import { HEADER_REQUEST_ID, HttpErrorResponse } from '@/app/common';
import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger, ServiceUnavailableException } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { of } from 'rxjs';

import { ApiErrorCode } from '..';

/**
 *  Catch Service Unavailable exceptions (Coming soon they will be delegated to a map that can bind the exception to an action)
 */
@Catch(ServiceUnavailableException)
export class ServiceUnavailableExceptionFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger(ServiceUnavailableExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    this.logger.debug('Service Unavailable Exception');
    const context = host.switchToHttp();
    const req = context.getRequest<Request>();
    const res = context.getResponse<Response>();

    const { SERVICE_UNAVAILABLE } = ApiErrorCode;
    const status = exception.getStatus() || HttpStatus.SERVICE_UNAVAILABLE;
    const exceptionResponse = exception.getResponse() as any;
    const response = new HttpErrorResponse(
      status,
      SERVICE_UNAVAILABLE.value,
      SERVICE_UNAVAILABLE.description,
      this.getRequestId(req),
      exceptionResponse,
    );
    res.status(status).json(response);
    return of(response);
  }

  private getRequestId(req: Request): string {
    return req.headers[HEADER_REQUEST_ID] as string;
  }
}
