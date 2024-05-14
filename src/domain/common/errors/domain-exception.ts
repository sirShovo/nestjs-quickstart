import { DomainErrorCode } from './error-code';

/**
 * Base class for exceptions coming from the domain.
 */
export class DomainException extends Error {
  constructor(public readonly code: string, public readonly message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  is(code: DomainErrorCode): boolean {
    return this.code === code.value;
  }

  public toJSON(): object {
    return {
      code: this.code,
      message: this.message,
      stack: this.stack,
    };
  }
}

/**
 * This class is just a wrapper to differentiate between exception that can stop the flow of the program
 * and errors that need to be passed around. This is just conceptual or conventional.
 */
export class DomainError extends DomainException {
  protected constructor(code: string, message: string) {
    super(code, message);
  }

  static of(code: string, message: string): DomainError {
    return new DomainError(code, message);
  }
}

export class InvalidValueException extends DomainException {
  constructor(value: unknown, message?: string) {
    if (value === undefined || value === null) {
      value = typeof value;
    }

    if (message) {
      message = `${message} | `;
    }

    const valueString = JSON.stringify(value);
    super('INVALID_ARGUMENT_VALUE', `${message}Invalid value: ${valueString}`);
  }
}

export class OptimisticLockingException extends DomainException {
  constructor(message?: string) {
    message ??= 'Optimistic locking error';
    message ||= '[Empty message]';
    super('OPTIMISTIC_LOCKING', message);
  }
}
