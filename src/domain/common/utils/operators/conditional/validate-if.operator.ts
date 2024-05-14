import { DomainError } from '@/domain/common/errors';
import { mergeMap, Observable, of, throwError } from 'rxjs';

export function validateIf<T, O extends T = T>(
  iif: (value: T) => value is O,
  mapError: (value: T) => DomainError,
): ReturnType<typeof mergeMap<T, Observable<O>>>;

export function validateIf<T>(
  iif: (value: T) => boolean,
  mapError: (value: T) => DomainError,
): ReturnType<typeof mergeMap<T, Observable<T>>>;

export function validateIf<T>(iif: (value: T) => boolean, mapError: (value: T) => DomainError) {
  return mergeMap((value: T) => {
    if (iif(value)) return of(value);
    return throwError(() => mapError(value));
  });
}
