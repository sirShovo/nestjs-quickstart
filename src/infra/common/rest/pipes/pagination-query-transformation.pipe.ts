import { PaginationQuery } from '@/domain/common';

export class PaginationQueryTransformationPipe {
  transform(query: Record<string, string>) {
    return PaginationQuery.create(query.offset, query.limit, query.sort_by);
  }
}
