import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import jwt_decode from 'jwt-decode';
import { Observable } from 'rxjs';

/**
 * Sign the request with the token data (extracting it from the auth header).
 */
@Injectable()
export class DecodeTokenInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const auth = request.get('Authorization');
    if (auth) {
      request.token = jwt_decode(auth);
    }
    return next.handle();
  }
}
