import moment from 'moment';
import validator from 'validator';

import { BadRequest, DomainError, DomainErrorCode } from '../errors';
import { Optional } from './optional';
import { Result } from './result';

type MapErrorFunction<T> = (value?: T) => DomainError | DomainErrorCode;

const NULLISH_VALUES: OptionalValue<never>[] = [null, undefined];
type DomainErrorMapper = (code: DomainErrorCode) => DomainError;

type NullishValuesFrom<T> = Extract<T, OptionalValue<never>>;

const defaultErrorMapper: DomainErrorMapper = (code: DomainErrorCode): BadRequest => new BadRequest(code);
export class Validator<T> extends Result<T> {
  protected constructor(error?: Error, value?: T, private readonly errorMapper = defaultErrorMapper) {
    super(error, value);
  }
  /**
   * Creates a validator from a value it can be a Result instance, an Optional instace or the value itself.
   * @param value - The value to validate
   * @param errorMapper - A function that receives a DomainErrorCode and returns a DomainError
   * @default // A function that returns a BadRequest error
   * (code: DomainErrorCode) => new BadRequest(code)
   *
   * @returns A validator instance
   */

  static of<T>(value: Optional<T>, errorMapper?: DomainErrorMapper): Validator<OptionalValue<T>>;
  static of<T>(value: T | Result<T>, errorMapper?: DomainErrorMapper): Validator<T>;
  static of<T>(
    value: T | Optional<T> | Result<T>,
    errorMapper = defaultErrorMapper,
  ): Validator<T> | Validator<OptionalValue<T>> {
    if (value instanceof Result) return Validator.fromResult(value, errorMapper);
    if (value instanceof Optional) return Validator.fromResult(value.toResult(), errorMapper);

    return new Validator(undefined, value, errorMapper);
  }

  private static fromResult<T>(result: Result<T>, errorMapper: DomainErrorMapper): Validator<T> {
    const error = result.exceptionOrNull() || undefined;
    const value = result.isSuccess() ? result.getOrThrow() : undefined;
    return new Validator(error, value, errorMapper);
  }

  private mapErrorWrapper<T>(fn: MapErrorFunction<T>): (value?: T) => DomainError {
    return (value?: T) => {
      const errorOrCode = fn(value);
      if (errorOrCode instanceof DomainError) return errorOrCode;

      return this.errorMapper(errorOrCode);
    };
  }

  isPresent(): boolean {
    return this.isSuccess() && !NULLISH_VALUES.includes(<OptionalValue<never>>this.getOrThrow());
  }

  map<R>(mapper: (value: T) => R): Validator<R> {
    return Validator.of(super.map(mapper), this.errorMapper);
  }

  mapIfPresent<R>(mapper: (value: NonNullable<T>) => R): Validator<R | NullishValuesFrom<T>> {
    if (!this.isPresent()) return this as Validator<NullishValuesFrom<T>>;
    return Validator.of(super.map(mapper), this.errorMapper);
  }

  mapIfAbsent<R>(mapper: () => R): Validator<R | NonNullable<T>> {
    if (this.isPresent()) return this as Validator<NonNullable<T>>;
    return Validator.of(super.map(mapper), this.errorMapper);
  }

  validate<U = T, R = U | NullishValuesFrom<T>>(
    predicate: (value: NonNullable<T>) => boolean,
    mapError: MapErrorFunction<T>,
  ): Validator<R> {
    const result = super.validate(
      (value) => !this.isPresent() || predicate(<NonNullable<T>>value),
      this.mapErrorWrapper(mapError),
    );
    return Validator.of(result, this.errorMapper) as unknown as Validator<R>;
  }

  required(mapError: MapErrorFunction<T>): Validator<NonNullable<T>> {
    const result = super.validate(() => this.isPresent(), this.mapErrorWrapper(mapError));
    return Validator.of(result, this.errorMapper) as unknown as Validator<NonNullable<T>>;
  }

  string(mapError: MapErrorFunction<T>) {
    return this.validate<string>(
      (value) => typeof value === 'string' || value instanceof String,
      (value) => mapError(value),
    );
  }

  objectId(mapError: MapErrorFunction<T>) {
    return this.string(mapError).validate(
      (value) => /^[a-fA-F0-9]{24}$/.test(value),
      (value: T & string) => mapError(value),
    );
  }

  uuid(mapError: MapErrorFunction<T>) {
    return this.string(mapError).validate(
      (value) => validator.isUUID(value),
      (value: T & string) => mapError(value),
    );
  }

  numericString(mapError: MapErrorFunction<T>) {
    return this.string(mapError).validate(
      (value) => validator.isNumeric(value),
      (value: T & string) => mapError(value),
    );
  }

  countryCode2(mapError: MapErrorFunction<T>) {
    return this.string(mapError).validate(
      (value) => validator.isISO31661Alpha2(value),
      (value: T & string) => mapError(value),
    );
  }

  number(mapError: MapErrorFunction<T>) {
    return this.validate(
      (value) => this.isNumber(value),
      (value) => mapError(value),
    ).mapIfPresent((value) => Number(value));
  }

  minLength(minLength: number, mapError: MapErrorFunction<T>) {
    return this.validate(
      (value) => this.hasLength(value) && value.length >= minLength,
      (value) => mapError(value),
    );
  }

  maxLength(maxLength: number, mapError: MapErrorFunction<T>) {
    return this.validate(
      (value) => this.hasLength(value) && value.length <= maxLength,
      (value) => mapError(value),
    );
  }

  length(length: number, mapError: MapErrorFunction<T>) {
    return this.validate(
      (value) => this.hasLength(value) && value.length == length,
      (value) => mapError(value),
    );
  }

  min(min: number, mapError: MapErrorFunction<T>) {
    return this.number(mapError).validate<number>(
      (value) => value >= min,
      (value: T & number) => mapError(value),
    );
  }

  range(min: number, max: number, mapError: MapErrorFunction<T>) {
    return this.number(mapError).validate<number>(
      (value) => value >= min && value <= max,
      (value: T & number) => mapError(value),
    );
  }

  max(max: number, mapError: MapErrorFunction<T>) {
    return this.number(mapError).validate<number>(
      (value) => value <= max,
      (value: T & number) => mapError(value),
    );
  }

  date(mapError: MapErrorFunction<T>) {
    return this.validate(
      (value) => validator.isDate(String(value)),
      (value) => mapError(value),
    ).mapIfPresent((value) => new Date(String(value)));
  }

  time(mapError: MapErrorFunction<T>, validPatterns = ['HH:mm:ss', 'HH:mm:ssZ', 'HH:mm:ss.SSS', 'HH:mm:ss.SSSZ']) {
    return this.validate((value) => moment(String(value), validPatterns, true).isValid(), mapError);
  }

  datetime(mapError: MapErrorFunction<T>) {
    const getDateString = (value: T) => (value instanceof Date ? value.toISOString() : String(value));
    return this.validate<Date>(
      (value) => validator.isISO8601(getDateString(value), { strict: true, strictSeparator: true }),
      (value) => mapError(value),
    ).mapIfPresent((value) => <Date>(value ? new Date(String(value)) : value));
  }

  afterDate(date: Date, mapError: MapErrorFunction<T>) {
    return this.validate<Date>(
      (value) => value instanceof Date && value.getTime() > date.getTime(),
      (value) => mapError(value),
    );
  }

  url(mapError: MapErrorFunction<T>) {
    return this.validate<string>(
      (value) => validator.isURL(String(value)),
      (value) => mapError(value),
    );
  }

  email(mapError: MapErrorFunction<T>) {
    return this.validate<string>(
      (value) => validator.isEmail(String(value)),
      (value) => mapError(value),
    );
  }

  phone(mapError: MapErrorFunction<T>) {
    return this.validate<string>(
      (value) => validator.isMobilePhone(String(value)),
      (value) => mapError(value),
    );
  }

  enum<Enum extends object, EnumValue extends Enum[keyof Enum]>(enumObject: Enum, mapError: MapErrorFunction<T>) {
    return this.validate<EnumValue>(
      (value) => Object.values(enumObject).includes(value),
      (value) => mapError(value),
    );
  }

  boolean(mapError: MapErrorFunction<T>) {
    return this.validate<boolean>(
      (value) => typeof value === 'boolean',
      (value) => mapError(value),
    );
  }

  array<ArrayValue = T extends ArrayLike<infer U> ? U[] : never>(mapError: MapErrorFunction<T>) {
    return this.validate<ArrayValue>(
      (value) => Array.isArray(value),
      (value) => mapError(value),
    );
  }

  notEmpty(mapError: MapErrorFunction<T>, emptyLength = 1) {
    return this.minLength(emptyLength, mapError);
  }

  unique<Value = T extends ArrayLike<infer U> ? U : never, ArrayValue = T extends ArrayLike<infer U> ? U[] : never>(
    predicate: (value: Value) => any,
    mapError: MapErrorFunction<T>,
  ) {
    return this.array(mapError).validate<ArrayValue>(
      (value) => value.length === new Set(value.map(predicate)).size,
      (value) => mapError(<T>value),
    );
  }

  object(mapError: MapErrorFunction<T>) {
    return this.validate<T & object>(
      (value) => typeof value === 'object' && !Array.isArray(value) && value !== null,
      (value) => mapError(value),
    );
  }
  private hasLength(value: T & any): value is T & { length: number } {
    return value?.hasOwnProperty('length');
  }

  private isNumber(value: T & any): value is T & number {
    return !isNaN(parseFloat(value)) && !isNaN(Number(value));
  }
}
