import { Logger, Type } from '@nestjs/common';
import { retryBackoff } from 'backoff-rxjs';

const logger = new Logger('RetryOperator');
export function retryOn(params: { instancesOf: Type<Error>[]; maxAttempts: number; minBackoff: number }) {
  const { maxAttempts, minBackoff, instancesOf } = params;

  const isRetry = (error: Error) => instancesOf.some((type) => error instanceof type);
  const shouldRetry = (error: Error) => {
    const shouldRetry = isRetry(error);
    if (shouldRetry) logger.debug(`Retrying due to error [${error.message}]...\n${error.stack}`);
    return shouldRetry;
  };
  return retryBackoff({ maxRetries: maxAttempts, initialInterval: minBackoff, shouldRetry });
}
