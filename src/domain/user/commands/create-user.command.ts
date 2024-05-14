import { BadRequest, DomainErrorCode, Id, Result } from '@/domain/common';

import { User } from '../entities';

export class CreateUserCommand {
  private constructor(
    public readonly id: Id,
    public readonly name: string,
    public readonly email: string,
    public readonly createdAt: Date,
  ) {}

  static create(id: string, name: string, email: string, createdAt?: string): Result<CreateUserCommand> {
    return Result.combine([
      Id.create(
        id,
        () => new BadRequest(DomainErrorCode.USER_ID_EMPTY),
        () => new BadRequest(DomainErrorCode.USER_ID_INVALID),
      ),
      User.validateName(name),
      User.validateEmail(email),
      User.validateCreatedAt(createdAt),
    ]).map((params) => new CreateUserCommand(...params));
  }
}
