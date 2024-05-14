import { DomainError, InvalidValueException } from '../errors';

type ArrayOfResultValues<T> = { [P in keyof T]: T[P] extends Result<infer Type> ? Type : unknown };

export class Result<T> {
  public readonly error: Error;
  protected readonly value: T;

  protected constructor(error?: Error, value?: T) {
    const hasError = error !== undefined;
    const hasValue = value !== undefined;
    if (hasError && hasValue) {
      throw new InvalidValueException([error, value], 'Cannot create a result with an error and a value');
    }

    if (hasError) {
      this.error = error as Error;
    }
    if (hasValue) {
      this.value = value as T;
    }
  }

  public static ok<U = void>(value?: U): Result<U> {
    return Success.of(value);
  }

  public static fail(error: Error): Failure {
    return Failure.of(error);
  }

  public isFailure(): this is Failure {
    return Boolean(this.error);
  }

  public isSuccess(): this is Success<T> {
    return !this.isFailure();
  }

  public validate(predicate: (val: T) => boolean, mapError: (value?: T) => DomainError): Result<T> {
    if (this.isFailure() || predicate(this.getOrThrow())) return this;
    return Result.fail(mapError(this.getOrThrow()));
  }

  public getOrThrow(): T {
    if (this.isFailure()) {
      throw this.error;
    }

    return this.value;
  }

  public exceptionOrNull(): Error | null {
    if (this.isFailure()) return this.error;

    return null;
  }

  public flatMap<R>(transform: (value: T) => Result<R>): Result<R> {
    if (this.isSuccess()) return transform(this.value);
    return this;
  }

  public onSuccess(action: (value: T) => void): Result<T> {
    if (this.isSuccess()) action(this.value);
    return this;
  }

  public onFailure(action: (error: Error) => void): Result<T> {
    if (this.isFailure()) action(this.error);
    return this;
  }

  public transformOnFailure<R>(transform: (value: Failure) => Result<R>): Result<R | T> {
    if (this.isFailure()) return transform(this);
    return this;
  }

  public onBoth(action: (value: Result<T>) => void): Result<T> {
    action(this);
    return this;
  }

  public map<R>(transform: (value: T) => R): Result<R> {
    if (this.isSuccess()) return Result.ok(transform(this.value));
    return this;
  }

  public static combine<T extends Result<any>[]>(results: [...T]): Result<ArrayOfResultValues<T>> {
    for (const result of results) {
      if (result.isFailure()) return result;
    }
    return Result.ok(results.map((val) => val.value) as ArrayOfResultValues<T>);
  }
}

export class Failure extends Result<never> {
  protected constructor(error: Error) {
    super(error);
  }

  public static of(error: Error): Failure {
    return new Failure(error);
  }
}
export class Success<T> extends Result<T> {
  protected constructor(value?: T) {
    super(undefined, value);
  }

  public static of<T>(value?: T): Success<T> {
    return new Success(value);
  }
}
