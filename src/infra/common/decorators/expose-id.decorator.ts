import { Expose, ExposeOptions, Transform } from 'class-transformer';

export const ExposeId = (options?: ExposeOptions) => (target: object, propertyKey: string) => {
  Expose(options)(target, propertyKey);
  Transform(({ obj }) => obj[options?.name || propertyKey]?.toString())(target, propertyKey);
};
