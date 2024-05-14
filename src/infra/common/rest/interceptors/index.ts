import { DecodeTokenInterceptor } from './decode-token.interceptor';
import { RouterLoggerInterceptor } from './router-logger.interceptor';

export * from './decode-token.interceptor';
export * from './router-logger.interceptor';

export const GlobalInterceptors = [RouterLoggerInterceptor, DecodeTokenInterceptor];
