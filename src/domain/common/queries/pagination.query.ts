import { Optional } from '@/domain/common';

import { SortQuery } from './sort.query';

export const DEFAULT_OFFSET = 0;
export const MIN_OFFSET = 0;
export const DEFAULT_LIMIT = 10;
export const MIN_LIMIT = 1;
export const MAX_LIMIT = 20;

export class PaginationQuery {
  protected constructor(
    public readonly offset: number,
    public readonly limit: number,
    public readonly sortBy: SortQuery[],
  ) {}

  withFields(allowedFields: string[]): PaginationQuery {
    return new PaginationQuery(
      this.offset,
      this.limit,
      this.sortBy.filter((sort) => allowedFields.includes(sort.field)),
    );
  }

  hasSortBy(): boolean {
    return this.sortBy.length > 0;
  }

  getSortObject(): Record<SortQuery['field'], SortQuery['order']> {
    return this.sortBy.reduce((acc, sort) => ({ ...acc, [sort.field]: sort.order }), {});
  }

  static create(
    offset: OptionalValue<string>,
    limit: OptionalValue<string>,
    sortBy: OptionalValue<string>,
  ): PaginationQuery {
    const resOffset = Optional.ofUndefinable(offset)
      .filter<string>(Boolean)
      .filter((value) => !isNaN(value as any))
      .map((value) => parseInt(value, 10))
      .map((value) => Math.max(value, MIN_OFFSET))
      .orElse(DEFAULT_OFFSET);

    const resLimit = Optional.ofUndefinable(limit)
      .filter<string>(Boolean)
      .filter((value) => !isNaN(value as any))
      .map((value) => parseInt(value, 10))
      .map((value) => Math.min(value, MAX_LIMIT))
      .map((value) => Math.max(value, MIN_LIMIT))
      .orElse(DEFAULT_LIMIT);

    const resSortBy = Optional.ofUndefinable(sortBy)
      .filter<string>(Boolean)
      .filter((value) => typeof value === 'string')
      .map((value) => value.trim())
      .map((value) => value.split(','))
      .map((value) => value.map((value) => SortQuery.create(value)))
      .map((sorts) => sorts.filter((sort): sort is SortQuery => Boolean(sort)))
      .orElse([]);

    return new PaginationQuery(resOffset, resLimit, resSortBy);
  }
}
