import { ErrorCode } from '@/domain/common';

export class ApiErrorCode extends ErrorCode {
  static readonly INTERNAL_SERVER_ERROR = ErrorCode.of(
    'INTERNAL_SERVER_ERROR',
    'Something is broken. This is usually a temporary error, for example in a high load situation or if an endpoint is temporarily having issues.',
  );
  static readonly GONE = ErrorCode.of(
    'GONE',
    'This resource is gone. Used to indicate that an API endpoint has been turned off.',
  );
  static readonly TOO_MANY_REQUESTS = ErrorCode.of(
    'TOO_MANY_REQUESTS',
    'Returned when a request cannot be served due to the application’s rate limit having been exhausted for the resource.',
  );
  static readonly BAD_GATEWAY = ErrorCode.of('BAD_GATEWAY', 'Service is down, or being upgraded.');
  static readonly SERVICE_UNAVAILABLE = ErrorCode.of(
    'SERVICE_UNAVAILABLE',
    'Our servers are up, but overloaded with requests. Try again later.',
  );
}
