import { Observable } from 'rxjs';

import { Id } from '@/domain/common';

import { User } from '../entities';

export interface UserRepository {
  createOne(user: User): Observable<void>;
  updateOne(user: User): Observable<void>;
  findById(id: Id): Observable<Nullable<User>>;
}
