import {
  HEADER_REQUEST_ID,
  HEADER_USER_ID,
  HttpErrorResponse,
  InjectionConstant,
  MessageDispatcher,
} from '@/app/common';
import { BadRequest, DomainError, NotFound } from '@/domain/common';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';

import { ApiErrorCode } from './errors/api-error-code';

@Injectable()
export abstract class AbstractHttpResource {
  protected readonly logger: Logger;
  constructor(
    @Inject(InjectionConstant.MESSAGE_DISPATCHER)
    protected readonly messageDispatcher: MessageDispatcher,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  abstract handle(req: Request, res: Response, ...args: any[]): Observable<Response>;

  protected handleError(req: Request, res: Response, error: Error): Response {
    if (error instanceof NotFound) {
      return this.notFound(req, res, error);
    }

    if (error instanceof BadRequest) {
      return this.badRequest(req, res, error);
    }

    const requestId = this.getRequestId(req);
    const errorCode = error instanceof DomainError ? `[Code: ${error.code}] ` : '';

    const errorMessage = `${errorCode}Unexpected error occurred. [Request-Id: ${requestId}]`;
    this.logger.error(errorMessage, error?.stack || error);
    return this.internalServerError(req, res);
  }

  protected ok<T>(res: Response, body: T): Response<T> {
    return res.status(HttpStatus.OK).json(body);
  }

  protected created<T>(res: Response, body: T): Response<T> {
    return res.status(HttpStatus.CREATED).json(body);
  }

  protected noContent(res: Response): Response<void> {
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  protected notModified(res: Response): Response<void> {
    return res.status(HttpStatus.NOT_MODIFIED).send();
  }

  protected unauthorized(req: Request, res: Response, error: DomainError): Response<HttpErrorResponse> {
    const response = new HttpErrorResponse(HttpStatus.UNAUTHORIZED, error.code, error.message, this.getRequestId(req));
    return res.status(response.status).json(response);
  }

  protected forbidden(req: Request, res: Response, error: DomainError): Response<HttpErrorResponse> {
    const response = new HttpErrorResponse(HttpStatus.FORBIDDEN, error.code, error.message, this.getRequestId(req));
    return res.status(response.status).json(response);
  }

  protected notFound(req: Request, res: Response, error: DomainError): Response<HttpErrorResponse> {
    const response = new HttpErrorResponse(HttpStatus.NOT_FOUND, error.code, error.message, this.getRequestId(req));
    return res.status(response.status).json(response);
  }

  protected conflict(req: Request, res: Response, error: DomainError): Response<HttpErrorResponse> {
    const response = new HttpErrorResponse(HttpStatus.CONFLICT, error.code, error.message, this.getRequestId(req));
    return res.status(response.status).json(response);
  }

  protected gone(req: Request, res: Response): Response<HttpErrorResponse> {
    const code = ApiErrorCode.GONE;
    const response = new HttpErrorResponse(HttpStatus.GONE, code.value, code.description, this.getRequestId(req));
    return res.status(response.status).json(response);
  }

  protected tooManyRequests(req: Request, res: Response): Response<HttpErrorResponse> {
    const code = ApiErrorCode.TOO_MANY_REQUESTS;
    const response = new HttpErrorResponse(
      HttpStatus.TOO_MANY_REQUESTS,
      code.value,
      code.description,
      this.getRequestId(req),
    );
    return res.status(response.status).json(response);
  }

  protected badGateway(req: Request, res: Response): Response<HttpErrorResponse> {
    const code = ApiErrorCode.BAD_GATEWAY;
    const response = new HttpErrorResponse(
      HttpStatus.BAD_GATEWAY,
      code.value,
      code.description,
      this.getRequestId(req),
    );
    return res.status(response.status).json(response);
  }

  protected serviceUnavailable(req: Request, res: Response): Response<HttpErrorResponse> {
    const code = ApiErrorCode.SERVICE_UNAVAILABLE;
    const response = new HttpErrorResponse(
      HttpStatus.SERVICE_UNAVAILABLE,
      code.value,
      code.description,
      this.getRequestId(req),
    );
    return res.status(response.status).json(response);
  }

  protected internalServerError(req: Request, res: Response, error?: DomainError): Response<HttpErrorResponse> {
    const code = ApiErrorCode.INTERNAL_SERVER_ERROR;
    const response = new HttpErrorResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      error?.code || code.value,
      error?.message || code.description,
      this.getRequestId(req),
    );
    return res.status(response.status).json(response);
  }

  protected badRequest(req: Request, res: Response, error: DomainError): Response<HttpErrorResponse> {
    const response = new HttpErrorResponse(HttpStatus.BAD_REQUEST, error.code, error.message, this.getRequestId(req));
    return res.status(response.status).json(response);
  }

  protected getRequestId(req: Request): string {
    return req.headers[HEADER_REQUEST_ID] as string;
  }
  protected getCurrentUserId(req: Request): string {
    return req.headers[HEADER_USER_ID] as string;
  }
}
