export class ErrorCode {
  protected constructor(public readonly value: string, public readonly description: string) {}

  protected static of(value: string, description: string): ErrorCode {
    return new ErrorCode(value, description);
  }

  format(...args: string[]): string {
    const regex = /{(\d+)}/g;
    const matches = this.description.match(regex) || [];
    const hasExactArgs = matches.length === args.length;
    if (!hasExactArgs) {
      const message = `Not exact arguments for error code: ${this.value}. Expected ${matches.length} but got ${args.length}.`;
      throw new Error(message);
    }
    return this.description.replace(regex, (match, i) => (typeof args[i] === 'undefined' ? match : args[i]));
  }
}

export class DomainErrorCode extends ErrorCode {
  private constructor(value: string, description: string) {
    super(value, description);
  }
  // General errors
  static readonly NOT_FOUND = super.of('NOT_FOUND', '{0} not found for {1}.');

  // Errors related with user module
  static readonly USER_ID_EMPTY = super.of('USER_ID_EMPTY', 'User id is empty.');
  static readonly USER_ID_INVALID = super.of('USER_ID_INVALID', 'User id is invalid.');
  static readonly USER_NAME_EMPTY = super.of('USER_NAME_EMPTY', 'User name is empty.');
  static readonly USER_NAME_INVALID = super.of('USER_NAME_INVALID', 'User name is invalid.');
  static readonly USER_NAME_TOO_SHORT = super.of('USER_NAME_TOO_SHORT', 'User name is too short.');
  static readonly USER_NAME_TOO_LONG = super.of('USER_NAME_TOO_LONG', 'User name is too long.');
  static readonly USER_EMAIL_EMPTY = super.of('USER_EMAIL_EMPTY', 'User email is empty.');
  static readonly USER_EMAIL_INVALID = super.of('USER_EMAIL_INVALID', 'User email is invalid.');
  static readonly USER_CREATED_AT_INVALID = super.of('USER_CREATED_AT_INVALID', 'User created at field is invalid.');
  static readonly USER_PROFILE_PICTURE_URL_INVALID = super.of(
    'USER_PROFILE_PICTURE_URL_INVALID',
    'User profile picture url is invalid.',
  );
  static readonly USER_NO_UPDATE_FIELDS = super.of('USER_NO_UPDATE_FIELDS', 'No fields to update.');
  static readonly USER_DUPLICATED = super.of('USER_DUPLICATED', 'User already exists.');
  static readonly USER_ALREADY_DELETED = super.of('USER_ALREADY_DELETED', 'User already deleted.');
  static readonly USER_DELETED = super.of('USER_DELETED', 'User was deleted.');
}
