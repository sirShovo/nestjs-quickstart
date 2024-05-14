import { AggregateRoot } from '@nestjs/cqrs';

import { BadRequest, DomainErrorCode, Id, Result, Validator } from '@/domain/common';

import { UserDeletedEvent } from '../events';

const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 20;
export class User extends AggregateRoot {
  protected constructor(
    public readonly id: Id,
    private _name: string,
    private _email: string,
    private _profilePictureUrl: Nullable<string>,
    public readonly createdAt: Date,
    private _updatedAt?: Date,
    private _deletedAt?: Date,
    public readonly version?: number,
  ) {
    super();
  }

  public get name(): string {
    return this._name;
  }

  public get email(): string {
    return this._email;
  }

  public get updatedAt(): Undefinable<Date> {
    return this._updatedAt && new Date(this._updatedAt);
  }

  public get deletedAt(): Undefinable<Date> {
    return this._deletedAt && new Date(this._deletedAt);
  }

  public get profilePictureUrl(): Nullable<string> {
    return this._profilePictureUrl ?? null;
  }

  isActive(): boolean {
    return !Boolean(this._deletedAt);
  }

  updateEmail(email: string): Result<void> {
    return User.validateEmail(email)
      .onSuccess((validEmail) => {
        this._email = validEmail;
        this._updatedAt = new Date();
      })
      .flatMap(() => Result.ok());
  }

  updateName(name: string): Result<void> {
    return User.validateName(name)
      .onSuccess((validName) => {
        this._name = validName;
        this._updatedAt = new Date();
      })
      .flatMap(() => Result.ok());
  }

  updateProfilePictureUrl(profilePictureUrl: Nullable<string>): Result<void> {
    return User.validateProfilePictureUrl(profilePictureUrl)
      .onSuccess((validProfilePictureUrl) => {
        this._profilePictureUrl = validProfilePictureUrl;
        this._updatedAt = new Date();
      })
      .flatMap(() => Result.ok());
  }

  markAsDeleted(now = new Date()): Result<void> {
    if (this._deletedAt) return Result.fail(new BadRequest(DomainErrorCode.USER_ALREADY_DELETED));

    this._deletedAt = now;
    this.apply(new UserDeletedEvent(this.id.toString(), this.name, this.email, <Date>this.deletedAt));
    return Result.ok();
  }

  static create(id: Id, name: string, email: string, createdAt?: string): Result<User> {
    return Result.combine([this.validateName(name), this.validateEmail(email), this.validateCreatedAt(createdAt)]).map(
      ([validName, validEmail, validCreatedAt]) => new User(id, validName, validEmail, null, validCreatedAt),
    );
  }

  static validateName(name: string): Result<string> {
    return Validator.of(name)
      .required(() => new BadRequest(DomainErrorCode.USER_NAME_EMPTY))
      .string(() => new BadRequest(DomainErrorCode.USER_NAME_INVALID))
      .minLength(MIN_NAME_LENGTH, () => new BadRequest(DomainErrorCode.USER_NAME_TOO_SHORT))
      .maxLength(MAX_NAME_LENGTH, () => new BadRequest(DomainErrorCode.USER_NAME_TOO_LONG));
  }

  static validateEmail(email: string): Result<string> {
    return Validator.of(email)
      .required(() => new BadRequest(DomainErrorCode.USER_EMAIL_EMPTY))
      .email(() => new BadRequest(DomainErrorCode.USER_EMAIL_INVALID))
      .map((value) => value.toLowerCase());
  }

  static validateCreatedAt(createdAt = new Date().toISOString()): Result<Date> {
    return Validator.of(createdAt).datetime(() => new BadRequest(DomainErrorCode.USER_CREATED_AT_INVALID));
  }

  static validateProfilePictureUrl(profilePictureUrl: Nullable<string>): Result<Nullable<string>> {
    if (profilePictureUrl === null) return Result.ok(null);
    return Validator.of(profilePictureUrl).url(() => new BadRequest(DomainErrorCode.USER_PROFILE_PICTURE_URL_INVALID));
  }
}
