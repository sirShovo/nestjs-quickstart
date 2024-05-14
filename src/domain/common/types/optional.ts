// Thanks to https://github.com/kreatemore/optional-type/

import { InvalidValueException } from '../errors';
import { Result } from './result';

export class Optional<T> {
  private readonly value: OptionalValue<T>;
  private readonly invalidTypes = new Set<InvalidType>();
  private readonly allowedInvalidTypes = new Set<InvalidType>();

  private constructor(
    value?: OptionalValue<T>,
    invalidTypes: InvalidType[] = [],
    allowedInvalidTypes: InvalidType[] = [],
    private readonly valueTrace = '',
  ) {
    this.invalidTypes = new Set<InvalidType>(invalidTypes);
    this.allowedInvalidTypes = new Set<InvalidType>(allowedInvalidTypes);

    if (this.isTypeInvalid(value)) {
      throw new InvalidValueException(value, 'Optional received an invalid value');
    }

    this.value = value;
  }

  traced<U>(value: U, ...path: (string | number)[]): Optional<U> {
    return new Optional(
      value,
      [...this.invalidTypes],
      [...this.allowedInvalidTypes],
      [this.valueTrace, ...path].join('.'),
    );
  }

  /**
   * Returns an `Optional` describing the given non-`null`
   * value.
   *
   * @apiNote
   * Though it may be tempting to do so, avoid testing if an object is empty by
   * comparing with `==` against instances returned by `Optional.empty()`,
   * use {@link isPresent} instead.
   *
   * @param value the value to describe, which must be non-`null`
   * @param <T> the type of the value
   * @return an `Optional` with the value present
   * @throws `InvalidValueException` if value is `null`
   */
  static of<T>(value: T): Optional<T> {
    const disallow = ['null', 'undefined'];

    return new Optional(value, disallow);
  }

  /**
   * Returns an `Optional` describing the given value, if
   * non-`null`, otherwise returns an empty `Optional`.
   *
   * @param value the possibly-`null` value to describe
   * @param <T> the type of the value
   * @return an `Optional` with a present value if the specified value
   *         is non-`null`, otherwise an empty `Optional`
   */
  static ofNullable<T>(value: Nullable<T>): Optional<T> {
    const typeConfig = ['null'];

    return new Optional<T>(value, typeConfig, typeConfig);
  }

  /**
   * Returns an `Optional` describing the given value, if
   * non-`undefined` or non-`null`, otherwise returns an empty `Optional`.
   *
   * @param value the possibly-`undefined` or `null` value to describe
   * @param <T> the type of the value
   * @return an `Optional` with a present value if the specified value
   *         is non-`null` and non-`undefined`, otherwise an empty `Optional`
   */
  static ofUndefinable<T>(value: OptionalValue<T>): Optional<NonNullable<T>> {
    const typeConfig = ['null', 'undefined'];

    return new Optional(value as NonNullable<T>, typeConfig, typeConfig);
  }

  /**
   * Returns an empty `Optional` instance.  No value is present for this
   * `Optional`.
   *
   * @param <T> The type of the non-existent value
   * @return an empty `Optional`
   */
  static empty<T>(): Optional<T> {
    const typeConfig = ['null', 'undefined'];
    return new Optional<T>(undefined, typeConfig, typeConfig);
  }

  /**
   * Returns a non-empty string representation of this `Optional`
   * suitable for debugging.  The exact presentation format is unspecified and
   * may vary between implementations and versions.
   *
   * @return the string representation of this instance
   */
  toString(): string {
    let stringValue = '.empty';

    if (this.value !== undefined && this.value !== null) {
      stringValue = `[${this.valueTrace}][${Object(this.value).toString()}]`;
    }

    return `Optional${stringValue}`;
  }

  /**
   * If a value is present, returns `true`, otherwise `false`.
   *
   * @return `true` if a value is present, otherwise `false`
   */
  isPresent(): boolean {
    const valueType = this.value === null ? 'null' : typeof this.value;

    return !this.invalidTypes.has(valueType);
  }

  /**
   * It checks if a value exists, if it can't validate it, it returns an exception domain.
   * @return wraps the data in a `Result`
   */
  validate(mapError: (value: OptionalValue<T>) => Result<T>): Result<T> {
    if (!this.isPresent()) return mapError(this.value);

    return Result.ok(this.getOrThrow());
  }

  /**
   * If a value is present, performs the given action with the value,
   * otherwise does nothing.
   *
   * @param action the action to be performed, if a value is present
   */
  ifPresent(action: (value: T) => void): void {
    if (this.isPresent()) {
      action(this.getOrThrow());
    }
  }

  /**
   * If a value is present, performs the given action with the value,
   * otherwise performs the given empty-based action.
   *
   * @param action the action to be performed, if a value is present
   * @param emptyAction the empty-based action to be performed, if no value is
   *        present
   */
  ifPresentOrElse<R, U>(action: (value: T) => R, emptyAction: () => U): R | U {
    if (this.isPresent()) {
      return action(this.getOrThrow());
    }
    return emptyAction();
  }

  validateIfPresent<U>(action: (value: T) => Result<U>): Result<U | undefined> {
    if (this.isPresent()) {
      return action(this.getOrThrow());
    }

    return Result.ok();
  }

  /**
   * If a value is present, returns the value, otherwise returns
   * `other`.
   *
   * @param other the value to be returned, if no value is present.
   *        May be `null`.
   * @return the value, if present, otherwise `other`
   */
  orElse(other: T): T {
    return this.isPresent() ? this.getOrThrow() : other;
  }

  /**
   * If a value is present, returns the value, otherwise returns the result
   * produced by the supplying function.
   *
   * @param supplier the supplying function that produces a value to be returned
   * @return the value, if present, otherwise the result produced by the
   *         supplying function
   */
  orElseGet(supplier: () => T): T {
    return this.isPresent() ? this.getOrThrow() : supplier();
  }

  /**
   * If a value is present, returns the value, otherwise throws an exception
   *
   * @param <X> Type of the exception to be thrown
   * @param error the exception to be thrown
   * @return the value, if present
   * @throws X if no value is present
   */
  orElseThrow<X extends Error>(error: X): T {
    if (!this.isPresent()) {
      throw error;
    }

    return this.getOrThrow();
  }

  /**
   * If a value is present, returns the value, otherwise throws
   * `InvalidValueException`.
   *
   * deprecated this is counter intuitive for `Optional`,
   * since it throws an error if the value is `null`, recommended to
   * use {@link isPresent} or {@link ifPresent}, etc instead
   * @return the non-`null` value described by this `Optional`
   * @throws `InvalidValueException` if no value is present
   */
  getOrThrow(): T {
    if (!this.isPresent()) {
      throw new InvalidValueException(this.valueTrace, 'Tried to get a value from an empty Optional');
    }

    return this.value as T;
  }

  /**
   * If a value is present, and the value matches the given predicate,
   * returns an `Optional` describing the value, otherwise returns an
   * empty `Optional`.
   *
   * @param predicate the predicate to apply to a value, if present
   * @return an `Optional` describing the value of this
   *         `Optional`, if a value is present and the value matches the
   *         given predicate, otherwise an empty `Optional`
   */
  filter<S extends T = T>(predicate: (value: T) => boolean): Optional<S> {
    if (this.isPresent() && predicate(this.getOrThrow())) {
      return this as unknown as Optional<S>;
    }

    return this.traced(undefined as unknown as S);
  }

  map<U>(mapper: (value: T, optional: Optional<T>) => U): Optional<U> {
    if (!this.isPresent()) {
      return this.traced(undefined as unknown as U);
    }

    const value = mapper(this.getOrThrow(), this);
    if (this.isTypeInvalid(value)) {
      return this.traced(undefined as unknown as U);
    }

    return this.mapToOptional(value);
  }

  toResult(): Result<OptionalValue<T>> {
    return Result.ok(this.value);
  }

  replaceIfEmpty(value: T): Optional<T> {
    if (!this.isPresent()) {
      return Optional.ofUndefinable(value);
    }

    return this;
  }

  getFromObject<R extends keyof T>(key: R): Optional<NonNullable<T[R]>> {
    if (!this.isPresent()) return this.traced(undefined as unknown as NonNullable<T[R]>, key.toString());

    return this.mapToOptional(this.getOrThrow()[key], key);
  }

  getFromObjectOrThrow<R extends keyof T>(key: R): NonNullable<T[R]> {
    const optional = this.getFromObject(key);
    return optional.getOrThrow();
  }

  private mapToOptional<R>(value: R): Optional<NonNullable<R>>;
  private mapToOptional<R extends keyof T>(value: T[R], key?: R): Optional<NonNullable<T[R]>>;
  private mapToOptional<R extends keyof T>(value: T[R], key?: R): Optional<NonNullable<T[R]>> {
    if (key) return this.traced(value as NonNullable<T[R]>, key.toString());

    const invalidTypes = Array.from(this.invalidTypes.values());
    const allowedInvalidTypes = Array.from(this.allowedInvalidTypes.values());
    return new Optional(value as NonNullable<T[R]>, invalidTypes, allowedInvalidTypes);
  }

  /**
   * If a value is present, returns the result of applying the given
   * `Optional`-bearing mapping function to the value, otherwise returns
   * an empty `Optional`.
   *
   * This method is similar to {@link map}, but the mapping
   * function is one whose result is already an `Optional`, and if
   * invoked, `flatMap` does not wrap it within an additional `Optional`.
   *
   * @param <U> The type of value of the `Optional` returned by the
   *            mapping function
   * @param mapper the mapping function to apply to a value, if present
   * @return the result of applying an `Optional`-bearing mapping
   *         function to the value of this `Optional`, if a value is
   *         present, otherwise an empty `Optional`
   */
  flatMap<U>(mapper: (value: T) => U): U | Optional<T> {
    if (!this.isPresent()) {
      return this.traced(undefined as unknown as T);
    }

    const value = mapper(this.getOrThrow());
    if (this.isTypeInvalid(value)) {
      return this.traced(undefined as unknown as T);
    }

    return value;
  }

  private isTypeInvalid<T>(value: OptionalValue<T>): boolean {
    const valueType = String(value) as JavascriptRepresentation;
    const isInvalidType = this.invalidTypes.has(valueType);
    const isNotWhiteListed = !this.allowedInvalidTypes.has(valueType);

    return isInvalidType && isNotWhiteListed;
  }
}
