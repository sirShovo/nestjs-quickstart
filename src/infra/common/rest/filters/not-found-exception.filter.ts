import { HEADER_REQUEST_ID, HttpErrorResponse } from '@/app/common';
import { DomainErrorCode } from '@/domain/common';
import { ArgumentsHost, Catch, HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { of } from 'rxjs';

/**
 *  Catch Not Found exceptions (Coming soon they will be delegated to a map that can bind the exception to an action)
 */
@Catch(NotFoundException)
export class NotFoundExceptionFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger(NotFoundExceptionFilter.name);
  catch(exception: NotFoundException, host: ArgumentsHost) {
    this.logger.debug('Not Found Exception');
    const context = host.switchToHttp();
    const req = context.getRequest<Request>();
    const res = context.getResponse<Response>();

    const { NOT_FOUND } = DomainErrorCode;
    const code = NOT_FOUND.value;
    const status = exception.getStatus() || HttpStatus.NOT_FOUND;
    const response = new HttpErrorResponse(status, code, exception.message, this.getRequestId(req));

    res.status(response.status).json(response);
    // For now, we stop the exception
    return of(response);
  }

  private getRequestId(req: Request): string {
    return req.headers[HEADER_REQUEST_ID] as string;
  }
}
