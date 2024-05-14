import { Id } from '../types';
import { DomainError } from './domain-exception';
import { DomainErrorCode } from './error-code';

export class BadRequest extends DomainError {
  constructor(code: DomainErrorCode, ...args: unknown[]) {
    const values = args.map((arg = '[empty]') => JSON.stringify(arg).replace(/"/g, "'"));
    super(code.value, code.format(...values));
  }
}

export class NotFound extends DomainError {
  private constructor(message: string) {
    const code = DomainErrorCode.NOT_FOUND;
    super(code.value, message);
  }

  static of(entity: string | { name: string }, id: string | Id): NotFound {
    entity = typeof entity === 'string' ? entity : entity.name;
    id = typeof id === 'string' ? id : id.toString();

    const message = DomainErrorCode.NOT_FOUND.format(entity, id);
    return new NotFound(message);
  }

  static ofMessage(message: string): NotFound {
    return new NotFound(message);
  }
}

export class UserErrors extends DomainError {}

export class UserDuplicated extends UserErrors {
  constructor() {
    const code = DomainErrorCode.USER_DUPLICATED;
    super(code.value, code.description);
  }
}
