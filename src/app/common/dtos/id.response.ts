import { Id } from '@/domain/common';
import { ExposeId } from '@/infra/common/decorators';

export class IdResponse {
  @ExposeId()
  id: string;

  static fromId(id: Id): IdResponse {
    const response = new IdResponse();
    response.id = id.toString();
    return response;
  }
}
