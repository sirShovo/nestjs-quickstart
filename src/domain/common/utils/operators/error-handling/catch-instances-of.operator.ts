import { Type } from '@nestjs/common';
import { catchError, isObservable, Observable, of, throwError } from 'rxjs';

export function catchInstanceOf<T extends Type<Error>, Out, In>(
  errorClass: T | T[],
  handleError: (error: InstanceType<T>) => Observable<Out> | Out,
) {
  return catchError<In, Observable<Out>>((error) => {
    const classes = Array.isArray(errorClass) ? errorClass : [errorClass];

    const catchedInstace = classes.some((clazz) => error instanceof clazz);
    if (!catchedInstace) return throwError(() => error);
    const result = handleError(error);
    return isObservable(result) ? result : of(result);
  });
}
