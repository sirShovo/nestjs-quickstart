import { map } from 'rxjs';

import { DomainError } from '@/domain/common/errors';
import { Validator } from '@/domain/common/types';

export const throwIfVoid = <T>(mapError: () => DomainError) =>
  map((value: T) => Validator.of(value).required(mapError).getOrThrow());
