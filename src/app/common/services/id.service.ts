import { Id } from '@/domain/common';

export interface IdService {
  generate(): Id;
}
