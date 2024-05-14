import { DomainError } from '../errors';
import { Result } from './result';
import { Validator } from './validator';

export class Id {
  private constructor(private readonly value: string) {}

  static load(value: string): Id {
    return new Id(value);
  }

  static create(
    value: OptionalValue<string>,
    emptyError: () => DomainError,
    invalidError: (id: string) => DomainError,
  ): Result<Id> {
    return Validator.of(value)
      .required(emptyError)
      .objectId(invalidError)
      .map((id) => new Id(id));
  }

  public equals(anotherId: Id): boolean {
    return this.toString() === anotherId.toString();
  }

  public toString(): string {
    return this.value;
  }
}
