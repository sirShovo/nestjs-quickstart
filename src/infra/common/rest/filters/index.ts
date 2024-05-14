import { DefaultExceptionFilter } from './default-exception.filter';
import { NotFoundExceptionFilter } from './not-found-exception.filter';
import { ServiceUnavailableExceptionFilter } from './service-unavailable-exception.filter';

export * from './default-exception.filter';
export * from './not-found-exception.filter';
export * from './service-unavailable-exception.filter';

export const GlobalExceptionFilters = [
  DefaultExceptionFilter,
  NotFoundExceptionFilter,
  ServiceUnavailableExceptionFilter,
];
