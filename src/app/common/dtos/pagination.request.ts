import { Optional } from '@/domain/common';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT_PAGE = 10;
export class Pagination {
  static MAX_SIZE = 20;
  static MIN_SIZE = 1;
  static MIN_PAGE = 1;
  protected constructor(public readonly limit: number, public readonly page: number) {}

  public skip(): number {
    return this.limit * this.page - this.limit;
  }

  static create(limit: OptionalValue<string>, page: OptionalValue<string>): Pagination {
    const resLimit = Optional.ofUndefinable(limit)
      .filter<string>(Boolean)
      .filter((value) => !isNaN(value as any))
      .map((value) => parseInt(value, 10))
      .map((value) => Math.min(value, this.MAX_SIZE))
      .map((value) => Math.max(value, this.MIN_SIZE))
      .orElse(DEFAULT_LIMIT_PAGE);

    const resPage = Optional.ofUndefinable(page)
      .filter<string>(Boolean)
      .filter((value) => !isNaN(value as any))
      .map((value) => parseInt(value, 10))
      .map((value) => Math.max(value, this.MIN_PAGE))
      .orElse(DEFAULT_PAGE);

    return new Pagination(resLimit, resPage);
  }
}
