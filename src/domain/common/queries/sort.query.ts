import { Optional } from '../types';

export const enum SORT_ORDER {
  ASC = 'asc',
  DESC = 'desc',
}
export class SortQuery {
  private constructor(public readonly order: SORT_ORDER, public readonly field: string) {}

  static create(sort: OptionalValue<string>): Nullable<SortQuery> {
    const optionalSort = Optional.ofUndefinable(sort)
      .filter((value) => typeof value === 'string')
      .map((value) => value.trim())
      .filter((value) => SortQuery.isValidFormat(value))
      .map((value) => [value.slice(0, 1), value.slice(1)] as const);

    if (!optionalSort.isPresent()) return null;

    const [orderString, field] = optionalSort.getOrThrow();

    const order = orderString === '+' ? SORT_ORDER.ASC : SORT_ORDER.DESC;
    return new SortQuery(order, field);
  }

  static isValidFormat(sort: string): boolean {
    const regexFormat = /^(\+|\-)(\w+)$/;
    return regexFormat.test(sort);
  }
}
