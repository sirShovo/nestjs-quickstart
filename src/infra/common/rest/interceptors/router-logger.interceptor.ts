import { HEADER_REQUEST_ID } from '@/app/common';
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RouterLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RouterLoggerInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const requestId = request.headers[HEADER_REQUEST_ID];
    this.logger.log(`${request?.method} - ${request.route.path}. [Request-Id: ${requestId}]`);
    return next.handle();
  }
}
