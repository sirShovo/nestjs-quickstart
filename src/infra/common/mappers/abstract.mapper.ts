export abstract class AbstractMapper<From, To> {
  abstract map(from: From): To;
  abstract reverseMap(from: To): From;

  mapFromList(from: From[]): To[] {
    return from.map((item: From) => this.map(item));
  }

  reverseMapFromList(from: To[]): From[] {
    return from.map((item: To) => this.reverseMap(item));
  }
}
