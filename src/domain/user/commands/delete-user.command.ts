import { BadRequest, DomainErrorCode, Id, Result } from '@/domain/common';

export class DeleteUserCommand {
  private constructor(public readonly id: Id) {}

  static create(id: string): Result<DeleteUserCommand> {
    return Result.combine([
      Id.create(
        id,
        () => new BadRequest(DomainErrorCode.USER_ID_EMPTY),
        () => new BadRequest(DomainErrorCode.USER_ID_INVALID),
      ),
    ]).map((params) => new DeleteUserCommand(...params));
  }
}
