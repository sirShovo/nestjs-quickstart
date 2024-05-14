import { BadRequest, DomainErrorCode, Id, Result } from '@/domain/common';

import { User } from '../entities';

export class UpdateUserCommand {
  private constructor(
    public readonly userId: Id,
    public readonly name?: string,
    public readonly email?: string,
    public readonly profilePictureUrl?: Nullable<string>,
  ) {}

  static create(
    userId: string,
    name?: string,
    email?: string,
    profilePictureUrl?: Nullable<string>,
  ): Result<UpdateUserCommand> {
    return Result.combine([
      Id.create(
        userId,
        () => new BadRequest(DomainErrorCode.USER_ID_EMPTY),
        () => new BadRequest(DomainErrorCode.USER_ID_INVALID),
      ),
      name !== undefined ? User.validateName(name) : Result.ok<undefined>(),
      email !== undefined ? User.validateEmail(email) : Result.ok<undefined>(),
      profilePictureUrl !== undefined ? User.validateProfilePictureUrl(profilePictureUrl) : Result.ok<undefined>(),
    ]).map((params) => new UpdateUserCommand(...params));
  }
}
