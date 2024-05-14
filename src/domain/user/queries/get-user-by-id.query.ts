import { BadRequest, DomainErrorCode, Id, Result } from '@/domain/common';

export class GetUserByIdQuery {
  private constructor(public readonly id: Id) {}

  static create(id: OptionalValue<string>): Result<GetUserByIdQuery> {
    return Id.create(
      id,
      () => new BadRequest(DomainErrorCode.USER_ID_EMPTY),
      () => new BadRequest(DomainErrorCode.USER_ID_INVALID),
    ).map((id) => new GetUserByIdQuery(id));
  }
}
